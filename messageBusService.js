const utils = require('./utils.js');
const logging = require('./logging.js');
const MessageBus = require('./messageBus.js');
function MessageBusService(thisServerAddress, messageRoutingAddress, messageBusProcess, messageSendRetryMax, isHost){
	
	this.messageBus = new MessageBus(
		thisServerAddress,
		messageRoutingAddress,
		this
	);
	const thisService=this;

	if (isHost==true){
		const port= utils.getHostAndPortFromUrl(thisServerAddress).port;
		utils.receiveHttpRequest(port, function requestReceived(receiveMessage){
			if (receiveMessage.data && receiveMessage.channel){
				logging.write('pushing internal publish message onto message queue');
				thisService.messageBus.receiveExternalPublishMessage(receiveMessage);
			}else{
				logging.write('received http message structure is wrong.');
			}
		});
	}
	messageBusProcess.on('message', (receiveMessage) => {
		logging.write('pushing external publish message onto message queue');
		thisService.messageBus.receiveInternalPublishMessage(receiveMessage);
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
					logging.write('external message retry...');
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