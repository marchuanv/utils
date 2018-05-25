const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const isWindows = (process.platform === "win32");

const compress=require('node-minify');
const appFilePath=path.join(__dirname,"./lib/app.js");
const startStop = process.argv.slice(2);

const libraries=[];
const librariesPath=path.join(__dirname,"lib");
const files=fs.readdirSync(librariesPath).sort();
files.forEach(fileName => {
	const fullPath=path.join(__dirname, 'lib', fileName);
	libraries.push(fullPath);
});

const moduleLibrary=path.join(__dirname, `${package.name}.min.js`);
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
		const modules={
		  require: require,
		  console: console,
		  package: package
		};
		vm.createContext(modules);
		var javascript=fs.readFileSync(moduleLibrary, "utf8");
		var script = new vm.Script(javascript);
		script.runInNewContext(modules);
		package.submodules.forEach(function(dep){
			const shell = require('shelljs');
			const Powershell=require('node-powershell');
			const submoduleName=dep["name"];
			if (isWindows==true) {
			  let shell = new Powershell({
			    executionPolicy: 'Bypass',
			    noProfile: true
			  });
			  shell.addCommand(`cd ${submoduleName}`);
			  shell.addCommand(`git pull origin master`);
			  shell.addCommand(`cd ..`);
			  shell.invoke().then(output => {
			    console.log(output);
			    shell.dispose();
			  }).catch(err => {
			    console.log(err);
			    shell.dispose();
			  });
			}else{
				shell.exec(`cd ${submoduleName}`);
			  	shell.exec(`git pull origin master`);
			  	shell.exec(`cd ..`);
			}
			const submoduleBootstrapPath=path.join(__dirname, submoduleName, "bootstrap.js");
			const bootstrapSubmodule = require(submoduleBootstrapPath);
			modules[submoduleName]=bootstrapSubmodule
		});
		for(var propName in package.dependencies){
			var friendlyPropName=propName.replace("-","").replace(".","").replace(" ","");
			modules[friendlyPropName]=require(propName);	
		}
		module.exports=modules;
		if (modules.App){
			const app=new modules.App();
			app[startStop]();
		}
	}
});