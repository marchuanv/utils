const http=require('http');
function HttpService(utils){
	this.sendHttpRequest=function (url, data, path, callback, callbackFail) {
		console.log('creating an http request.');
		const postData=utils.getJSONString(data, true);
		const info = utils.getHostAndPortFromUrl(url);
		const host=info.host;
		var port=info.port;
		if (!port){
			port=80;
		}
		const options = {
			host: host,
			port: port, 
			method:'POST',
			path: path,
			headers: {
			  'Content-Type': 'application/json',
			  'Content-Length': Buffer.byteLength(postData)
			}
		};
		const request=http.request(options);
		request.on('error', function(err){
			if (callbackFail){
				callbackFail(err);
			}else{
				console.log(`Http error occurred: ${err}`);
			}
		});
		request.on('response', function (response) {
		  response.setEncoding('utf8');
		  if (response.statusCode != 200){
		      if (callbackFail){
		        callbackFail(`http request responded with http status code: ${response.statusCode}`);
		      }else{
		        console.log('http response received from request, status code: ', response.statusCode);
		      }
		  }else{
		    response.on('data', function (body) {
		        if (callback){
		          callback(body);
		        }
		    });
		  }
		});
		request.end(postData);
	};
    this.receiveHttpRequest=function(hostPort, cbStarted, responseCallback, callbackError){
		const port = process.env.PORT || hostPort;
		const httpServer=http.createServer(function(req, res){
			console.log('http request received');
			const body = [];
			res.on('error',function(err){
			  const errMsg=`Http error occurred at ${location}: ${err}`;
			  console.log(errMsg);
			  callbackError(errMsg);
			});
			req.on('data', function (chunk) {
				body.push(chunk);
			});
			req.on('end', function () {
			    const requestBodyJson=Buffer.concat(body).toString();
			    const requestBody=utils.getJSONObject(requestBodyJson);
			    console.log('http request data received.');
			    if (requestBody) {
			        res.statusCode = 200;
			        res.end('success');
			        responseCallback(requestBody);
			    } else if(req.method.toLowerCase()=="get"){
			        responseCallback(function(resData){
			            res.statusCode = 200;
			            var resDataJson=utils.getJSONString(resData, true);
			            res.end(resDataJson);
			        });
			    }else{
			        res.statusCode = 500;
			        res.end('failed');
			        callbackError(`no request body`);
			    }
			});
		});
      	try{
        	httpServer.listen(port, function(){
            	console.log('');
            	console.log(`http server started and listening on port ${port}`);
            	console.log('');
            	cbStarted();
        	});
      	}catch(err){
			console.log('MESSAGE: ',err.message);
			if (err.message.indexOf('EADDRINUSE') == -1){
			  throw err;
			}else{
			  console.error(`port ${hostPort} already in use`);
			}
      	}
    };
};
module.exports=HttpService;
