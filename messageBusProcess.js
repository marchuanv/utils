const name=process.argv[2];
const libName=process.argv[3];
const thisServerAddress=process.argv[4];

console.log('PARAMS: ',process.argv);

const utils=require('./utils.js');
const heartbeatTimer=utils.createTimer(true, `${name} child process heartbeat`);
heartbeatTimer.setTime(5000);

const CLASS=require(libName);
var receivePublishMessage;
var receiveSubscribeMessage;

const instance = new CLASS(name, thisServerAddress, function(callback){
	receivePublishMessage=callback;
}, function(callback){
	receiveSubscribeMessage=callback;
}, function (message){
	sendInternalMessage(message);
}, function(message){
	sendExternalMessage(message);
});
	
console.log(`child process hosting the ${name} library sent a heartbeat message.`);
heartbeatTimer.start(function(){
	var result=process.send('heartbeat');
	if (result==false){
		throw `${name} child process was unable to send heartbeat to parent process`;
	}
});

function validateSubscribeMessage(message, cbValid){
	if (message.to && utils.isValidUrl(message.to)==true){
		console.log('received subscribe	message is valid');
		cbValid();
	}else{
		console.log(`${name} child process received a message with an unknown or invalid to address: ${message.to} `);
	}
};
function validatePublishMessage(message, cbValid){
	if (message.channel){
		console.log('received publish message is valid');
			cbValid();
	}else{
	    console.log(`${name} child process received a publish message that has no channel`);	
	}
};

//if message is received from parent process.
process.on('message', (message) => {
	message.from=thisServerAddress;
	message.source='internal';
	console.log('incoming internal message');
	if (message && message !='heartbeat'){
		receiveMessageCheck(message);
	}else{
		console.log('INTERNAL MESSAGE RECEIVED IS NULL');
	}
});

const port= utils.getHostAndPortFromUrl(thisServerAddress).port;
utils.receiveHttpRequest(port, function requestReceived(message){
	console.log('incoming external message');
	message.source='external';
	if (message && message !='heartbeat'){
		receiveMessageCheck(message);
	}else{
		console.log('EXTERNAL MESSAGE RECEIVED IS NULL');
	}
});

function receiveMessageCheck(message){
	if (message.publish==true){
		validatePublishMessage(message, function(){
			receivePublishMessage(message);
		});
	} else if (message.publish==false){
		validateSubscribeMessage(message, function(){
			receiveSubscribeMessage(message);
		});
	} else{
		console.log('received messages must indicate publish or subscribe.');
	}
};

function sendInternalMessage(message){
	console.log(`notifying parent messagebus at ${thisServerAddress}`);
	const result=process.send(message);	
	if (result==false){
		console.log(`failed to notify parent message bus at ${thisServerAddress}`);
	}
};

function sendExternalMessage(message){
	if (message.to && utils.isValidUrl(message.to)==true) {
		console.log(`notifying remote subscriptions at ${message.to}`);
		utils.sendHttpRequest(message.to, message, null);
	}else{
		console.log(`can't send a message that does not have a to address.`);
	}
};