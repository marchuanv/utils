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
		messageBusService.sendInternalPublishMessage(message, function(){
			console.log('external message was sent internally');
		});
		logging.write('');
	};

	this.publish=function(channel, data) {
  		logging.write('');
  		logging.write(`/// PUBLISHING TO ${channel} ///`);
  		const changedData=utils.removeUnserialisableFields(data);
		messageBusService.sendExternalPublishMessage({
			Id: utils.newGuid(),
			channel: channel,
  	 		to: messageRoutingAddress,
  	 		from: thisServerAddress,
  	 		data: changedData
  	 	});
  	 	logging.write('');
  	};

  	this.subscribe=function(channel, callback){
  		logging.write('');
  		logging.write(`/// SUBSCRIBING TO ${channel} ///`);
  		const message={
  			Id: 		utils.newGuid(),
			channel: 	channel,
			callback: 	callback
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