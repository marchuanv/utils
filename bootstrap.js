console.log("");

const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const compress=require('node-minify');
const bootstrapExtPath=path.join(__dirname,"bootstrap.lib.js");
const port=process.env.PORT;
const host= process.env.IP || os.hostname();

process.argv[2]={
	console: console
};

module.exports={
	ready: function(){
		console.log("ready callback not set moving on...");
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
package.submodules.forEach(function(submodule){
	const submodulename= submodule.name;
	const subfiles=fs.readdirSync(path.join(__dirname, submodulename, "lib")).sort();
	subfiles.forEach(subfileName => {
		submoduleLibraries.push({
			inputpath: path.join(__dirname, submodulename,'lib', subfileName),
			outputpath: path.join(__dirname, submodulename, `${submodulename}.min.js`),
			bootstraplib: path.join(__dirname, submodulename, "bootstrap.lib.js")
		});
	});
});


var moduleDependencies=[];
for(var propName in package.dependencies){
	moduleDependencies.push(propName);
};

var depLoadedCount=0;
moduleDependencies.forEach(function(modulename){
	const mod = require(modulename);
	if (mod.ready){
		mod.ready=function(lib){
			console.log(`${modulename} loaded for ${package.name}.`);
			process.argv[2][modulename]=lib;
			depLoadedCount++;
		};
	}else{
		console.log(`${modulename} loaded for ${package.name}.`);
		process.argv[2][modulename]=mod;
		depLoadedCount++;
	}
});

waitUntil(function condition(){
	console.log(`waiting for ${package.name} dependencies to load before continuing.`);
	return (moduleDependencies.length == depLoadedCount);
},function done(){
	console.log(`dependencies loaded for ${package.name}.`);
	process.argv[3]=package;
	if (libraries.length>0){
		const bootstraplib=libraries[0].bootstraplib;
		console.log(`minifying node_module scripts for ${package.name}.`);
		minifyScripts(libraries, function(){
			if (submoduleLibraries.length>0){
				console.log(`minifying submodule scripts for ${package.name}.`);
				minifyScripts(submoduleLibraries, function(){
				  	if (fs.existsSync(bootstraplib)) {
						
						loadMinifiedScripts(libraries, process.argv[2]);
						loadMinifiedScripts(submoduleLibraries, process.argv[2]);

					  	var extLib=require(bootstraplib);
					  	if (extLib){
							module.exports.ready(extLib);
					  	}else{
					  		throw `${package.name}: ${bootstraplib} failed to return a module`;
					  	}
					}else{
						console.log(`${bootstraplib} does not exist.`);
					}
				});
			}else{
				if (fs.existsSync(bootstraplib)) {
						
					loadMinifiedScripts(libraries, process.argv[2]);

				  	var extLib=require(bootstraplib);
				  	if (extLib){
						module.exports.ready(extLib);
				  	}else{
				  		throw `${package.name}: ${bootstraplib} failed to return a module`;
				  	}
				}else{
					console.log(`${bootstraplib} does not exist.`);
				}
			}
		});
	}else{
		console.log(`${package.name} does not have libraries.`);
	}
});

function loadMinifiedScripts(scripts, context){
	const outputScript = scripts[0].outputpath;
	vm.createContext(context);
	var javascript=fs.readFileSync(outputScript, "utf8");
	var script = new vm.Script(javascript);
	script.runInNewContext(context);
	console.log(`libraries from ${outputScript} was loaded.`);
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

function waitUntil(cbCondition, cbExpired){
	if (cbCondition()){
		cbExpired();
	}else{
		setTimeout(function(){
			waitUntil(cbCondition, cbExpired);
		}, 1000);
	}
}