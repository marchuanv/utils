function Logging(){
	this.write=function(message, args){
		if (message==undefined || message==null){
			 var err = new Error('message was empty');
			throw err;
		}
		if (args){
			console.log(message, args);
		}else{
			console.log(message);
		}
	};
};
module.exports=new Logging();