const utils = require('./utils.js');
function MessageBus(){

	this.receiveMessage=function(message){
		console.log('');
		console.log(`/// MESSAGE BUS RECEIVED MESSAGE ///`);
		if (utils.isValidUrl(message.address)==true) {
			utils.sendHttpRequest(message.address, message);
		}
		console.log('');
	};
};
module.exports=MessageBus;