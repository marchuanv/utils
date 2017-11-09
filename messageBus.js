const utils = require('./utils.js');
const logging = require('./logging.js');

function MessageBus(messageBusService){

	var restartCallback;
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

  	this.app=function(start){
  		this.subscribe('replay', start);
  		start();
  	};

  	this.receiveInternalPublishMessage=function(message){
		logging.write('');
		logging.write(`/// RECEIVED AN INTERNAL PUBLISH MESSAGE ON CHANNEL ${message.channel} ///`, message);
		logging.write(`subscription count ${subscriptions.length}`);
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
			channel: channel,
  	 		from: process.env.thisserveraddress,
			date:(new Date()).toString(),
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
