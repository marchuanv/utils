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
const libraries=[];
const librariesPath=path.join(__dirname,"lib");
const files=fs.readdirSync(librariesPath).sort();
const moduleLibrary=path.join(__dirname, `${package.name}.min.js`);
files.forEach(fileName => {
	const fullPath=path.join(__dirname, 'lib', fileName);
	libraries.push(fullPath);
});

const modules={
  require: require,
  console: console,
  package: package
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
		console.log(`${moduleLibrary} created.`);
		vm.createContext(modules);
		var javascript=fs.readFileSync(moduleLibrary, "utf8");
		var script = new vm.Script(javascript);
		script.runInNewContext(modules);

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
			var friendlyPropName=propName.replace("-","").replace(".","").replace(" ","");
			modules[friendlyPropName]=require(propName);	
		}

		for(var submodule in package.submodules){
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
			var friendlyPropName=propName.replace("-","").replace(".","").replace(" ","");
			modules[friendlyPropName]=require(propName);	
		}

		if (modules.Server){
			const server=new modules.Server();
			server.start();
		}
		if (modules.Client){
			const client=new modules.Client();
			client.start();
		}
	}
});
module.exports=modules;