const name=process.argv[2];
const libName=process.argv[3];
const port=parseInt(process.argv[4]);
const protocol=process.argv[5];

console.log('PARAMS: ',process.argv);

const utils=require('./utils.js');
const heartbeatTimer=utils.createTimer(true, `${name} child process heartbeat`);
heartbeatTimer.setTime(2000);

const CLASS=require(libName);
const instance = new CLASS(name);
	
console.log(`child process hosting the ${name} library sent a heartbeat message.`);
heartbeatTimer.start(function(){
	var result=process.send('heartbeat');
	if (result==false){
		throw `${name} child process was unable to send heartbeat to parent process`;
	}
});
process.on('message', (message) => {
	message.remote=false;
	receiveMessage(message);
});

if (protocol=='TCP'){
	utils.receiveMessagesOnSocket(port, function(message){
		message.remote=true;
		receiveMessage(message);
	});
}
if (protocol=='HTTP'){
	utils.receiveHttpRequest(port, function requestReceived(message){
		message.remote=true;
		receiveMessage(message);
	});
}
function receiveMessage(message){
	if (message=='heartbeat'){
		console.log(`child process hosting the ${name} library received a heartbeat message.`);
		return;
	} else if (instance.receiveMessage) {
		instance.receiveMessage(message);
	}else{
		console.log(`child process ${name} does not have a receive endpoint`);
	}
};
function sendMessage(message){
	if (message.remote==true && utils.isValidUrl(message.address)==true) {
		utils.sendHttpRequest(message.address, message);
	}else if (message.remote==false){
		process.send();	
	}
};