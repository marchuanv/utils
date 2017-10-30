function Logging(){
	this.write=function(message, args){
		if (args){
			console.log(message, args);
		}else{
			console.log(message);
		}
	};
};
module.exports=new Logging();