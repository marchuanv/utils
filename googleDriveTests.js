const utils=require('./utils.js');
var privatekey;
try{
	privatekey=require('./privatekey.json');
} catch(err) {
	console.log(err);
}

utils.clearGoogleDriveData(privatekey);
// utils.downloadGoogleDriveData(privatekey, 'messages.json', function found(data){
// },function notFound(){
// 	utils.uploadGoogleDriveData(privatekey,'messages.json', {
// 		message: "test"
// 	},function done(){
// 		utils.downloadGoogleDriveData(privatekey,'messages.json', function found(data){
// 			console.log('TEST PASSED: ',data);
// 		},function notFound(){
// 			console.log('TEST FAILED: ');
// 		});
// 	});
// });
