const utils=require('./utils.js');
 process.env.PORT=3000;
const messageBusManager=new utils.createMessageBusManager();
try{
	messageBusManager.subscribe('endpoint1', 'localhost:3000', function success(requestData) {
		console.log('subscriber1 notified: ',requestData);
	});
	messageBusManager.subscribe('endpoint2', 'localhost:3000', function success(requestData) {
		console.log('subscriber2 notified: ',requestData);
	});
	messageBusManager.publish('endpoint1', {message:"blaaaaaaaaaaaaaaaaaaaa"});
	messageBusManager.publish('endpoint2', {message:"naaaaahhhhhhh"});
}catch(err){
	console.log(err);
}
