const utils = require('./utils.js')
const http=require('http');
const hostPort= process.env.PORT || 3000;
const restartTimer=utils.createTimer(true, 'Restart');

function subscribeToProcessEvents(process, callback){
	process.on('exit', function(obj){
		callback("exit");
	});
   	process.on('SIGINT',  function(obj){
		callback("SIGINT");
	});
   	process.on('SIGHUP', function(obj){
		callback("SIGHUP");
	});
   	process.on('SIGUSR1', function(obj){
		callback("SIGUSR1");
	});
	process.on('SIGUSR2', function(obj){
		callback("SIGUSR2");
	});
	process.on('close', function(obj){
		callback("close");
	});

	process.on( 'SIGTERM', function(obj){
		callback("SIGTERM");
	});
   	process.on('error', function(obj){
		callback("error", obj);
	});
	process.on('uncaughtException', function(obj){
		callback("uncaughtException", obj);
	});
};

function MessageBus(messageBusChildProcess){
  	var thisService=this;
	thisService.subscriptions=[];
  	var location;
  	var messageService;
  	var isClient=false;

  	function setupParentMessageBus(){
  		if (!messageBusChildProcess){
			messageBusChildProcess=utils.createMessageBus(true);
		}
		console.log('');
  		console.log(`///  PARENT PROCESS SETUP ///`);
		messageService=messageBusChildProcess;
		console.log('sending first heartbeat to child');
  		isClient=true;
	  	location='parent process';
	  	subscribeToProcessEvents(messageBusChildProcess, terminate);
  	}

	if (messageBusChildProcess) {
		setupParentMessageBus();
  	} else {
  		console.log('');
		console.log(`///  CHILD PROCESS SETUP ///`);
  		location='child process';
		messageService=process;
  		const httpInstance=http.createServer(function(req, res){
  			console.log('http request received');
			const body = [];
			res.on('error',function(err){
				const errMsg=`Http error occurred at ${location}: ${err}`;
				console.log(errMsg);
			});
			req.on('data', function (chunk) {
				body.push(chunk);
			});
			req.on('end', function () {
				console.log('http request data received');
				const requestBodyJson=Buffer.concat(body).toString();
				const requestBody=utils.getJSONObject(requestBodyJson);
				if (requestBody) {
					res.statusCode = 200;
				  	res.end(`subscribers at ${req.url} was notified`);
					messageService.send(requestBody);
				} else {
					const message=`no request body`;
					res.statusCode = 500;
				  	res.end(message);
					throw message;
				}
			});
	    });
	    httpInstance.listen(hostPort,function(){
	        console.log();
	        console.log(`/// LISTENING FOR HTTP TRAFFIC AT ${location} ///`);
	        console.log();
	    });
	    const healthrestartTimer=utils.createTimer(true, 'HeartBeat');
	    healthrestartTimer.setTime(5000);
	  	healthrestartTimer.start(function(){
			messageService.send('heartbeat');
	    });
	    subscribeToProcessEvents(process, terminate);
  	}

  	function terminate(reason, err){
  		if (isClient==true){
  			if (messageBusChildProcess){
  				console.log(`/// PARENT PROCESS TERMINATED: ${reason} ${err} ///`);
	  			messageBusChildProcess.kill()
	  			messageBusChildProcess.unref();
	  			messageBusChildProcess=null;
	  			if (restartTimer.started==false){
		  			restartTimer.start(function() {
		  				console.log('');
  						console.log(`///  RESTARTING & REPLAYING MESSAGES ///`);
		  				setupParentMessageBus();
		  				getSubscription(null,function(sub){
							const changedData=utils.removeUnserialisableFields(sub.data);
							console.log(`replaying:`, sub.channel);
							thisService.publish(sub.channel, changedData);
		  				});
						restartTimer.stop();
					});
	  			}
  			}
  		}else {
  			console.log(`/// CHILD PROCESS TERMINATED ${reason} ${err} ///`);
  			process.exit();
  			process.kill()
  		}
  	};

  	function getSubscription(channel, callback, callbackFail){
  		var exists=false;
  		for (var i = thisService.subscriptions.length - 1; i >= 0; i--) {
  			const msg=thisService.subscriptions[i];
  			if ((channel && msg.channel==channel) || !channel){
					callback(msg);
					exists=true;
					break;
  			}
  		};
  		if (!exists && callbackFail){
  				callbackFail();
  		}
  	};

  	function updateSubscription(channel, data){
	  	getSubscription(channel, function(localMessage){
		  	for(var i in data){
		  	   localMessage.data[i]=data[i];
		  	};
  	  	});
  	};

  	function createSubscription(channel, subscriberCallback, url){
		const message={
			channel: channel,
  	 		subscriberCallback: subscriberCallback,
  	 		url: url,
  	 		data: {}
  	 	};
	  	thisService.subscriptions.push(message);
	  	return message;
  	};

  	function onMessageReceived(message){
 		
		console.log();
		console.log(`received message at ${location} for `,message.channel);
  	 	updateSubscription(message.channel, message.data);
  	 	getSubscription(message.channel, function(subscription){
  	 		if (subscription.lock==true){
				const subscriberNotification=utils.createrestartTimer(true);
				const subscriberNotificationTimeout=utils.createrestartTimer(false);
				subscriberNotificationTimeout.setTime(20000);
				subscriberNotification.start(function(){
					if (subscription.lock==true){
						console.log('waiting for lock at ',location);
					}else{
						subscriberNotification.stop();
						subscriberNotificationTimeout.stop();
						console.log(`callback to ${message.channel} subscriber at `, location);
		  	 			subscription.subscriberCallback(subscription.data, function complete(){
		  	 				subscription.lock=false;
		  	 			});
					}
				});
				subscriberNotificationTimeout.start(function(){
					subscriberNotification.stop();
				});
  	 		}else{
  	 			subscription.lock=true;
  	 			console.log(`callback to ${message.channel} subscriber at `, location);
  	 			subscription.subscriberCallback(subscription.data, function complete(){
  	 				subscription.lock=false;
  	 			});
  	 		}
  	 	});
  	};

 	messageService.on('message', (message) => {
 		if (message=='heartbeat'){
 			return;
 		}
 		console.log('');
 		console.log('/// RECEIVED MESSAGE ///');
  		if (isClient==true){
  			if (message.subscribe==true){
  				console.log('received subscription from remote host');
  				delete message['subscribe'];
				getSubscription(message.channel, function(subscription){
					console.log('subscription from remote host already exist, updaing it.');
					updateSubscription(message.channel, message.data);
				},function(){
					console.log('remote host does not have a subscription on this server adding it.');
  					createSubscription(message.channel, function(){

					});
  				});
  			}else if (message.publish==true){
  				console.log('received publish from remote host');
 				onMessageReceived(message);
  			}else{
  				console.log('the intention of a message received from a remote host could not be determined');
  			}
  		} else {
  			console.log(`forwarding message (${JSON.stringify(message)}) to remote message bus`);
  			if (utils.isValidUrl(message.channel)==true){
				utils.postOverHttp(message.channel, message);
  			}else{
  				throw `${message.channel} is not a valid url`;	
  			}
  		}
  		console.log('');
 	});

  	thisService.publish=function(channel, data) {
  		const changedData=utils.removeUnserialisableFields(data);
  		const message={
  			channel: channel,
  			data: changedData
  		};
  		const localMessage={ channel: channel, data: data };
		updateSubscription(localMessage.channel, localMessage.data);
		message.publish=true;
		messageService.send(message);
		console.log(`published message at ${location} to:`,message.channel);
  	};

  	thisService.subscribe=function(channel, callback, url){
  		const message=createSubscription(channel, callback);
  		message.subscribe=true;
  		messageService.send(message);
  		console.log(`subscribed to the ${channel} channel at ${location}:`);
  	};

  	thisService.get=function(channel, callback){
		getSubscription(channel, function(_message){
			callback(_message.data);
		});
  	};
};
module.exports=MessageBus;