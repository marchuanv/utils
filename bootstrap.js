console.log("");

const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const bootstrapConfig=module.require('./bootstrap.json');
const appFilePath=path.join(__dirname,"./lib/app.js");

modules["utils"]=[]; 
 modules["utils"].push("./lib/utils.js"); 
 modules["utils"].push("eventpublisher"); 
 modules["utils"].push("factory"); 
 modules["utils"].push("communication");

if (fs.existsSync(appFilePath)) {
	const section = process.argv.slice(2);
	cosnt app=require(appFilePath);
	if (section=="start"){
		app.start();
	}else if (section=="stop"){
		app.stop();
	}
}else{
	module.exports=modules;
}

