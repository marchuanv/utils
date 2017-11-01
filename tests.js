const utils=require('./utils.js');
const logging=require('./logging.js');
process.env.thisserveraddress='localhost:3000';
process.env.messageroutingaddress='localhost:9000';
//process.env.thisserveraddress
const messageBus=new utils.createMessageBusClient();
const msg={ message: "LOOP TEST" };
function handleSubscribe(data){
	messageBus.unsubscribe('loop', handleSubscribe);
	messageBus.publish('loop', msg);
	console.log('TEST PASSED', data);
};
messageBus.subscribe('loop', handleSubscribe);
messageBus.publish('loop', msg);
