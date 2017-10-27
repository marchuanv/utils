const utils = require('./utils.js')
const hostPort= process.env.PORT || 3000;

function MessageBusHost(){
	utils.receiveHttpRequest(hostPort, function requestReceived(requestData){
		console.log(`/// MESSAGE BUS HOST IS LISTENING ON PORT ${hostPort} ///`);
		process.send(requestData);
	});
	this.receiveMessage=function(message){
		console.log('');
		console.log(`/// MESSAGE BUS RECEIVED MESSAGE ///`);
		if (utils.isValidUrl(message.address)==true) {
			utils.sendHttpRequest(message.address, message);
		}
		console.log('');
	};
};
module.exports=MessageBusHost;