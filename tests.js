const utils=require('./utils.js');
const messageBus=new utils.createMessageBus();

try{
	messageBus.subscribe('localhost:3000/endpoint1', function success(requestData) {
		console.log('subscriber1 notified: ',requestData);
	});
	messageBus.subscribe('localhost:3000/endpoint2', function success(requestData) {
		console.log('subscriber2 notified: ',requestData);
	});
	messageBus.publish('localhost:3000/endpoint1', {message:"blaaaaaaaaaaaaaaaaaaaa"});
	messageBus.publish('localhost:3000/endpoint2', {message:"naaaaahhhhhhh"});
}catch(err){
	console.log(err);
}