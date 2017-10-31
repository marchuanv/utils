const utils = require('./utils.js');
const logging = require('./logging.js');
const MessageBus = require('./messageBus.js');
function MessageBusService(thisServerAddress, messageBusProcess, messageSendRetryMax){

	const publishMessageQueue=[];
	const subscribeMessageQueue=[];
	
	const publishQueueManager=utils.createTimer(`publish message queue manager `);
	const subscribeQueueManager=utils.createTimer(`subscribe message queue manager `);

	const messageBus = new MessageBus(thisServerAddress, this);

	const port= utils.getHostAndPortFromUrl(thisServerAddress).port;
	const httpServerStarted=true;
	const thisInstance=this;

	function queueMessage(message){
		if (message.publish==true){
			publishMessageQueue.push(message);
		}else if (message.publish==false){
			subscribeMessageQueue.push(message);
		}
	};

	utils.receiveHttpRequest(port, function requestReceived(message){
		message.external=false;
		queueMessage(message);
	});
	
	messageBusProcess.on('message', (message) => {
		message.from=thisServerAddress;
		message.external=true;
		queueMessage(message);
	});

	publishQueueManager.start(function(){
		while(publishMessageQueue.length > 0){
			const message=publishMessageQueue.splice(0, 1);
			if (message.external==false){
				messageBus.receiveInternalPublishMessage(message);
			}
			if (message.external==true){
				messageBus.receiveExternalPublishMessage(message);
			}
		};
	});

	subscribeQueueManager.start(function(){
		while(subscribeMessageQueue.length > 0){
			const message=subscribeMessageQueue.splice(0, 1);
			if (message.external==false){
				messageBus.receiveInternalSubscribeMessage(message);
			}
		};
	});

	this.sendInternalMessage=function(message, callback, callbackFail){
		logging.write(`sending internal message to ${message.channel} channel.`);
		const result=messageBusProcess.send(message);	
		if (result==false){
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
				const serviceUnavailableRetry = utils.createTimer(`${message.channel} retrying`);
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