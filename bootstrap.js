console.log("");

const os = require('os');
const fs = require('fs');
const path = require('path');
const package=require(path.join(__dirname, 'package.json'));
const vm = require('vm');
const appFilePath=path.join(__dirname,"./lib/app.js");
const section = process.argv.slice(2);
const modules=[];

//LOAD ALL THE MODULES THAT ARE NOT HARD REFERENCED
package.submodules.forEach(function(dep){
	for(var propName in dep){
		const submodulePath=path.join(__dirname, propName);
		console.log("Reading submodule code files at ",submodulePath);
	};
});
module.exports=modules;

