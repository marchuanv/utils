const utils = require('./utils.js');
function MessageBus(name){
	this.receiveMessage=function(message){
		console.log('');
		console.log(`/// ${name} MESSAGE BUS RECEIVED A MESSAGE ///`);
		console.log(`message: `,message);
		console.log('');
	};
};
module.exports=MessageBus;