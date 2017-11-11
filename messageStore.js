const fs=require('fs');
const utils = require('./utils.js');
function MessageStore(privatekeyJson, isHost) {
	
	const privatekey=utils.getJSONObject(privatekeyJson);
	var fileName='messages.json';
	var filePath=`${__dirname}/${fileName}`;
	filePath=filePath.replace('/node_modules/utils','');

	function readMessages(callback){
		fs.readFile(filePath, {encoding: "utf8"}, function(err, messagesStr){
	        if(err){
	        	console.log(err);
	        	return;
	        }
			const messages=utils.getJSONObject(messagesStr);
			messages.sort(function(x,y){
            	return y.date-x.date;
           	});
			callback(messages);
		});
	};

	function writeMessages(messages, callback){
		fs.exists(filePath, function(exists){
			if (exists==true){
				fs.unlink(filePath, (err) => {
			        if (err) {
			            console.log(err);
			            return
			        } 
					const messagesStr=utils.getJSONString(messages);
			   		fs.writeFile(filePath, messagesStr, function(err){
			   			if(err){
				        	console.log(err);
				        	return;
				        }
				   	  	console.log(`${filePath} created.`);
				   	  	callback();
				   	});
				});
			}else{
				const messagesStr=utils.getJSONString(messages);
		   		fs.writeFile(filePath, messagesStr, function(err){
		   			if(err){
			        	console.log(err);
			        	return;
			        }
			   	  	console.log(`${filePath} created.`);
			   	  	callback();
			   	});
			}
		});
	};

	if (isHost==false){
		utils.downloadGoogleDriveData(privatekey, fileName, function found(messages) {
			console.log('downloaded messages from google drive.');
			writeMessages(messages, function(){
				console.log('messages downloaded from google drive saved to disk');
			});
	    },function notFound(){
	    	writeMessages([], function(){
	    		console.log('no messages found on google drive, local file created');
			});
	    });

		const saveTimer=utils.createTimer(true, 'save');
		saveTimer.setTime(60000);
	    saveTimer.start(function(){
	    	readMessages(function(messages){
				utils.uploadGoogleDriveData(privatekey, fileName, messages);
				console.log('messages uploaded to google drive from disk');
	    	});
	    });
	}

	this.save=function(message, callback){
		fs.exists(filePath, function(exists){
			if (exists==true){
				readMessages(function(messages) {
					messages.push(message);
					writeMessages(messages, callback);
				});
			}else{
		       writeMessages([message], callback);
			}
		});
	};

	this.load=function(callback){
		readMessages(function(messages) {
			callback(messages);
	    });
	};

	this.purge=function(){
		utils.clearGoogleDriveData(privatekey, serviceFileName);
		fs.unlink(filePath, (err) => {
	        if (err) {
	            console.log(err);
	            return
	        } 
		});
	};
};
module.exports=MessageStore;