const utils=require('./utils.js');
const name=process.argv[2];
const libName=process.argv[3];
const thisServerAddress=process.argv[4];
const messageRoutingAddress=process.argv[5];
const messageSendRetryMax=process.argv[6];
const logging = require('./logging.js');
logging.write('PARAMS: ',process.argv);
const MessageBusService = require('./messageBusService.js');
new MessageBusService(
	thisServerAddress,
	messageRoutingAddress,
	process, 
	messageSendRetryMax,
	true
);
console.log('message bus service started on child process');