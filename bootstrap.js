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
const appFilePath=path.join(__dirname,"./lib/app.js");
const startStop = process.argv.slice(2);
const libraries=[];
const librariesPath=path.join(__dirname,"lib");
const files=fs.readdirSync(librariesPath).sort();
const moduleLibrary=path.join(__dirname, `${package.name}.min.js`);
const port=process.env.PORT;
const host= process.env.IP || os.hostname();

files.forEach(fileName => {
	const fullPath=path.join(__dirname, 'lib', fileName);
	libraries.push(fullPath);
});

const modules={
  require: require,
  console: console,
  package: package
};

compress.minify({
	compressor: 'no-compress',
	input: libraries,
	output: moduleLibrary,
	callback: function (err) {
		if (err){
			var stack = new Error().stack
			console.error(err);
			console.log(stack);	
			return;
		}
		console.log(`${moduleLibrary} created.`);
		vm.createContext(modules);
		var javascript=fs.readFileSync(moduleLibrary, "utf8");
		var script = new vm.Script(javascript);
		script.runInNewContext(modules);
	}
});

var dependencies=[];
for(var propName in package.dependencies){
	var friendlyPropName=propName.replace("-","").replace(".","").replace(" ","");
	dependencies.push({
		name: propName,
		friendlyname: friendlyPropName
	});
};

dependencies.forEach(function(dep){
	if (isWindows==true) {
	  let shell = new Powershell({
	    executionPolicy: 'Bypass',
	    noProfile: true
	  });
	  shell.addCommand(`npm update ${dep.name}`);
	  shell.invoke().then(output => {
	    console.log(output);
	    shell.dispose();
	  }).catch(err => {
	    console.log(err);
	    shell.dispose();
	  });
	}else{
		shell.exec(`npm update ${dep.name}`);
	}
	const friendlyname=dep.friendlyname;
	const name=dep.name;
	modules[friendlyname]=require(name);	
});

setTimeout(function(){
	if (package.name != "communication"){

		var communication=modules.communication;
		const factorycommunication= new communication.WebSocket(package.factoryhost, package.factoryport);
		const eventpublishercommunication= new communication.WebSocket(package.eventhost, package.eventport);
		const client= new communication.WebSocket(package.host, package.port);
		
		const factoryChannelName="factory";
		const getInstanceEventName="getinstance";
		const registerTypesEventName="registerclass";
		const factoryInstruction= {ref: null, class: null, instance: null};
		
		if (package.factoryhost==host && package.factoryport==port) {
			const factory = new modules.Factory();
			factorycommunication.receive(function response(instruction, cbRespond){
				if (instruction.ref){
					factory.getInstance(instruction.ref, function(instance){
						instruction.instance=instance;
						cbRespond(instruction);
					});
				}else if (instruction.class){
					factory.registerFunction(instruction.class, function(ref){
						instruction.ref=ref;
						cbRespond(instruction);
					});
				}else{
					cbRespond(null);
				}
			});
		} else if (package.eventhost==host && package.eventport==port) {
			eventpublishercommunication.receive(function response(event){
				if (event.channel==factoryChannelName && event.name == getInstanceEventName){

					factoryInstruction.ref=event.data.ref;
					factoryInstruction.class = null;
					factoryInstruction.instance = null;

					factorycommunication.send(factoryInstruction, function received(res) {
						if (res && res.instance){
							const objFoundEvent={ name:"objectfound", channel: factoryChannelName, data: res.instance };
							eventpublishercommunication.send(objFoundEvent, function received() {
							},function(err){
								throw "failed to send event, infrastructure is not working"
							});
						}else{
							const objNotFoundEvent={ name:"objectnotfound", channel: factoryChannelName, data: {} };
							eventpublishercommunication.send(objNotFoundEvent, function received() {
							},function(err){
								throw "failed to send event, infrastructure is not working"
							});
						}
					},function failed(){
						throw "failed to send event, infrastructure is not working"
					});
				}
				if (event.channel==factoryChannelName && event.name == registerTypesEventName){
					
					factoryInstruction.ref = null;
					factoryInstruction.class=event.data.function;
					factoryInstruction.instance = null;

					factorycommunication.send(factoryInstruction, function received(res) {
						if (res && res.ref){
							const registeredEvent={ name:"registered", channel: factoryChannelName, data: {} };
							eventpublishercommunication.send(registeredEvent, function received() {
							},function(){
								throw "failed to send event, infrastructure is not working"
							});
						}else{
							const notRegisteredEvent={ name:"notregistered", channel: factoryChannelName, data: {} };
							eventpublishercommunication.send(notRegisteredEvent, function received() {
							},function(){
								throw "failed to send event, infrastructure is not working"
							});
						}
					},function failed(){
						throw "failed to send event, infrastructure is not working"
					});
				}
			});
		} else {
			var event={ name:"initialise", channel:package.name, data: null };
			eventpublishercommunication.send(event, function received(remoteMessage) {
			},function failed(){
				throw "failed to send event, infrastructure is not working"
			});
		}
	}
	console.log("");
	console.log(`-------------------------------< LOADED ALL MODULES FOR ${package.name} >-----------------------------------`);
	dependencies.forEach(function(dep){
		console.log(dep);
	});
	console.log(`------------------------------------------------------------------------------------------------------------`);
	console.log("");
},5000);
module.exports=modules;

http://
