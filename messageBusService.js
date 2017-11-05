const utils = require('./utils.js');
const logging = require('./logging.js');
const MessageBus = require('./messageBus.js');

logging.condition(function(message){
   if(message.indexOf('heartbeat')>=0){
     return false;
   }
   return true;
});

function MessageBusService(routingMode, messageBusProcess, messageSendRetryMax, isHost){
	
	this.messageBus = new MessageBus(this);
	const thisService=this;

	if (isHost==true){
		const port= utils.getHostAndPortFromUrl(process.env.thisserveraddress).port;
		utils.receiveHttpRequest(port, function requestReceived(receiveMessage){
			if (receiveMessage.data && receiveMessage.channel){
				thisService.messageBus.receiveExternalPublishMessage(receiveMessage);
			}else{
				logging.write('received http message structure is wrong.');
			}
		});
	}
	messageBusProcess.on('message', (receiveMessage) => {
		if (routingMode==true){
			console.log('internal message will be sent to routing subscription');
			thisService.messageBus.receiveRoutingMessage(receiveMessage);
		}else{
			thisService.messageBus.receiveInternalPublishMessage(receiveMessage);
		}
	});

	this.sendInternalPublishMessage=function(message, callback, callbackFail){
		logging.write(`sending internal message to ${message.channel} channel.`);
		const result=messageBusProcess.send(message);	
		if (result==true){
			callback();
		}else{
			if (callbackFail){
				callbackFail();
			}else{
				logging.write(`failed to notify parent process`);
			}
		}
	};
	this.sendExternalPublishMessage=function(message, callback, callbackFail){
		if (message.to && utils.isValidUrl(message.to)==true) {
			logging.write(`notifying remote subscriptions at ${message.to}`);
			utils.sendHttpRequest(message.to, message, '', function sucess(){
				callback();
			},function fail(){
				var retryCounter=0;
				const serviceUnavailableRetry = utils.createTimer(true, `${message.channel} retrying`);
				serviceUnavailableRetry.setTime(5000);
				serviceUnavailableRetry.start(function(){
					logging.write(`retry: sending message to ${message.to} on channel #{message.channel}`);
					utils.sendHttpRequest(message.to, message, '', function success(){
						callback();
						serviceUnavailableRetry.stop();
					},function fail(){
						if (retryCounter > messageSendRetryMax){
							if (callbackFail){
								callbackFail();
							}else{
								logging.write(`retry limit of ${messageSendRetryMax} has been reached, stopping retry`);
							}
							serviceUnavailableRetry.stop();
						}
						retryCounter++;
					});
				});
			});
		}else{
			if (callbackFail){
				callbackFail();
			}else{
				logging.write(`can't send a message that does not have a to address.`);
			}
		}
	};
};
module.exports=MessageBusService;
