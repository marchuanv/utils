const utils=require('./utils.js');
const messageBus=new utils.createMessageBus();

try{
	messageBus.subscribe('localhost:3000', function success(requestData) {
		console.log('subscriber notified: ',requestData);
	});
	messageBus.publish('localhost:3000', {message:"blaaaaaaaaaaaaaaaaaaaa"});
	// setInterval(function(){

	// },1000);
}catch(err){
	console.log(err);
}