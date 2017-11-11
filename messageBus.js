const utils = require('./utils.js');
const logging = require('./logging.js');

function MessageBus(messageBusService, serviceFileName, canReplay, messageStore){

	const thisService=this;
	var subscriptions=[];
	function getSubscriptions(channel, userId, callback, callbackFail){
  		var exists=false;
  		for (var i = subscriptions.length - 1; i >= 0; i--) {
  			const msg=subscriptions[i];
  			if (msg.channel==channel && msg.userId==userId) {
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
  		function purgeSubscription(backupMessages){
        	messageStore.purge();
  		};
  		function replaySubscription(backupMessages){
			logging.write(`subscription count ${subscriptions.length}`);
			subscriptions=[];
			thisService.subscribe('replay', 10, replaySubscription);
			thisService.subscribe('purge', 10, purgeSubscription);
			resubscribe(function ready(){
				logging.write(`subscription count ${subscriptions.length}`);
	  			if (canReplay==true){
	  				messageStore.load(function(messages){
	  					var replayMessages=messages;
	  					if (replayMessages.length==0 && backupMessages.length > 0){
	  						replayMessages=backupMessages;
	  					}
						logging.write('');
						logging.write('///////////////////////// REPUBLISHING MESSAGES ///////////////////////');
						logging.write('messages: ',replayMessages);
						messageStore.purge();
						republish(replayMessages);
						logging.write('');
	  				});
				}
			});
  		};
		this.subscribe('replay', 10, replaySubscription);
  		this.subscribe('purge', 10, purgeSubscription);
  		resubscribe(function(){
  			logging.write(`initial start`);
  		});
  	};

  	this.receiveInternalPublishMessage=function(message){
		logging.write('');
		logging.write(`/// RECEIVED AN INTERNAL PUBLISH MESSAGE ON CHANNEL: ${message.channel} ///`, message);
		getSubscriptions.apply(this, [message.channel, message.userId, function(subscription){
			for (var i = subscription.callbacks.length - 1; i >= 0; i--) {
				logging.write(`callbacks on channel: ${message.channel} for user: ${message.userId}`);
				const callback=subscription.callbacks[i];
				callback(message.data, message.userId, function unsubscribe(){
					subscription.callbacks.splice(i,1);
					logging.write(`${message.userId} has unsubscribed to ${message.channel}`);
				});
			};
		},function notFound(){
			logging.write(`/// NO SUBSCRIPTIONS FOUND FOR: ${message.channel}, USER: ${message.userId} ///`);		
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
  		logging.write(`/// PUBLISHING TO: ${channel} AS USER: ${userId} ///`);
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

  	this.subscribe=function(channel, userId, callback){
  		logging.write('');
  		logging.write(`/// SUBSCRIBING TO: ${channel} AS USER: ${userId} ///`);
		getSubscriptions(channel, userId, function(subscription){
			subscription.callbacks.push(callback);
		},function notFound(){
			subscriptions.push({
				channel: channel,
				userId: userId,
				callbacks: [callback]
			});
		});
  		logging.write('');
  	};
};
module.exports=MessageBus;
