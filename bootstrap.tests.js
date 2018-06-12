console.log("");

const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const appFilePath=path.join(__dirname,"./lib/app.js");
const startStop = process.argv.slice(2);
const libraries=[];
const librariesPath=path.join(__dirname,"lib");
const files=fs.readdirSync(librariesPath).sort();
const specsDir=path.join(__dirname, `specs`);
const websocket=require('websocket');
const http=require('http');
const specToRun=process.argv[2];

files.forEach(fileName => {
	const fullPath=path.join(__dirname, 'lib', fileName);
	libraries.push(fullPath);
});

const modules={
  require: require,
  console: console,
  package: package,
  websocket: websocket,
  http: http
};

for(var propName in package.dependencies){
	var friendlyname=propName.replace("-","").replace(".","").replace(" ","");
	modules[friendlyname]=require(propName);	
};

libraries.forEach(function(lib){
	vm.createContext(modules);
	var javascript=fs.readFileSync(lib, "utf8");
	var script = new vm.Script(javascript);
	script.runInNewContext(modules);
});

setTimeout(function(){
	
	const specifications=[];
	fs.readdirSync(specsDir).forEach(file => {
		const specFile=path.join(specsDir, file);
		specifications.push( {name: file, file:require(specFile)});
	});
	specifications.forEach(spec=>{
		if (spec.name == specToRun || !specToRun){
			console.log("----------------------------------------------------------------");
			console.log(`running ${spec.name}`);
			spec.file.run(modules,function pass(msg){
				console.log(`${spec.name} passed!.`);
			},function fail(err){
				console.log(`${spec.name} failed!.`);
				throw err;
			});
			console.log("----------------------------------------------------------------");
		}
	});

},5000);

module.exports=modules;