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

const instance = new CLASS(name, thisServerAddress, function _receivePublishMessage(callback){
	receivePublishMessage=callback;
}, function _receiveSubscribeMessage(callback){
	receiveSubscribeMessage=callback;
}, function _sendMessage(message){
	sendMessage(message);
});
	
console.log(`child process hosting the ${name} library sent a heartbeat message.`);
heartbeatTimer.start(function(){
	var result=process.send('heartbeat');
	if (result==false){
		throw `${name} child process was unable to send heartbeat to parent process`;
	}
});

function validateSubscribeMessage(message, cbValid){
	if (message.from && utils.isValidUrl(message.from)==true){
		if (message.to && utils.isValidUrl(message.to)==true){
			console.log('received subscribe	message is valid');
			cbValid();
		}else{
			console.log(`${name} child process received a message that has an unknown or invalid recipient address: ${message.to} `);
		}
	}else{
		console.log(`${name} child process received a message from an unknown or invalid address: ${message.from} `);
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
	receiveMessageCheck(message);
});

const port= utils.getHostAndPortFromUrl(thisServerAddress).port;
utils.receiveHttpRequest(port, function requestReceived(message){
	receiveMessageCheck(message);
});

function receiveMessageCheck(message){
	if (message=='heartbeat'){
		console.log(`child process hosting the ${name} library received a heartbeat message.`);
		return;
	} else if (message.publish==true){
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

function sendMessage(message){
	if (message.from && utils.isValidUrl(message.from)==true) {
		if (message.from==thisServerAddress){ // if the message was from the same server then send to parent process
			console.log(`notifying local subscription at ${thisServerAddress}`);
			const result=process.send(message);	
			if (result==false){
				console.log(`failed to notifying local subscription at ${thisServerAddress}`);
			}
		}else{
			console.log(`notifying remote subscriptions at ${subscription.senderAddress}`);
			utils.sendHttpRequest(message.from, message);
		}
	}else{
		console.log(`can't send a message that does not have a from address.`);
	}
};