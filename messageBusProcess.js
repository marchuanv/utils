const utils=require('./utils.js');
const name=process.argv[2];
const libName=process.argv[3];
const thisServerAddress=process.argv[4];
const remoteServerAddress=process.argv[5];
const messageSendRetryMax=process.argv[6];
const routingMode=Boolean(process.argv[7]);
const logging = require('./logging.js');
logging.write('PARAMS: ',process.argv);
const MessageBusService = require('./messageBusService.js');

process.env.thisserveraddress=thisServerAddress;
process.env.remoteserveraddress=remoteServerAddress;

logging.condition(function(message){
   if(message.indexOf('heartbeat')>=0){
     return false;
   }
   return true;
});

new MessageBusService(
	routingMode,
	process,
	messageSendRetryMax,
	true
);
console.log('message bus service started on child process');
