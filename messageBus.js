const utils = require('./utils.js')
const http=require('http');
const hostPort= process.env.PORT || 3000;

var thisService=this;

const heartbeatTimer=utils.createTimer(true, 'HeartBeat');
heartbeatTimer.setTime(5000);
	heartbeatTimer.start(function(){
	process.send('heartbeat');
});

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
			process.send(requestBody);
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

utils.subscribeToProcessEvents(process, function(reason, err){
	console.log();
	console.log(`/// THERE IS A PROBLEM WITH A MESSAGE BUS, TERMINATING IT  ///`);
	console.log(`Reason: ${reason}, Error: ${err}`);
	process.exit();
	process.kill();
	console.log();
});

process.on('message', (message) => {
	if (message=='heartbeat'){
		return;
	}
	console.log('');
	console.log(`/// ${location} RECEIVED MESSAGE ///`);
	if (isClient==true){
		if (message.subscribe==true){
			console.log('received subscription from remote host');
			if (message.address){
			updateSubscription(message.channel, message.data, message.address);
			getSubscription(message.channel, message.address, function(){
				console.log('subscription from remote host already exist, updating it.');
			},function(){
				console.log('remote host does not have a subscription on this server adding it.');
					createSubscription(message.channel, message.address, function callback(){
					});
				});
			}else{
				console.log('received subscription does not have an address');
			}
		}else if (message.publish==true){
			console.log('received publish from remote host');
			onMessageReceived(message);
		}else{
			console.log('the intention of a message received from a remote host could not be determined');
		}
	} else {
	if (message.subscribe==true){
		console.log(`message is for subscription`)
		if (utils.isValidUrl(message.address)==true){
			utils.postOverHttp(message.address, message);
			}else{
				throw `${message.address} is not a valid url`;
			}
	}else if (message.publish==true){
		console.log(`message is for publish`)
			getSubscription(message.channel, message.address, function(subscription){
  			console.log(`forwarding message to remote message bus`);
  			if (utils.isValidUrl(subscription.address)==true){
				utils.postOverHttp(subscription.address, message);
  			}else{
  				throw `${message.address} is not a valid url`;
  			}
		},function(){
			throw `no subscriptions found for channel: ${message.channel}, address: ${message.address}`;
		});
	}else{
			console.log('the intention of a message received from client could not be determined');
		}
	}
	console.log('');
});