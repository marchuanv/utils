const utils = require('./utils.js');
const logging = require('./logging.js');
function MessageBus(thisServerAddress, messageRoutingAddress, messageBusService){
	const subscriptions=[];
	function getSubscriptions(channel, callback, callbackFail){
  		var exists=false;
  		for (var i = subscriptions.length - 1; i >= 0; i--) {
  			const msg=subscriptions[i];
  			if ( (channel && msg.channel==channel) || (!channel)) {
				callback(msg, i);
				exists=true;
				break;
  			}
  		};
  		if (!exists && callbackFail){
  			callbackFail();
  		}
  	};

  	this.receiveInternalPublishMessage=function(message){
		logging.write('');
		logging.write(`/// RECEIVED AN INTERNAL PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`);
		logging.write(`subscription count ${subscriptions.length}`);
		getSubscriptions.apply(this, [message.channel, function(subscription){
			if (subscription.callback){
				subscription.data=message.data;
				subscription.callback(subscription.data);
				logging.write(`calling ${message.channel} channel subscribers callbacks.`);
			}else{
				logging.write(`subscription for ${subscription.channel} does not have a callback.`);
			}
		}]);
		logging.write('');
	};

	this.receiveExternalPublishMessage=function(message){
		logging.write('');
		logging.write(`/// RECEIVED AN EXTERNAL PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`);
		messageBusService.sendInternalMessage(message, function(){
			console.log('external message was sent internally');
		});
		logging.write('');
	};

	this.receiveInternalSubscribeMessage=function(message){
		logging.write('');
		logging.write(`/// RECEIVED A SUBSCRIBE MESSAGE ///`);
		logging.write(`handling subscription to channel: ${message.channel}.`);
		getSubscriptions(message.channel, function(subscription){
			logging.write(`already subscribed to ${subscription.channel} channel.`);
		},function(){
			logging.write(`subscribing to ${message.channel} channel.`);
			subscriptions.push(message);
		});
		logging.write('');
	};

	this.publish=function(channel, data) {
  		logging.write('');
  		logging.write(`/// PUBLISHING TO ${channel} ///`);
  		const changedData=utils.removeUnserialisableFields(data);
		messageBusService.sendExternalMessage({
			Id: utils.newGuid(),
			channel: channel,
			publish: true,
  	 		to: messageRoutingAddress,
  	 		data: changedData,
  	 		error: ""
  	 	});
  	 	logging.write('');
  	};

  	this.subscribe=function(channel, callback){
  		logging.write('');
  		logging.write(`/// SUBSCRIBING TO ${channel} ///`);
  		const message={
  			Id: 		utils.newGuid(),
			channel: 	channel,
			callback: 	callback,
			publish: 	false,
			to: 		thisServerAddress,
			error: 		""
  		};
  		//get all local subscriptions and add them if they don't exist.
		getSubscriptions(message.channel, function(subscription){
			subscription.callback=callback;
		},function notFound(){
			logging.write('adding client side subscriptions');
			subscriptions.push(message);
		});
  		logging.write('');
  	};

  	this.unsubscribe=function(channel, callback, callbackFail){
  		getSubscriptions(channel, function(subscription, index){
  			if (subscription.to==thisServerAddress){
				subscriptions.splice(index, 1);
				callback();
  			}
		}, callbackFail);
  	};
};
module.exports=MessageBus;