function MessageService(utils, processFile, _subscriptions){

	  	var thisService=this;
	  
		thisService.publishes=[];
		thisService.subscriptions=_subscriptions;
		if (!thisService.subscriptions){
			thisService.subscriptions=[];
		}
		
	  	function terminate(err){
	  		console.log(`//////////////////////////// TERMINATED AT ${location}, REASON:${err} ///////////////////////////////`);
	  		if (childProcess && childProcess.exit){
				childProcess.exit();

				//restart service at parent process
				thisService=new MessageService(utils, processFile, thisService.subscriptions);

	  		}else{
	  			process.exit();
	  		}
	  	};
	  	function getSubscriptions(subscriberName, callback, callbackFail){
	  		var exists=false;
	  		for (var i = thisService.subscriptions.length - 1; i >= 0; i--) {
	  			const msg=thisService.subscriptions[i];
	  			if (msg.subscriberName==subscriberName){
	  					callback(msg);
	  					exists=true;
	  					break;
	  			}
	  		};
	  		if (!exists && callbackFail){
	  				callbackFail();
	  		}
	  	};

	  	function updateSubscription(subscriberName, data, cbNotFound){
		  	getSubscriptions(subscriberName, function(localMessage){
			  	for(var i in data){
			  	   localMessage.data[i]=data[i];
			  	};
	  	  	}, function notFound(){
			  	 thisService.subscriptions.push({
			  	 	subscriberName: subscriberName,
			  	 	data: data
			  	 });
			});
	  	};

	  	var childProcess;
	  	var location='child process';
	  	var messaging;
	  	if (processFile){
		  	location='parent process';
			const cp = require('child_process');
	  		childProcess=cp.fork(processFile);
		  	childProcess.on('exit', terminate);
	       	childProcess.on('SIGINT', terminate);
	       	childProcess.on('SIGUSR1', terminate);
			childProcess.on('SIGUSR2', terminate);
	       	childProcess.on('error', terminate);
			childProcess.on('close', terminate);
			childProcess.on('uncaughtException', terminate);
			childProcess.on( 'SIGTERM',terminate);
			messaging=childProcess;
	  	}else{
		  	process.on('exit', terminate);
	       	process.on('SIGINT', terminate);
	       	process.on('SIGUSR1', terminate);
			process.on('SIGUSR2', terminate);
	       	process.on('error', terminate);
			process.on('close', terminate);
			process.on('uncaughtException', terminate);
			process.on( 'SIGTERM',terminate);
			messaging=process;
	  	}

	  	thisService.send=function(subscriberName, data) {
	  		const message={
	  			subscriberName: subscriberName,
	  			data: {}
	  		};
	  		const localMessage={
	  			subscriberName: subscriberName,
	  			data: {}
	  		};
		  	for(var i in data){
	  			try{
	  				if (typeof data[i] !== 'function'){
		  				JSON.stringify(data[i]);
		  				message.data[i]=data[i];
	  				}
					localMessage.data[i]=data[i];
	  			}catch(err){
	  				localMessage.data[i]=data[i];
	  			}
	  		};
			updateSubscription(localMessage.subscriberName, localMessage.data);
	  		messaging.send(message);
	  	};
	  	thisService.receive=function(subscriberName, callback){
	  	 	messaging.on('message', (message) => {
	  	 		if (message=='heartbeat'){
	  	 			return;
	  	 		}else if (message.subscriberName==subscriberName){
			  	 	updateSubscription(message.subscriberName, message.data);
			  	 	getSubscriptions(message.subscriberName, function(subscription){
			  	 		if (subscription.lock==true){
							const subscriberNotification=utils.createTimer(true);
							const subscriberNotificationTimeout=utils.createTimer(false);
							subscriberNotificationTimeout.setTime(20000);
							subscriberNotification.start(function(){
								if (subscription.lock==true){
									console.log('waiting for lock at ',location);
								}else{
									subscriberNotification.stop();
					  	 			callback(subscription.data, function complete(){
					  	 				subscription.lock=false;
					  	 			});
								}
							});
							subscriberNotificationTimeout.start(function(){
								subscriberNotification.stop();
							});
			  	 		}else{
			  	 			subscription.lock=true;
			  	 			callback(subscription.data, function complete(){
			  	 				subscription.lock=false;
			  	 			});
			  	 		}
			  	 	});
		  	 	}
	  	 	});
	  	};
	  	thisService.get=function(subscriberName, callback){
  		  getSubscriptions(subscriberName, function(_message){
  		  		callback(_message.data);
  		  });
	  	};
};
module.exports=MessageService;