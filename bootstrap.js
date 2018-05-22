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

 
 factory("./lib/utils.js",false, modules, bootstrapConfig); 
 factory("eventpublisher",false, modules, bootstrapConfig); 
 factory("factory",false, modules, bootstrapConfig); 
 factory("communication",false, modules, bootstrapConfig);

const section = process.argv.slice(2);
setTimeout(function(){
	if (section=="start"){
		console.log(modules);
		modules.app.start();
	}else if (section=="stop"){
		modules.app.stop();
	}else{
		module.exports=modules;
	}
},50000);

function factory(scriptFilePath, isExternalDep, modules, config) {
	console.log("");
	const filePathSplit=scriptFilePath.split('/');
	const fileName=filePathSplit[filePathSplit.length-1];
	const name=fileName.replace(" ","").replace(".json","").replace(".js","").replace(".","").replace("-","");
	console.log(`loading ${name}`);
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
				config.forEach(function(item){
					console.log("waiting for ", item.name);
					if (item.name==name){
						const params=[];
						item.parameters.forEach(function(param){
							const instance=modules[param];
							if (instance){
								params.push(instance);
							}
						});
						if (params.length == item.parameters.length){
							callback(params);
						}else{
							waitForParams(callback);
						}
					}else{
						waitForParams(callback);
					}
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

