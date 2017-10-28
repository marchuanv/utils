const utils = require('./utils.js');

function MessageBus(name, thisServerAddress, receiveMessage, sendMessage, isClient){

	const subscriptions=[];
	function getSubscriptions(channel, to, callback, callbackFail){
  		var exists=false;
  		for (var i = subscriptions.length - 1; i >= 0; i--) {
  			const msg=subscriptions[i];
  			if ( (channel && to && msg.channel==channel && msg.to==to)
  					|| (!channel && to && msg.to==to)
  					|| (channel && !to && msg.channel==channel))
  			{
				callback(msg);
				exists=true;
				break;
  			}
  		};
  		if (!exists && callbackFail){
  			callbackFail();
  		}
  	};

	receiveMessage(function(message){
		console.log('');
		console.log(`/// ${name} RECEIVED A MESSAGE ///`);
		if (message.publish==true) {
			console.log(`publishing messages to the ${message.channel} channel.`);
			getSubscriptions(message.channel, null, function(subscription){
				if (isClient==true){
					subscription.callback(message.data);
				}else{
					sendMessage(message);
				}
			});
		} else if (message.publish==false){
			console.log(`handling subscription to channel: ${message.channel}, recipient: ${message.to}`);
			getSubscriptions(message.channel, message.to, function(subscription){
				console.log(`already subscribed to ${subscription.channel} channel at ${subscription.to}.`);
			},function(){
				console.log(`subscription to ${message.channel} channel at ${message.to} succesful.`);
				subscriptions.push(message);
			});
		} else {
			console.log(`message was not a subscription or publish`);
		}
		console.log('');
	});

	this.publish=function(channel, recipientAddress, data) {
		if (isClient==false){
  			throw 'only clients can publish, message bus is configured for processing only';
  		}
  		console.log();
  		console.log(`/// ${name} IS PUBLISHING TO ${channel} ///`);
  		const changedData=utils.removeUnserialisableFields(data);
		sendMessage({
			channel: channel,
			publish: true,
  	 		data: changedData,
  	 		to: recipientAddress,
  	 		error: ""
  	 	});
  	 	console.log();
  	};

  	this.subscribe=function(channel, recipientAddress, callback){
  		if (isClient==false){
  			throw 'only clients can subscribe, message bus is configured for processing only';
  		}
  		console.log();
  		console.log(`/// ${name} IS SUBSCRIBING TO ${channel} ///`);
  		const message = {
			channel: channel,
			callback: callback,
			publish: false,
			to: recipientAddress,
			error: ""
  		};
  		//get all local subscriptions and add them if they don't exist.
		getSubscriptions(message.channel, recipientAddress, function(subscription){
			subscription.callback=callback;
		},function notFound(){
			subscriptions.push(message);
		});
  		sendMessage(message);
  		console.log();
  	};
};
module.exports=MessageBus;