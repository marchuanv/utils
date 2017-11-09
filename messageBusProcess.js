const utils=require('./utils.js');
const name=process.argv[2];
const libName=process.argv[3];
const thisServerAddress=process.argv[4];
const messageSendRetryMax=process.argv[5];
process.env.privatekey=process.argv[6];
const logging = require('./logging.js');
logging.write('PARAMS: ',process.argv);
const MessageBusService = require('./messageBusService.js');
process.env.thisserveraddress=thisServerAddress;
new MessageBusService(
	process,
	messageSendRetryMax,
	true,
	false
);
console.log('message bus service started on child process');