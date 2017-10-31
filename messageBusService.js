const utils = require('./utils.js');
const logging = require('./logging.js');
const MessageBus = require('./messageBus.js');
function MessageBusService(thisServerAddress, messageBusProcess, messageSendRetryMax, isHost){
	const messageQueue=[];
	const messageQueueManager=utils.createTimer(true, `publish message queue manager `);
	this.messageBus = new MessageBus(
		thisServerAddress, 
		this, 
		isHost
	);
	const thisService=this;

	if (isHost==true){
		const port= utils.getHostAndPortFromUrl(thisServerAddress).port;
		utils.receiveHttpRequest(port, function requestReceived(message){
			message.external=true;
			if (message.publish==true){
				logging.write('pushing internal message onto message queue');
				messageQueue.push(message);
			}
		});
	}
	messageBusProcess.on('message', (message) => {
		message.from=thisServerAddress;
		message.external=false;
		if (message.publish==true){
			logging.write('pushing external message onto message queue');
			messageQueue.push(message);
		}
	});
	messageQueueManager.start(function(){
		while(messageQueue.length > 0){
			const message=messageQueue.splice(0, 1)[0];
			if (message.external==false){
				console.log('dequeuing internal message');
				thisService.messageBus.receiveInternalPublishMessage(message);
			}
			if (message.external==true){
				console.log('dequeuing external message');
				thisService.messageBus.receiveExternalPublishMessage(message);
			}
		};
	});

	this.sendInternalMessage=function(message, callback, callbackFail){
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
	this.sendExternalMessage=function(message, callback, callbackFail){
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