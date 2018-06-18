console.log("");

const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const isWindows = (process.platform === "win32");
const shell = require('shelljs');
const Powershell=require('node-powershell');
const compress=require('node-minify');
const files=fs.readdirSync(path.join(__dirname,"lib")).sort();
const bootstrapExtPath=path.join(__dirname,"bootstrap.lib.js");
const moduleLibrary=path.join(__dirname, `${package.name}.min.js`);
const port=process.env.PORT;
const host= process.env.IP || os.hostname();

process.libraries={};
process.dependencies={};
process.package=package;

var readyCallback;
module.exports={
	ready: function(callback){
		readyCallback=callback;
	}
};

const libraries=[];
files.forEach(fileName => {
	libraries.push(path.join(__dirname, 'lib', fileName));
});

for(var propName in package.dependencies){
	if (isWindows==true) {
	  let shell = new Powershell({
	    executionPolicy: 'Bypass',
	    noProfile: true
	  });
	  shell.addCommand(`npm update ${propName}`);
	  shell.invoke().then(output => {
	    console.log(output);
	    shell.dispose();
	  }).catch(err => {
	    console.log(err);
	    shell.dispose();
	  });
	}else{
		shell.exec(`npm update ${propName}`);
	}
	process.dependencies[propName]=require(propName);
};

compress.minify({
	compressor: 'no-compress',
	input: libraries,
	output: moduleLibrary,
	callback: function (err) {
		if (err){
			var stack = new Error().stack
			console.error(err);
			console.log(stack);	
		} else {
			console.log(`${moduleLibrary} created.`);
			vm.createContext(process.libraries);
			var javascript=fs.readFileSync(moduleLibrary, "utf8");
			var script = new vm.Script(javascript);
			script.runInNewContext(process.libraries);
			if (fs.existsSync(bootstrapExtPath)) {
				console.log("loading ", bootstrapExtPath);
			  	var exp=require(bootstrapExtPath);
				process.libraries=undefined;
				process.dependencies=undefined;
				if (readyCallback){
			  		readyCallback();
				}
			  	module.exports=exp;
			}
		}
	}
});
