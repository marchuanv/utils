const HttpServer=require('./httpService.js');
const httpServer=new HttpServer();

httpServer.start(function success(){
	console.log();
	console.log('///////////////////////////// TEST 01 START /////////////////////////////');
},function fail(){
});

httpServer.receive('/', function success(requestData, respond) {
	if (requestData.message != "requestdata"){
		console.log('TEST FAILED AT RECEIVE: ',requestData);
		console.log('///////////////////////////// TEST 01 END /////////////////////////////');
		console.log();
		httpServer.stop();
	}else{
		respond({message: "responsedata"});
	}
},function fail(err){
	console.log(err);
});

httpServer.send('http://localhost:3000', { message:"requestdata"}, function pass(jsonObj){
	console.log('TEST PASSED', jsonObj);
	console.log('///////////////////////////// TEST 01 END /////////////////////////////');
	console.log();
	httpServer.stop();
},function fail(bodyString){
	console.log('TEST FAILED AT SEND',bodyString);
	console.log('///////////////////////////// TEST 01 END /////////////////////////////');
	console.log();
	httpServer.stop();
});
