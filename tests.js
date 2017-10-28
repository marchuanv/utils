const utils=require('./utils.js');
process.env.thisserveraddress='localhost:3000';
const messageBus=new utils.createMessageBusClient();

try{
	messageBus.subscribe('endpoint1', 'localhost:3000', function success(requestData) {
		console.log('subscriber1 notified: ',requestData);
	});
	messageBus.subscribe('endpoint2', 'localhost:3000', function success(requestData) {
		console.log('subscriber2 notified: ',requestData);
	});
	messageBus.publish('endpoint1',   {message:"blaaaaaaaaaaaaaaaaaaaa"});
	messageBus.publish('endpoint2',   {message:"naaaaahhhhhhh"});
}catch(err){
	console.log(err);
}
