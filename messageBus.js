const utils = require('./utils.js');
var messageBusHost=utils.createMessageBusHost();
messageBusHost.send('heartbeat');
const restartTimer=utils.createTimer(true, 'message bus host restart ');
const heartbeatTimer=utils.createTimer(true, 'HeartBeat');


function createAndRestartMessageBus(restartTimer, reason, err, childProcess, callback){
	console.log(`/// PROCESS TERMINATED: ${reason} ${err} ///`);
	childProcess.kill()
	childProcess.unref();
	if (restartTimer.started==false){
		restartTimer.start(function() {
			callback();
			restartTimer.stop();
		});
	}
};

utils.subscribeToProcessEvents(messageBusHost, function(reason, err){
	console.log(`message bus host failed ${reason} ${err}`);
	createAndRestartMessageBus(restartTimer, reason, err, messageBusHost, function restart(){
		console.log('');
		console.log(`///  RESTARTING THE MESSAGE BUS HOST ///`);
		messageBusHost=utils.createMessageBusHost();
		messageBusHost.send('heartbeat');
		console.log('');
	});
	console.log();
});

utils.subscribeToProcessEvents(process, function(reason, err){
	console.log();
	console.log(`/// THERE IS A PROBLEM WITH THE MESSAGE BUS, TERMINATING IT  ///`);
	console.log(`Reason: ${reason}, Error: ${err}`);
	process.exit();
	process.kill();
	console.log();
});

process.on('message', (message) => {
	if (message=='heartbeat'){
		console.log('heartbeat received at message bus');
		heartbeatTimer.start(function(){
			heartbeatTimer.stop();
			process.send('heartbeat');
		});
		return;
	}
	console.log('');
	console.log(`/// RECEIVED MESSAGE ///`);
	if (utils.isValidUrl(message.address)==true) {
		utils.sendHttpRequest(message.address, message);
	}
	console.log('');
});