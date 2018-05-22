console.log("");

const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const appFilePath=path.join(__dirname,"./lib/app.js");
const shelljs=require("shelljs");

const section = process.argv.slice(2);


//LOAD ALL THE MODULES THAT ARE NOT HARD REFERENCED
package.submodules.forEach(function(mod){
	if (mod.name==package.name) {
		const softRefDependantModules=package.submodules.filter(function(mod2) { 
			const matches=mod.modules.filter(function(m) { 
				return mod2.name==m.name && m.ishardreference==false; 
			});
			if (matches.length > 0){
				return true; 
			}
			return false;
		});
		softRefDependantModules.forEach(function(depModule) {

		});
	}
});

modules["factory"].forEach(function(entry){
	if (entry.scriptfilepath){
		entry.scriptfilepath=path.resolve(entry.scriptfilepath);
		var functions=new Object();
		vm.createContext(functions);
		var javascript=fs.readFileSync(entry.scriptfilepath,"utf8");
		vm.runInNewContext(javascript, functions);
		var scriptText=`module.exports={`;
		for(const prop in functions) {
			const func=functions[prop];
			if (typeof func==='function'){
				const funcName=utils.getFunctionName(func);
				var funcStr=func.toString().replace(funcName,"");
				funcStr=`${funcName}:${funcStr},`;
				scriptText=`${scriptText}\r\n${funcStr}`;
			}
		};
		scriptText= scriptText.replace(/(^,)|(,$)/g, "");
		scriptText=`${scriptText}}`;
		entry.script = scriptText;
	}
});

const found = modules["factory"].forEach(function(entry){
	if (entry.name == "app"){
		console.log("app module info: ",entry);
		const app=require(entry.scriptfilepath);
		if (section=="start"){
			app.start();
		}else if (section=="stop"){
			app.stop();
		}
		return true;
	}
});
if (!found) {
	module.exports=modules;
}


