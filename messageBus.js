const utils = require('./utils.js')
const http=require('http');
const hostPort= process.env.PORT || 9000;
const restartTimer=utils.createTimer(true);
function MessageBus(processFile){

  	var thisService=this;
  	thisService.Id=utils.newGuid();
	thisService.subscriptions=[];

  	function terminate(err){
  		if (isClient){
  			console.log(err);
  			if (restartTimer.started==false){
  				console.log(`/// RESTARTING AT ${location} ///`);
	  			const subscriptions = thisService.subscriptions.slice();
				thisService = utils.createMessageBus();
	  			restartTimer.start(function(){
	  				console.log(``);
	  				console.log(`/// PLAYBACK START ///`);
					for (var i = 0; i < subscriptions.length; i++) {
						const sub=subscriptions[0];
						const changedData=utils.removeUnserialisableFields(sub.data);
						console.log(`replaying:`, sub.channel);
						thisService.publish(sub.channel, changedData);
					};
					console.log(`/// PLAYBACK STOP ///`);
	  				console.log(``);
					restartTimer.stop();
	  			});
  			}
  		}else {
  			console.log(`/// CHILD PROCESS TERMINATED ${err}///`);
  			process.exit();
  		}
  	};

  	function getSubscription(channel, callback, callbackFail){
  		var exists=false;
  		for (var i = thisService.subscriptions.length - 1; i >= 0; i--) {
  			const msg=thisService.subscriptions[i];
  			if (msg.channel==channel){
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

  	function addSubscription(channel, subscriberCallback, url){
	  	 thisService.subscriptions.push({
	  	 	channel: channel,
	  	 	subscriberCallback: subscriberCallback,
	  	 	url: url,
	  	 	data: {}
	  	 });
  	};

  	function onMessageReceived(message){
 		if (message=='heartbeat'){
 			return;
 		}
		console.log();
		console.log(`received message at ${location} for `,message.channel);
  	 	updateSubscription(message.channel, message.data);
  	 	getSubscription(message.channel, function(subscription){
  	 		if (subscription.lock==true){
				const subscriberNotification=utils.createTimer(true);
				const subscriberNotificationTimeout=utils.createTimer(false);
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


  	var childProcess;
  	var location;
  	var messaging;
  	var isClient=false;
  	console.log(`processFile: ${processFile}`);
  	if (processFile){
  		isClient=true;
	  	location='parent process';
		const cp = require('child_process');
  		childProcess=cp.fork(processFile);
	  	childProcess.on('exit', terminate);
       	childProcess.on('SIGINT', terminate);
       	childProcess.on('SIGHUP', terminate);
       	childProcess.on('SIGUSR1', terminate);
		childProcess.on('SIGUSR2', terminate);
       	childProcess.on('error', terminate);
		childProcess.on('close', terminate);
		childProcess.on('uncaughtException', terminate);
		childProcess.on( 'SIGTERM',terminate);
		messaging=childProcess;
  	}else{

  		location='child process';
	  	process.on('exit', terminate);
      	process.on('SIGINT', terminate);
      	process.on('SIGUSR1', terminate);
      	process.on('SIGHUP', terminate);
		process.on('SIGUSR2', terminate);
      	process.on('error', terminate);
		process.on('close', terminate);
		process.on('uncaughtException', terminate);
		process.on( 'SIGTERM',terminate);
		messaging=process;
  	}

 	messaging.on('message', (message) => {
  		if (isClient==true){
 			onMessageReceived(message);
  		} else {
  			if (!process.env.publicAddress){
  				throw 'environment variable: publicAddress does not exist.';
  			}
  			if (utils.isValidUrl(message.channel)==true){
				utils.postOverHttp(message.channel, message);
  			}else{
  				throw `${message.channel} is not a valid url`;	
  			}
  		}
 	});

  	thisService.publish=function(channel, data) {
  		const changedData=utils.removeUnserialisableFields(data);
  		const message={
  			channel: channel,
  			data: changedData
  		};
  		const localMessage={ channel: channel, data: data };
		updateSubscription(localMessage.channel, localMessage.data);
		messaging.send(message);
		console.log(`published message at ${location} to:`,message.channel);
  	};

  	thisService.subscribe=function(channel, callback, url){
  		addSubscription(channel, callback);
  		console.log(`subscribed to the ${channel} channel at ${location}:`);
  	};

  	thisService.get=function(channel, callback){
		getSubscription(channel, function(_message){
			callback(_message.data);
		});
  	};

  	if (isClient==false){
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
					onMessageReceived(requestBody);
					res.statusCode = 200;
				  	res.end(`subscribers at ${req.url} was notified`);
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
	}
};

if (process.env.hasChildMessageBus==false || process.env.hasChildMessageBus==undefined){
	process.env.hasChildMessageBus=true;
	new MessageBus();
}

module.exports=MessageBus;