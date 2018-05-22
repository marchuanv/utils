console.log("");
const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const bootstrapConfig=module.require('./bootstrap.json');
const modules={ 
	os: os,
	fs: fs,
	path: path,
	vm: vm,
	process: process,
	package: package
};

 
 factory("./lib/utils.js",false, modules); 
 factory("eventpublisher",false, modules); 
 factory("factory",false, modules); 
 factory("communication",false, modules);

const section = process.argv.slice(2);
if (section=="start"){
	modules.app.start();
}else if (section=="stop"){
	modules.app.stop();
}else{
	module.exports=modules;
}

function factory(scriptFilePath, isExternalDep, modules) {
	console.log("");
	console.log(`loading ${scriptFilePath}`);
	const name=modules.path.basename(scriptFilePath);

	if (scriptFilePath.indexOf(".js")>=0 && isExternalDep==false && scriptFilePath.indexOf(".json")==-1){
		var _class = new Object();
		const filePath =modules.path.join(__dirname, scriptFilePath)
		var functions=new Object();
		vm.createContext(functions);
		var javascript=fs.readFileSync(filePath, "utf8");
		vm.runInContext(javascript, functions);
		for(const prop in functions) {
			const func=functions[prop];
			if (typeof func==='function'){
				_class=func;
				break;
			}
		};

		function waitForParams(callback){
			setTimeout(function(){
				const len=bootstrapConfig[name].length;
				const params=[];
				bootstrapConfig[name].forEach(function(entry){
					const param = modules[entry];
					if (param){
						params.push(param);
					}
				});
				if (params.length==len){
					callback(params);
				}else{
					waitForParams(callback);
				}
			},1000);
		}
		waitForParams(function(params){
			modules[name]=Reflect.construct(_class, params);
		});
	}else {
		modules[name]=module.require(scriptFilePath);
	}
}

