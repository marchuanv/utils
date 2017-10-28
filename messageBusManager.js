const utils = require('./utils.js')
if (!process.env.senderaddress){
	throw 'no senderaddress environment variable found.';
}

function MessageBusManager(messageBus){

	const localMessages=[];
	
	function printMessageInfo(message){
		console.log(`MessageInfo: channel: ${message.channel}, recipient address: ${message.recipientAddress}, error: ${message.error}`);
	};

	function getLocalMessage(channel, recipientAddress, callback, callbackFail){
  		var exists=false;
  		for (var i = localMessages.length - 1; i >= 0; i--) {
  			const msg=localMessages[i];
  			if ((channel && recipientAddress && msg.channel==channel && msg.recipientAddress==recipientAddress) || (!channel && !recipientAddress) ){
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
		getLocalMessage(message.channel, message.recipientAddress, function(localMessage){
			//sync all messages
  			for(var i in message.data){
		  	   localMessage.error=message.error;
		  	   localMessage.data[i]=message.data[i];
		  	};
		},function(){
			//message was not published or registered on this server.
		});
	});

  	this.publish=function(channel, recipientAddress, data) {
  		getLocalMessage(channel, recipientAddress, function(localMessage){
  			for(var i in data){
		  	   localMessage.data[i]=data[i];
		  	};
		},function notFound(){
			localMessages.push({
	  	 		channel: channel,
				subscribe: false,
				publish: true,
	  	 		data: data,
	  	 		error: "",
	  	 		recipientAddress: recipientAddress,
	  	 		senderAddress: process.env.senderaddress
	  	 	});
		});
  		const changedData=utils.removeUnserialisableFields(data);
		messageBus.send({
			channel: channel,
			subscribe: false,
			publish: true,
  	 		data: changedData,
  	 		error: "",
  	 		recipientAddress: recipientAddress,
	  	 	senderAddress: process.env.senderaddress
  	 	});
  	};

  	this.subscribe=function(channel, recipientAddress, callback){
  		getLocalMessage(channel, recipientAddress, function(localMessage){
  			localMessage.callback=callback;
		},function notFound(){
			localMessages.push({
				channel: channel,
	  	 		subscriberCallback: callback,
				subscribe: true,
				publish: false,
	  	 		error: "",
	  	 		recipientAddress: recipientAddress,
	  	 		senderAddress: process.env.senderaddress
			});
		});
  		messageBus.send({
			channel: channel,
			subscribe: true,
			publish: false,
  	 		error: "",
	  	 	recipientAddress: recipientAddress,
	  	 	senderAddress: process.env.senderaddress
  	 	});
  	};
};
module.exports=MessageBusManager;