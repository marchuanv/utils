const fs=require('fs');
const utils = require('./utils.js');
function MessageStore(privatekeyJson, canReplay, fileName) {
	
	const privatekey=utils.getJSONObject(privatekeyJson);
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
				   	  	if (callback){
				   	  		callback();
				   	  	}
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
			   	  	if (callback){
				   		callback();
					}
			   	});
			}
		});
	};

	fs.exists(filePath, function(exists){
		if (exists==false){
			writeMessages([], function(){
			});
		}
	});

	if (canReplay==true){
		utils.downloadGoogleDriveData(privatekey, fileName, function found(messages) {
			console.log('downloaded messages from google drive.');
			writeMessages(messages, function(){
				console.log('messages downloaded from google drive saved to disk');
			});
	    });
		const saveTimer=utils.createTimer(true, 'save');
		saveTimer.setTime(60000);
	    saveTimer.start(function(){
	    	readMessages(function(messages){
	    		utils.clearGoogleDriveData(privatekey, fileName);
				utils.uploadGoogleDriveData(privatekey, fileName, messages);
				console.log('messages uploaded to google drive from disk');
	    	});
	    });
	}

	this.save=function(message, callback){
		if (canReplay==false){
			return;
		}
		readMessages(function(messages) {
			messages.push(message);
			writeMessages(messages, callback);
		});
	};

	this.load=function(callback){
		readMessages(function(messages) {
			callback(messages);
	    });
	};

	this.purge=function(){
		utils.clearGoogleDriveData(privatekey, fileName);
		writeMessages([], function(){
			console.log(`${fileName} cleaned`);
		});
	};
};
module.exports=MessageStore;