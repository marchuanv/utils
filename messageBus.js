const utils = require('./utils.js');
const logging = require('./logging.js');

function MessageBus(messageBusService, serviceFileName, canReplay, messageStore){

	const thisService=this;
	var subscriptions=[];
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
	
	function republish(messages){
		while(messages.length > 0) {
		    const msg=messages.splice(0, 1)[0];
			messageBusService.sendExternalPublishMessage(msg, function complete(){
				republish(messages);				
			});
			return;
		};
	};
	
  	this.app=function(resubscribe){
  		function purgeSubscription(){
        	messageStore.purge();
  		};
  		function replaySubscription(){
			logging.write(`subscription count ${subscriptions.length}`);
			subscriptions=[];
			thisService.subscribe('replay', replaySubscription);
			thisService.subscribe('purge', purgeSubscription);
			resubscribe(function ready(){
				logging.write(`subscription count ${subscriptions.length}`);
	  			if (canReplay==true){
	  				messageStore.load(function(messages){
						logging.write('');
						logging.write('///////////////////////// REPUBLISHING MESSAGES ///////////////////////');
						logging.write('messages: ',messages);
						messageStore.purge();
						republish(messages);
						logging.write('');
	  				});
				}
			});
  		};
		this.subscribe('replay', replaySubscription);
  		this.subscribe('purge', purgeSubscription);
  		resubscribe(function(){
  			console.log('initial startup');
  		});
  	};

  	this.receiveInternalPublishMessage=function(message){
		logging.write('');
		logging.write(`/// RECEIVED AN INTERNAL PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`);
		getSubscriptions.apply(this, [message.channel, function(subscription){
			for (var i = subscription.callbacks.length - 1; i >= 0; i--) {
				logging.write(`calling ${message.channel} channel subscribers callbacks.`);
				const callback=subscription.callbacks[i];
				callback(message.data, message.userId, function unsubscribe(){
					subscription.callbacks.splice(i,1);
					console.log('client has unsubscribed');
				});
			};
		},function notFound(){
			logging.write(`/// RECEIVED INTERNAL PUBLISH MESSAGE DID NOT HAVE ANY SUBSCRIPTIONS ${message.channel} ///`);		
		}]);
		logging.write('');
	};

	this.receiveExternalPublishMessage=function(message){
		
		logging.write('');		
		logging.write(`/// RECEIVED AN EXTERNAL PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`);
		messageBusService.sendInternalPublishMessage(message, function(){
			logging.write('external message was sent internally');
		});
		logging.write('');
	};

	this.publish=function(channel, userId, data) {
  		logging.write('');
  		logging.write(`/// PUBLISHING TO ${channel} ///`);
		messageBusService.sendExternalPublishMessage({
			id: utils.newGuid(),
			channel: channel,
  	 		from: process.env.thisserveraddress,
			date: new Date(),
			userId: userId,
  	 		data: data
  	 	});
  	 	logging.write('');
  	};

  	this.subscribe=function(channel, callback){
  		logging.write('');
  		logging.write(`/// SUBSCRIBING TO ${channel} ///`);
		getSubscriptions(channel, function(subscription){
			subscription.callbacks.push(callback);
		},function notFound(){
			subscriptions.push({
				channel: channel,
				callbacks: [callback]
			});
		});
  		logging.write('');
  	};
};
module.exports=MessageBus;
