async function minifyScripts(scripts, outputpath){
	if (scripts.length>0){
		console.log(`${package.name}: minifying lib scripts to ${outputpath}.`);
		await compress.minify({
			compressor: 'no-compress',
			input: scripts,
			output: outputpath
		});
	}
}

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

const outputpath=path.join(__dirname, `${package.name}.min.js`);
const scripts=fs.readdirSync(path.join(__dirname,"lib")).sort();
const libraries=[];

scripts.forEach(fileName => {
	const inputpath=path.join(__dirname, 'lib', fileName);
	libraries.push(inputpath);
});

minifyScripts(libraries, outputpath).then(function(){
	vm.createContext(context);
	console.log(`reading ${outputpath}.`);
	var javascript=fs.readFileSync(outputpath, "utf8");
	var script = new vm.Script(javascript);
	script.runInNewContext(context);
	console.log(`${package.name}: ${outputpath} was loaded.`);
	const bootStrapLibPath=path.join(__dirname,"bootstrap.lib.js")
	if (fs.existsSync(bootStrapLibPath)) {
		module.exports=require(bootStrapLibPath);
	}
}).catch(function(err){
	console.log(err);
});