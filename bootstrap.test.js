console.log("");
const fs = require('fs');
const path = require('path');
const specsDir=path.join(__dirname, `specs`);
const specToRun=process.argv[2];
	
const specifications=[];
fs.readdirSync(specsDir).forEach(file => {
	const specFile=path.join(specsDir, file);
	specifications.push({ 
		name: file, 
		file: require(specFile)
	});
});

require("./bootstrap.js").ready=function(instanceUnderTest){
	specifications.forEach(spec=>{
		if (spec.name == specToRun || !specToRun){
			console.log("----------------------------------------------------------------");
			console.log(`running ${spec.name}`);
			spec.file.run(instanceUnderTest, function pass(){
				console.log(`${spec.name} passed!.`);
			},function fail(err){
				console.log(`${spec.name} failed!.`);
				throw err;
			});
			console.log("----------------------------------------------------------------");
		}
	});
};