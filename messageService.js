function MessageService(processFile){

	  var thisService=this;
	  const messages=[];
	  var _process = process;
	  var location='child process';
	  if (processFile){
		const cp = require('child_process');
	  	_process=cp.fork(processFile);
	  	location='parent process';
	  }
	  _process.addListener('close', function(){
	    console.log('http server child process exiting');
	     thisService=new MessageService(processFile);
	  });
	  _process.addListener('error', function(err){
	      console.log(err);
	      // new MessageService(processFile);
	  });
	  console.log('message bus configured for ',location);

	  function getMessage(Id, callback, callbackFail){
	  		var exists=false;
	  		for (var i = messages.length - 1; i >= 0; i--) {
	  			const msg=messages[i];
	  			if (msg.Id==Id){
	  					callback(msg);
	  					exists=true;
	  					break;
	  			}
	  		};
	  		if (!exists && callbackFail){
	  				callbackFail();
	  		}
	  };

	  thisService.send=function(Id, data) {
	  		const message={
	  			Id: Id,
	  			data: {}
	  		};
	  		const localMessage={
	  			Id: Id,
	  			data: {}
	  		};
		  	for(var i in data){
	  			try{
	  				JSON.stringify(data[i]);
	  				message.data[i]=data[i];
	  				localMessage.data[i]=data[i];
	  			}catch(err){
	  				localMessage.data[i]=data[i];
	  			}
	  		};
	  		console.log();
	  		console.log(`////////////////////////////// SENDING ${Id} MESSAGE START (${location}) //////////////////////////`);
		  	getMessage(Id, function(_message){
			  	for(var i in localMessage.data){
			  	   _message.data[i]=localMessage.data[i];
			  	    console.log(`overwriting ${i}`);
			  	};
		  	    _process.send(message);
	  	  	},function notFound(){
		  		messages.push(localMessage);
		  		_process.send(message);
		  	});
		  	console.log('////////////////////////////// SENDING MESSAGE END //////////////////////////');
		  	console.log();
	  };
	  thisService.receive=function(Id, callback){
	  	 _process.on('message', (message) => {
	  	 	if (message.Id==Id){
		  	 	console.log();
		  		console.log(`////////////////////////////// RECEIVING ${Id} MESSAGE START (${location}) //////////////////////////`);
	  	 		getMessage(Id, function(_message){
			  	  for(var i in message.data){
			  	    _message.data[i]=message.data[i];
			  	      console.log(`overwriting ${i}`);
			  	  };
	  	 		  callback(_message.data);
			  	},function notFound(){
			  		messages.push(message);
			  		callback(message.data);
			  	});
		  	 	console.log('////////////////////////////// RECEIVING MESSAGE END //////////////////////////');
		  	 	console.log();
	  	 	}
	  	 });
	  };
	  thisService.get=function	(Id, callback){
  		  getMessage(Id, function(_message){
  		  		callback(_message.data);
  		  });
	  };
};
module.exports=MessageService;