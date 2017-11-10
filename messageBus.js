const utils = require('./utils.js');
const logging = require('./logging.js');

function MessageBus(messageBusService, serviceFileName, privatekey, canReplay){

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
			messageBusService.sendExternalPublishMessage(msg,function complete(){
				republish(messages);				
			});
			return;
		};
	};
	
  	this.app=function(resubscribe){
  		function purgeSubscription(){
        	utils.clearGoogleDriveData(privatekey, serviceFileName);
		    utils.uploadGoogleDriveData(privatekey, serviceFileName, []);
  		};
  		function replaySubscription(){
			logging.write(`subscription count ${subscriptions.length}`);
			subscriptions=[];
			thisService.subscribe('replay', replaySubscription);
			thisService.subscribe('purge', purgeSubscription);
			resubscribe(function ready(){
				logging.write(`subscription count ${subscriptions.length}`);
	  			if (canReplay==true){
					utils.downloadGoogleDriveData(privatekey, serviceFileName, function found(messages) {
						messages.sort(function(x,y){
						    return y.date-x.date;
						});
						logging.write('');
						logging.write('///////////////////////// REPUBLISHING MESSAGES ///////////////////////');
						logging.write('messages: ',messages);
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
		logging.write(`/// RECEIVED AN INTERNAL PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`, message);
		getSubscriptions.apply(this, [message.channel, function(subscription){
			subscription.callback(message.data, message.userId);
			logging.write(`calling ${message.channel} channel subscribers callbacks.`);
		}]);
		logging.write('');
	};

	this.receiveExternalPublishMessage=function(message){
		
		logging.write('');		
		logging.write(`/// RECEIVED AN EXTERNAL PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`, message);
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
  		const message={
			channel: channel,
			callback: callback
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
			subscriptions.splice(index, 1);
			callback();
		}, callbackFail);
  	};
};
module.exports=MessageBus;
