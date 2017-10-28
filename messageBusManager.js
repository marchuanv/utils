const utils = require('./utils.js')

function MessageBusManager(messageBus){

	const localMessages=[];
	
	function printMessageInfo(message){
		console.log(`MessageInfo: channel: ${message.channel}, address: ${message.address}, error: ${message.error}`);
	};

	function getLocalMessage(channel, address, callback, callbackFail){
  		var exists=false;
  		for (var i = localMessages.length - 1; i >= 0; i--) {
  			const msg=localMessages[i];
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
		if (message=='heartbeat'){
			console.log('');
			console.log('/// MESSAGE BUS MANAGER IS CHECKING LOCAL MESSAGES ///');
			getLocalMessage(null, null, function(localMessage){
				if (localMessage.error){
					printMessageInfo(localMessage);
					console.log('resending message that resulted in error');
					messageBus.send(localMessage);
				}
			});
			return;
		}
		getLocalMessage(message.channel, message.address, function(localMessage){
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
  		getLocalMessage(channel, address, function(localMessage){
  			for(var i in data){
		  	   localMessage.data[i]=data[i];
		  	};
		},function notFound(){
			localMessages.push({
	  	 		channel: channel,
	  	 		address: address,
				subscribe: false,
				publish: true,
	  	 		data: data,
	  	 		error: ""
	  	 	});
		});
  		const changedData=utils.removeUnserialisableFields(data);
		messageBus.send({
			channel: channel,
  	 		address: address,
			subscribe: false,
			publish: true,
  	 		data: changedData,
  	 		error: ""
  	 	});
  	};

  	this.subscribe=function(channel, address, callback){
  		getLocalMessage(channel, address, function(localMessage){
  			localMessage.callback=callback;
		},function notFound(){
			localMessages.push({
				channel: channel,
	  	 		address: address,
	  	 		subscriberCallback: callback,
				subscribe: true,
				publish: false,
	  	 		error: ""
			});
		});
  		messageBus.send({
			channel: channel,
  	 		address: address,
			subscribe: true,
			publish: false,
  	 		error: ""
  	 	});
  	};
};
module.exports=MessageBusManager;