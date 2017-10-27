const utils = require('./utils.js')

function MessageBusManager(){

	const resendTimer=utils.createTimer(true,"requeue timer");
	const heartbeatTimer=utils.createTimer(true, 'HeartBeat');
	const subscriberRestartTimer=utils.createTimer(true, 'publish message bus restart ');
	const publisherRestartTimer=utils.createTimer(true, 'subscriber message bus restart ');

	const localPublishMessages=[];
	const localSubscribeMessages=[];
	const thisInstance=this;

	var messageBusPublisher=utils.createMessageBus();
	var messageBusSubscriber=utils.createMessageBus();

  	function createAndRestartMessageBus(restartTimer, reason, err, childProcess, callback){
		console.log(`/// PROCESS TERMINATED: ${reason} ${err} ///`);
		if (restartTimer.started==false){
			childProcess.kill()
			childProcess.unref();
			restartTimer.start(function() {
				callback();
				restartTimer.stop();
			});
		}
  	};

	utils.subscribeToProcessEvents(messageBusPublisher,function(reason, error){
		console.log(`messageBusPublisher failed ${reason} ${error}`);
		createAndRestartMessageBus(publisherRestartTimer, reason, error, messageBusSubscriber, function restart(){
			console.log('');
			console.log(`///  RESTARTING THE PUBLISHER MESSAGE BUS AND RESENDING MESSAGES ///`);
			messageBusPublisher=utils.createMessageBus();
			console.log('');
		});
	});
	utils.subscribeToProcessEvents(messageBusSubscriber,function(reason, error){
		console.log(`messageBusSubscriber failed ${reason} ${error}`);
		createAndRestartMessageBus(subscriberRestartTimer, reason, error, messageBusSubscriber, function restart(){
			console.log('');
			console.log(`///  RESTARTING THE SUBSCRIBER MESSAGE BUS AND RESENDING MESSAGES ///`);
			messageBusSubscriber=utils.createMessageBus();
			console.log('');
		});
	});

	function printMessageInfo(message){
		console.log(`MessageInfo: channel: ${message.channel}, address: ${message.address}, error: ${message.error}`);
	};

	function getLocalMessage(allMessages, channel, address, callback, callbackFail){
  		var exists=false;
  		for (var i = allMessages.length - 1; i >= 0; i--) {
  			const msg=allMessages[i];
  			if ((channel && address && msg.channel==channel && msg.address==address) || (!channel && !address) ){
					callback(msg);
					exists=true;
					break;
  			}
  		};
  		if (!exists && callbackFail){
  			callbackFail();
  		}
  	};
	
	process.on('message', (message) => {
		const allMessages=localPublishMessages.concat(localSubscribeMessages);
		getLocalMessage(allMessages, message.channel, message.address, function(localMessage){
			//sync all messages
  			for(var i in message.data){
		  	   localMessage.error=message.error;
		  	   localMessage.data[i]=message.data[i];
		  	};
		},function(){
			//message was not published or registered on this server.
		});
	});

    heartbeatTimer.setTime(5000);
  	heartbeatTimer.start(function(){
  		messageBusSubscriber.send('heartbeat');
		messageBusPublisher.send('heartbeat');
    });
	resendTimer.start(function(){
		const allMessages=localPublishMessages.concat(localSubscribeMessages);
		console.log('');
		console.log('/// MESSAGE BUS MANAGER IS CHECKING LOCAL MESSAGES ///');
		getLocalMessage(allMessages, null, null, function(localMessage){
			if (localMessage.error){
				printMessageInfo(localMessage);
				console.log('resending message that resulted in error');
				if (localMessage.publish == true){
					messageBusPublisher.send(localMessage);
				}
				if (localMessage.subscribe == true){
					messageBusSubscriber.send(localMessage);
				}
			}
		});
		console.log('');
	});

  	this.publish=function(channel, address, data) {
  		getLocalMessage(localPublishMessages, channel, address, function(localMessage){
  			for(var i in data){
		  	   localMessage.data[i]=data[i];
		  	};
		},function notFound(){
			localPublishMessages.push({
	  	 		channel: channel,
	  	 		address: address,
				subscribe: false,
				publish: true,
	  	 		data: data,
	  	 		error: ""
	  	 	});
		});
  		const changedData=utils.removeUnserialisableFields(data);
		messageBusPublisher.send({
			channel: channel,
  	 		address: address,
			subscribe: false,
			publish: true,
  	 		data: changedData,
  	 		error: ""
  	 	});
  	};

  	this.subscribe=function(channel, address, callback){
  		getLocalMessage(localSubscribeMessages, channel, address, function(localMessage){
  			localMessage.callback=callback;
		},function notFound(){
			localSubscribeMessages.push({
				channel: channel,
	  	 		address: address,
	  	 		subscriberCallback: callback,
				subscribe: true,
				publish: false,
	  	 		error: ""
			});
		});
  		messageBusSubscriber.send({
			channel: channel,
  	 		address: address,
			subscribe: true,
			publish: false,
  	 		error: ""
  	 	});
  	};
};
module.exports=MessageBusManager;