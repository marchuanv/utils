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
const bootstrapExtPath=path.join(__dirname,"bootstrap.lib.js");
const port=process.env.PORT;
const host= process.env.IP || os.hostname();

process.libraries={};
process.submodules={};
process.dependencies={};
process.package=package;

var readyCallback;
module.exports={
	ready: function(callback){
		readyCallback=callback;
	}
};

const libraries=[];
const scripts=fs.readdirSync(path.join(__dirname,"lib")).sort();
scripts.forEach(fileName => {
	libraries.push({
		inputpath: path.join(__dirname, 'lib', fileName),
		outputpath: path.join(__dirname, `${package.name}.min.js`),
		bootstraplib: path.join(__dirname,"bootstrap.lib.js")
	});
});

const submoduleLibraries=[];
process.package.submodules.forEach(function(submodule){
	const submodulename= submodule.name;
	const subfiles=fs.readdirSync(path.join(__dirname, submodulename, "lib")).sort();
	subfiles.forEach(subfileName => {
		submoduleLibraries.push({
			inputpath: path.join(__dirname, submodulename,'lib', subfileName),
			outputpath: path.join(__dirname, submodulename,`${submodulename}.min.js`),
			bootstraplib: path.join(__dirname, submodulename, "bootstrap.lib.js")
		});
	});
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

const bootstraplib=libraries[0].bootstraplib;
minifyScripts(libraries, function(){
	minifyScripts(submoduleLibraries, function(){
		
		loadMinifiedScripts(submoduleLibraries);

	  	if (fs.existsSync(bootstraplib)) {
			
			loadMinifiedScripts(libraries);

		  	var extLib=require(bootstraplib);
			process.libraries=undefined;
			process.dependencies=undefined;
			if (readyCallback){
		  		readyCallback();
			}
		  	module.exports=extLib;
		}
	});
});

function loadMinifiedScripts(scripts){
	const outputScript = scripts[0].outputpath;
	vm.createContext(process.libraries);
	var javascript=fs.readFileSync(outputScript, "utf8");
	var script = new vm.Script(javascript);
	script.runInNewContext(process.libraries);
}

function minifyScripts(scripts, cbMinified){
	const outputScript = scripts[0].outputpath;
	const inputScripts = [];
	scripts.forEach(function(script){
		inputScripts.push(script.inputpath);
	});
	compress.minify({
		compressor: 'no-compress',
		input: inputScripts,
		output: outputScript,
		callback: function (err) {
			if (err){
				var stack = new Error().stack
				console.error(err);
				console.log(stack);	
			} else {
				console.log(`${outputScript} created.`);
				cbMinified();
			}
		}
	});
}