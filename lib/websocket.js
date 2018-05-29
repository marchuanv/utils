function WebSocket(host, port, eventComm){

	const url=`ws://${host}:${port}/`;

	this.send=function (data, callback, callbackFail) {
		const postData=getJSONString(data, true);
		const webSocket = new WebSocketClient(url);
		webSocket.on('connect', function(connection) {
			
			connection.onmessage(function(message){
				callback(message);
	        	connection.close()
			});
			
			connection.onerror(function(error) {
				if(callbackFail){
		        	callbackFail(error.toString());
				}else{
					console.error(error);
				}
		    });
		    
		    connection.onclose(function() {
		    });

			if (connection.connected) {
	            connection.sendUTF(postData);
				console.log('message sent');
	        }
		});
		webSocket.connect(url,'echo-protocol');
	}

	this.receive=function(callback){
		const httpServer=require("http").createServer();
		httpServer.listen(port, host, function(){
	    	eventComm.send({
				name: `${host}:${port}`,
				date: new Date()
			},function(message){
				console.log(message);
			});
		});
		const wsServer = new WebSocketServer({
		  httpServer: httpServer
		});
		wsServer.on('request', function(request) {
		  var connection = request.accept(null, request.origin);
		  connection.on('message', function(message) {
		    if (message.type === 'utf8') {
			    const obj=getJSONObject(message.utf8Data, true);
			    if (obj) {
		    		console.log('message received');
			        callback(obj, function respondToRequest(data){
			        	console.log('message sent');
			        	const postData=getJSONString(data, true);
			        	connection.sendUTF(postData);
			        });
			    }
		    }
		  });
		});
	}

	function getJSONString(data, includeFunctions){
       	try{
	        if (includeFunctions==true){
	        	return JSON.stringify(data, function(key, value) {
	            	if (typeof value === "function") {
	              		return "/Function(" + value.toString() + ")/";
	            	}
	            	return value;
	          	});
	        }else{
	        	return JSON.stringify(data);
	        }
       }catch(err){
        	console.log("error creating json string",err);
         	return null;
       }
    }

    function getJSONObject(jsonString, includeFunctions){
      	try{
	        if (includeFunctions==true){
	          	const parsedObj =JSON.parse(jsonString, function(key, value) {
	            	if (typeof value === "string" && value.startsWith("/Function(") && value.endsWith(")/")) {
	              		value = value.substring(10, value.length - 2);
	              		return eval("(" + value + ")");
	            	}
	            	return value;
	          	});
	          	return parsedObj;
        	}else{
          		return JSON.parse(jsonString);
        	}
      	}catch(err){
        	console.log("error parsing json",err);
        	return null;
      	}
  	}
}
