const utils = require('./utils.js')
const hostPort= process.env.PORT || 3000;

utils.receiveHttpRequest(hostPort,function requestReceived(requestData){
	process.send(requestData);
	process.exit();
	process.kill();
},function error(err){
	if (err.toString().indexOf('EADDRINUSE :::')>=0){
	}else{
		throw err;
	}
});