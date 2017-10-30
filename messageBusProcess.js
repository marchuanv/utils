const name=process.argv[2];
const libName=process.argv[3];
const thisServerAddress=process.argv[4];
const logging = require('./logging.js');

logging.write('PARAMS: ',process.argv);

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
	
logging.write(`child process hosting the ${name} library sent a heartbeat message.`);
heartbeatTimer.start(function(){
	var result=process.send('heartbeat');
	if (result==false){
		throw `${name} child process was unable to send heartbeat to parent process`;
	}
});

function validateSubscribeMessage(message, cbValid){
	if (message.to && utils.isValidUrl(message.to)==true){
		logging.write('received subscribe	message is valid');
		cbValid();
	}else{
		logging.write(`${name} child process received a message with an unknown or invalid to address: ${message.to} `);
	}
};
function validatePublishMessage(message, cbValid){
	if (message.channel){
		logging.write('received publish message is valid');
			cbValid();
	}else{
	    logging.write(`${name} child process received a publish message that has no channel`);	
	}
};

//if message is received from parent process.
process.on('message', (message) => {
	message.from=thisServerAddress;
	message.source='internal';
	logging.write('incoming internal message');
	if (message && message !='heartbeat'){
		receiveMessageCheck(message);
	}else{
		logging.write('INTERNAL MESSAGE RECEIVED IS NULL');
	}
});

const port= utils.getHostAndPortFromUrl(thisServerAddress).port;
utils.receiveHttpRequest(port, function requestReceived(message){
	logging.write('incoming external message');
	message.source='external';
	if (message && message !='heartbeat'){
		receiveMessageCheck(message);
	}else{
		logging.write('EXTERNAL MESSAGE RECEIVED IS NULL');
	}
},function requestFailed(err){
	logging.write(`request failed with err ${err}`);
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
		logging.write('received messages must indicate publish or subscribe.');
	}
};

function sendInternalMessage(message){
	logging.write(`sending internal message to ${message.channel} channel.`);
	logging.write(`notifying parent messagebus at ${thisServerAddress}`);
	const result=process.send(message);	
	if (result==false){
		logging.write(`failed to notify parent message bus at ${thisServerAddress}`);
	}
};

function sendExternalMessage(message){
	if (message.to && utils.isValidUrl(message.to)==true) {
		logging.write(`notifying remote subscriptions at ${message.to}`);
		utils.sendHttpRequest(message.to, message, null);
	}else{
		logging.write(`can't send a message that does not have a to address.`);
	}
};