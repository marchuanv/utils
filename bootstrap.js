console.log("");

const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const compress=require('node-minify');
const appFilePath=path.join(__dirname,"./lib/app.js");
const section = process.argv.slice(2);
const libraries=[];
const librariesPath=path.join(__dirname,"lib");
const files=fs.readdirSync(librariesPath).sort();
const moduleLibrary=path.join(__dirname, `${package.name.min.js}`);
files.forEach(fileName => {
	const fullPath=path.join(__dirname, 'lib', fileName);
	libraries.push(fullPath);
});
compress.minify({
	compressor: 'no-compress',
	input: libraries,
	output: moduleLibrary,
	callback: function (err) {
		if (err){
			var stack = new Error().stack
			console.error(err);
			console.log(stack);	
		}
		console.log(`${moduleLibrary} created.`);
		const modules=new Object();
		vm.createContext(modules);
		var javascript=fs.readFileSync(moduleLibrary, "utf8");
		vm.runInNewContext(javascript, modules);
		package.submodules.forEach(function(dep){
			const submoduleName=dep["name"];
			const submoduleBootstrapPath=path.join(__dirname, submoduleName, "bootstrap.js");
			const submoduleBootstrap = require(submoduleBootstrapPath);
			modules[submoduleName]=submoduleBootstrap
		});
		module.exports=modules;
	}
});

