const utils = require('./utils.js');

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
		console.log('');
		console.log(`/// ${name} RECEIVED A PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`);
		getSubscriptions(message.channel, function(subscription){
			subscription.data=message.data;
			if (isClient==true){
				console.log(`publishing message data to ${message.channel} channel subscribers.`);
				subscription.callback(subscription.data);
			}else{
				console.log(`sending message internally to ${message.channel} channel.`);
				sendInternalMessage(subscription);
			}
		});
		if (isClient==false && message.from==thisServerAddress && message.source=='internal'){ //if publish message and was not published from a remote location then it is an outgoing message
			sendExternalMessage(message);
		}else{
			console.log('message: ', message);
		}
		console.log('');
	});

	receiveSubscribeMessage(function(message){
		console.log('');
		console.log(`/// ${name} RECEIVED A SUBSCRIBE MESSAGE ///`);
		console.log(`handling subscription to channel: ${message.channel}.`);
		getSubscriptions(message.channel, function(subscription){
			console.log(`already subscribed to ${subscription.channel} channel.`);
		},function(){
			console.log(`subscribing to ${message.channel} channel.`);
			subscriptions.push(message);
		});
		console.log('');
	});

	this.publish=function(channel, recipientAddress, data) {
		if (isClient==false){
  			throw 'only clients can publish, message bus is configured for processing only';
  		}
  		console.log();
  		console.log(`/// ${name} IS PUBLISHING TO ${channel} ///`);
  		const changedData=utils.removeUnserialisableFields(data);
		sendInternalMessage({
			Id: utils.newGuid(),
			channel: channel,
			publish: true,
  	 		to: recipientAddress,
  	 		data: changedData,
  	 		error: ""
  	 	});
  	 	console.log();
  	};

  	this.subscribe=function(channel, callback){
  		if (isClient==false){
  			throw 'only clients can subscribe, message bus is configured for processing only';
  		}
  		console.log();
  		console.log(`/// ${name} IS SUBSCRIBING TO ${channel} ///`);
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
			console.log('adding client side subscriptions');
			subscriptions.push(message);
		});
  		sendInternalMessage(message);
  		console.log();
  	};
};
module.exports=MessageBus;