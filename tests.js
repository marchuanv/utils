const utils=require('./utils.js');
const logging=require('./logging.js');
process.env.thisserveraddress='localhost:3000';
process.env.messageroutingaddress='localhost:3000';

const messageBus=new utils.createMessageBusClient(false);
const msg={ 
	message: "LOOP TEST"
};
function handleSubscribe(data){
	messageBus.unsubscribe('loop', handleSubscribe);
	messageBus.publish('loop', msg);
	console.log('FIRST TEST PASSED', data);
};
messageBus.subscribe('loop', handleSubscribe);
messageBus.publish('loop', msg);
messageBus.subscribe('routing', function(message){
	console.log('routing: ', message);
});

