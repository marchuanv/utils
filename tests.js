const utils=require('./utils.js');
const logging=require('./logging.js');
process.env.thisserveraddress='localhost:3000';
const messageBus=new utils.createMessageBusClient();
const msg={ message: "LOOP TEST" };
function handleSubscribe(data){
	messageBus.unsubscribe('loop', handleSubscribe);
	messageBus.publish('loop', process.env.thisserveraddress, msg);
	console.log('TEST PASSED', data);
};
messageBus.subscribe('loop', handleSubscribe);
messageBus.publish('loop', process.env.thisserveraddress, msg);
