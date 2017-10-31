const utils=require('./utils.js');
const logging=require('./logging.js');
process.env.thisserveraddress='localhost:3000';
const messageBus=new utils.createMessageBusClient();

const msg={ message: "LOOP TEST" };
function handleSubscribe(data){
	messageBus.unsubscribe('loop',function(){
		// messageBus.publish('loop',  process.env.thisserveraddress,  msg);
		//messageBus.subscribe('loop', handleSubscribe);
		console.log('TEST PASSED');
	},function fail(){
		console.log('failed to unsubscribe');
	});
};
messageBus.subscribe('loop', handleSubscribe);
