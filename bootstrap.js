console.log("");
console.log("BOOTSTRAP.JS");
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const compress=require('node-minify');
const package=require(path.join(__dirname, 'package.json'));
const context={
	console: console,
	require: require
};
process.argv[2]=context;
process.argv[3]=package;
process.argv[4]=__dirname;

const scripts=fs.readdirSync(path.join(__dirname,"lib")).sort();
const libraries=[];
scripts.forEach(fileName => {
	libraries.push({
		inputpath: path.join(__dirname, 'lib', fileName),
		outputpath: path.join(__dirname, `${package.name}.min.js`)
	});
});

minifyScripts(libraries);
loadMinifiedScripts(libraries, context);

const bootStrapLibPath=path.join(__dirname,"bootstrap.lib.js")
if (fs.existsSync(bootStrapLibPath)) {
	module.exports=require(bootStrapLibPath);
}

function loadMinifiedScripts(scripts, context){
	const outputScript = scripts[0].outputpath;
	vm.createContext(context);
	var javascript=fs.readFileSync(outputScript, "utf8");
	var script = new vm.Script(javascript);
	script.runInNewContext(context);
	console.log(`${package.name}: ${outputScript} was loaded.`);
}

async function minifyScripts(scripts){
	const outputScript = scripts[0].outputpath;
	console.log(`${package.name}: minifying lib scripts to ${outputScript}.`);
	const inputScripts = [];
	scripts.forEach(function(script){
		if (fs.existsSync(script.inputpath)) {
			inputScripts.push(script.inputpath);
		}else{
			throw `${script.inputpath} does not exist!`;
		}
	});
	await compress.minify({
		compressor: 'no-compress',
		input: inputScripts,
		output: outputScript
	});
}