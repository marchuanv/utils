function GetLibrariesToMinify(path, fs){

	this.get=function(registration){
		const filesToMinify=[];
		const modulesToMinify=[registration.libraryname];
		for(var modName in registration.dependencies) {
			const location=registration.dependencies[modName];
			if (location==""){
				modulesToMinify.push(modName);
			}
		}
		modulesToMinify.forEach(function(modName){
			const nodeModulePath=path.join(__dirname,'node_modules', modName);
			const nodeModulePackage=path.join(nodeModulePath, 'package.json');
			const packageDep=require(nodeModulePackage);
			for(var modName in packageDep.dependencies) {
				const location=packageDep.dependencies[modName];
				if (location=="" && modulesToMinify.indexOf(modName)==-1){
					modulesToMinify.push(modName);
				}
			}
		});
		modulesToMinify.forEach(function(modName){
			const nodeModulePath=path.join(__dirname,'node_modules', modName);
			const libPath=path.join(nodeModulePath, 'lib');
			if (fs.existsSync(libPath)==true){
				console.log(`looking for ${modName} module at ${libPath}`);
				const files=fs.readdirSync(libPath).sort();
				files.forEach(fileName => {
					console.log("fileName: ",fileName);
					console.log("libname: ",modName);
					if (fileName==`${modName}.js`){
						const fullPath=path.join(__dirname,'node_modules',modName, 'lib', fileName);
						filesToMinify.push(fullPath);
					}
				});
			}else{
				console.log(`${librariesPath} does not exist.`);
			}
		});
		return filesToMinify;
	}
}