console.log('child process arguments: ',process.argv);

const name=process.argv[2];
const libName=process.argv[3];
const childName=process.argv[4];
const childLib=process.argv[5];

const utils=require('./utils.js');
const heartbeatTimer=utils.createTimer(true, `${name} child process heartbeat`);
var childProcess;
if (childName && childLib){
	childProcess=utils.createChildProcess(name, libName, childName, childLib, true);
}

const CLASS=require(libName);
const instance = new CLASS();
if (instance.receiveMessage && typeof instance.receiveMessage === 'function'){
	console.log(`child process hosting the ${name} library sent a heartbeat message.`);
	heartbeatTimer.start(function(){
		const result=process.send('heartbeat');
		childProcess.send('heartbeat');
		if (result==false){
			throw `${name} child process was unable to send heartbeat to parent process`;
		}
	});
	process.on('message', (message) => {
		if (message=='heartbeat'){
			console.log(`child process hosting the ${name} library received a heartbeat message.`);
			return;
		}else{
			instance.receiveMessage(message);
		}
	});
}else{
	throw `instance of ${name} does not a receiveMessage(message) function`;
}