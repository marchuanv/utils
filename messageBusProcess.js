const utils=require('./utils.js');
const name=process.argv[2];
const libName=process.argv[3];
const thisServerAddress=process.argv[4];
const logging = require('./logging.js');

logging.write('PARAMS: ',process.argv);

const CLASS=require(libName);
var receivePublishMessage;
var receiveSubscribeMessage;

const messageService=new MessageService();

const instance = new CLASS(name, thisServerAddress, function(callback){
	receivePublishMessage=callback;
}, function(callback){
	receiveSubscribeMessage=callback;
}, function (message){
	sendInternalMessage(message);
}, function(message){
	sendExternalMessage(message);
});


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


