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

var depLoadCount=0;
var depLoadedCount=0;
console.log("requiring: ",package.dependencies);
for(var propName in package.dependencies){
	depLoadCount++;
	const mod = require(propName);
	if (mod.ready){
		mod.ready=function(lib){
			console.log(`${package.name}: adding libraries from ${propName}.`);
			process.argv[2][propName]=lib;
			depLoadedCount++;
		};
	}else{
		console.log(`${package.name}: adding libraries from ${propName}.`);
		process.argv[2][propName]=mod;
		depLoadedCount++;
	}
};

waitUntil(function condition(){
	return depLoadCount == depLoadedCount;
},function done(){
	process.argv[3]=package;
	if (libraries.length>0){
		const bootstraplib=libraries[0].bootstraplib;
		minifyScripts(libraries, function(){
			if (submoduleLibraries.length>0){
				minifyScripts(submoduleLibraries, function(){
				  	if (fs.existsSync(bootstraplib)) {
						
						loadMinifiedScripts(libraries, process.argv[2]);
						loadMinifiedScripts(submoduleLibraries, process.argv[2]);

					  	var extLib=require(bootstraplib);
					  	if (extLib){
							module.exports.ready(extLib);
					  		console.log(`${package.name}: ${bootstraplib} was successfull`);
					  	}else{
					  		throw `${package.name}: ${bootstraplib} failed to return a module`;
					  	}
					}
				});
			}else{
				if (fs.existsSync(bootstraplib)) {
						
					loadMinifiedScripts(libraries, process.argv[2]);

				  	var extLib=require(bootstraplib);
				  	if (extLib){
						module.exports.ready(extLib);
						console.log(`${package.name}: ${bootstraplib} was successfull`);
				  	}else{
				  		throw `${package.name}: ${bootstraplib} failed to return a module`;
				  	}
				}
			}
		});
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