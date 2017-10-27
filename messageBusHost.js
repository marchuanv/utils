const utils = require('./utils.js')
const hostPort= process.env.PORT || 3000;
const heartbeatTimer=utils.createTimer(true, 'HeartBeat');

utils.subscribeToProcessEvents(process, function(reason, err){
	console.log();
	console.log(`/// MESSAGE BUS HOST HAD AN ERROR: ${err} ///`);
	console.log();
	process.exit();
	process.kill();
});

utils.receiveHttpRequest(hostPort, function requestReceived(requestData){
	console.log(`/// MESSAGE BUS HOST IS LISTENING ON PORT ${hostPort} ///`);
	process.send(requestData);

});

process.on('message', (message) => {
	if (message=='heartbeat'){
		console.log('heartbeat received at message bus host');
		heartbeatTimer.start(function(){
			heartbeatTimer.stop();
			process.send('heartbeat');
		});
		return;
	}
});