function CreateLibrary(nodeminify, vm, fs, path){

	this.minify=function(outputDir, outputFilname, libraries, isDebug, isNodeLibrary, cbMinified, cbFailed){
		const exists=fs.existsSync(outputDir);
		if (exists==false){
			console.error(`${outputDir} does not exist!`);
			return;
		}
		const outputPath=path.join(outputDir, outputFilname);
		console.log('minifying: ',libraries);
		nodeminify.minify({
			compressor: 'no-compress',
			input: libraries,
			output: outputPath,
			callback: function (err) {

				if (err){
					var stack = new Error().stack
					console.error(err);
					console.log(stack);	
					return cbFailed(err);
				}

				console.log("non-compressed files created.");
				if (isNodeLibrary==true) {
					var functions=new Object();
					vm.createContext(functions);
					var javascript=fs.readFileSync(outputPath, "utf8");
					vm.runInNewContext(javascript, functions);
					var scriptText = `module.exports={`;
					for(const prop in functions) {
						const func=functions[prop];
						if (typeof func==='function'){
							const funcName=functionName(func);
							var funcStr=func.toString().replace(funcName,"");
							funcStr=`${funcName}:${funcStr},`;
							scriptText=`${scriptText}\r\n${funcStr}`;
						}
					};
					scriptText= scriptText.replace(/(^,)|(,$)/g, "");
					scriptText=`${scriptText}}`;
					fs.writeFileSync(outputPath, scriptText, 'utf8');
				}
				
				if (isDebug==true) {
					return cbMinified(outputPath);
				} else{
					nodeminify.minify({
						compressor: 'gcc',
						input: outputPath,
						output: outputPath,
						callback: function (err) {
							if (err){
								var stack = new Error().stack
								console.error(err);
								console.log(stack);
								return cbFailed(err);
							}
							console.log("compressed files created.");
							return cbMinified(outputPath);
						}
					});
				}
			}
		});
	}
}