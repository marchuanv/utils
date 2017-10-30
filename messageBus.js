const utils = require('./utils.js');
const logging = require('./logging.js');
function MessageBus(name, thisServerAddress, receivePublishMessage, receiveSubscribeMessage, sendInternalMessage, sendExternalMessage, isClient){

	const subscriptions=[];
	function getSubscriptions(channel, callback, callbackFail){
  		var exists=false;
  		for (var i = subscriptions.length - 1; i >= 0; i--) {
  			const msg=subscriptions[i];
  			if ( (channel && msg.channel==channel) || (!channel)) {
				callback(msg);
				exists=true;
				break;
  			}
  		};
  		if (!exists && callbackFail){
  			callbackFail();
  		}
  	};

	receivePublishMessage(function(message){
		logging.write('');
		logging.write(`/// ${name} RECEIVED A PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`);
		if (isClient==true) {
			getSubscriptions(message.channel, function(subscription){
				subscription.data=message.data;
				logging.write(`calling  ${message.channel} channel subscribers callbacks.`);
				subscription.callback(subscription.data);
			});
		}else{
			getSubscriptions(message.channel, function(subscription){
				subscription.data=message.data;
				sendInternalMessage(subscription);
			});
			if (message.from==thisServerAddress && message.source=='internal'){ //if publish message and was not published from a remote location then it is an outgoing message
				sendExternalMessage(message);
			}else{
				logging.write('did not publish anything');
			}
		}
		logging.write('');
	});

	receiveSubscribeMessage(function(message){
		logging.write('');
		logging.write(`/// ${name} RECEIVED A SUBSCRIBE MESSAGE ///`);
		logging.write(`handling subscription to channel: ${message.channel}.`);
		getSubscriptions(message.channel, function(subscription){
			logging.write(`already subscribed to ${subscription.channel} channel.`);
		},function(){
			logging.write(`subscribing to ${message.channel} channel.`);
			subscriptions.push(message);
		});
		logging.write('');
	});

	this.publish=function(channel, recipientAddress, data) {
		if (isClient==false){
  			throw 'only clients can publish, message bus is configured for processing only';
  		}
  		logging.write();
  		logging.write(`/// ${name} IS PUBLISHING TO ${channel} ///`);
  		const changedData=utils.removeUnserialisableFields(data);
		sendInternalMessage({
			Id: utils.newGuid(),
			channel: channel,
			publish: true,
  	 		to: recipientAddress,
  	 		data: changedData,
  	 		error: ""
  	 	});
  	 	logging.write();
  	};

  	this.subscribe=function(channel, callback){
  		if (isClient==false){
  			throw 'only clients can subscribe, message bus is configured for processing only';
  		}
  		logging.write();
  		logging.write(`/// ${name} IS SUBSCRIBING TO ${channel} ///`);
  		const message = {
  			Id: utils.newGuid(),
			channel: channel,
			callback: callback,
			publish: false,
			to: thisServerAddress,
			error: ""
  		};
  		//get all local subscriptions and add them if they don't exist.
		getSubscriptions(message.channel, function(subscription){
			subscription.callback=callback;
		},function notFound(){
			logging.write('adding client side subscriptions');
			subscriptions.push(message);
		});
  		sendInternalMessage(message);
  		logging.write();
  	};
};
module.exports=MessageBus;