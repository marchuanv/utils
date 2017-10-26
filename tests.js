const utils=require('./utils.js');
const messageBus=new utils.createMessageBus();

try{
	messageBus.subscribe('endpoint1', 'localhost:3000', function success(requestData) {
		console.log('subscriber1 notified: ',requestData);
	});
	messageBus.subscribe('endpoint2', 'localhost:3000', function success(requestData) {
		console.log('subscriber2 notified: ',requestData);
	});
	messageBus.publish('endpoint1', {message:"blaaaaaaaaaaaaaaaaaaaa"});
	messageBus.publish('endpoint2', {message:"naaaaahhhhhhh"});
}catch(err){
	console.log(err);
}