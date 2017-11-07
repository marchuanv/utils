const utils = require('./utils.js');
const logging = require('./logging.js');

logging.condition(function(message){
   if(message.indexOf('heartbeat')>=0){
     return false;
   }
   return true;
});

function MessageBus(messageBusService){
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

  	this.receiveRoutingMessage=function(message){
		getSubscriptions.apply(this, ['routing', function(routingSubscription){
			routingSubscription.callback(message);
			logging.write(`handing message to routing mechanism`);
		}]);
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
	utils.readJsonFile('messages.json', function(existingMessages) {
            if (!existingMessages) {
                existingMessages.push(message);
                utils.replaceJsonFile('messages.json', existingMessages);
            } else {
                utils.replaceJsonFile('messages.json', [message]);
            }
        });
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
  	 		to: process.env.remoteserveraddress,
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
