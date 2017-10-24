const httpServer=require('./httpServer.js');

httpServer.getHost(true, function(exitServer, makeRequest, receiveRequest){
	receiveRequest('/', function(request, response) {
		response.status(200).send({message:"test1"});
	});
	console.log();
	console.log('///////////////////////////// TEST 01 START /////////////////////////////');
	makeRequest('http://localhost:3000',{}, function pass(jsonObj){
		console.log('TEST PASSED', jsonObj);
		exitServer();
		console.log('///////////////////////////// TEST 01 END /////////////////////////////');
		console.log();
	},function fail(bodyString){
		console.log('TEST FAILED',bodyString);
		exitServer();
		console.log('///////////////////////////// TEST 01 END /////////////////////////////');
		console.log();
	});
});

httpServer.getHost(false, function(exitServer, makeRequest, receiveRequest){
	receiveRequest('/', function(request, response){
		response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        response.write({message: "test2"});
        response.end();
	});
	console.log();
	console.log('///////////////////////////// TEST 02 START /////////////////////////////');
	makeRequest('http://localhost:3000',{}, function pass(jsonObj){
		console.log('TEST PASSED', jsonObj);
		console.log('///////////////////////////// TEST 02 END /////////////////////////////');
		console.log();
		exitServer();
	},function fail(bodyString){
		console.log('TEST FAILED',bodyString);
		exitServer();
		console.log('///////////////////////////// TEST 02 END /////////////////////////////');
		console.log();
	});
});