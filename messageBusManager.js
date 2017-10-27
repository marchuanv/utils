const utils = require('./utils.js')

function MessageBusManager(messageBusPublisher, messageBusSubscriber){

	const localPublishMessages=[];
	const localSubscribeMessages=[];
	
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
		if (message=='heartbeat'){
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
			return;
		}
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