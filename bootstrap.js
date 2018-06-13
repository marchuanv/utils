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
const appFilePath=path.join(__dirname,"./lib/app.js");
const startStop = process.argv.slice(2);
const librariesPath=path.join(__dirname,"lib");
const bootstrapExtPath=path.join(__dirname,"bootstrap.ext.js");
const files=fs.readdirSync(librariesPath).sort();
const moduleLibrary=path.join(__dirname, `${package.name}.min.js`);
const port=process.env.PORT;
const host= process.env.IP || os.hostname();

var readyCallback;
module.exports={
	ready: function(callback){
		readyCallback=callback;
	}
};

const libraries=[];
files.forEach(fileName => {
	const fullPath=path.join(__dirname, 'lib', fileName);
	libraries.push(fullPath);
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
			return;
		}
		process.libraries={};
		console.log(`${moduleLibrary} created.`);
		vm.createContext(process.libraries);
		var javascript=fs.readFileSync(moduleLibrary, "utf8");
		var script = new vm.Script(javascript);
		script.runInNewContext(process.libraries);
		
		if (fs.existsSync(bootstrapExtPath)) {
			console.log("loading ", bootstrapExtPath);
		  	var exp=require(bootstrapExtPath);
		  	console.log(exp);
			process.libraries=undefined;
			if (readyCallback){
		  		readyCallback();
			}
		  	module.exports=exp;
		}
	}
});
