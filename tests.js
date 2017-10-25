const utils=require('./utils.js');
const httpService=new utils.createHttpService();

httpService.start(function success(){
	console.log();
	console.log('///////////////////////////// TEST 01 START /////////////////////////////');
},function fail(){
});

httpService.receive('/', function success(requestData, respond) {
	if (requestData.message != "requestdata"){
		console.log('TEST FAILED AT RECEIVE: ',requestData);
		console.log('///////////////////////////// TEST 01 END /////////////////////////////');
		console.log();
		httpService.stop();
	}else{
		respond({message: "responsedata"});
	}
},function fail(err){
	console.log(err);
});

httpService.send('http://localhost:3000', { message:"requestdata"}, function pass(jsonObj){
	console.log('TEST PASSED', jsonObj);
	console.log('///////////////////////////// TEST 01 END /////////////////////////////');
	console.log();
	httpService.stop();
},function fail(bodyString){
	console.log('TEST FAILED AT SEND',bodyString);
	console.log('///////////////////////////// TEST 01 END /////////////////////////////');
	console.log();
	httpService.stop();
});
