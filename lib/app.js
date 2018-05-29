function App(){

	console.log(communication);

	const WebSocket=communication.websocket;
	const libDir="/lib/";

	const eventHost= package.eventhost;
	const eventPort=package.eventport;
	const eventComm=new WebSocket(eventHost, eventPort);
	
	const port=process.env.PORT || package.port;
	const host= process.env.IP || package.host || os.hostname();
	const thisComm=new WebSocket(host, port, eventComm);

	this.start=function(){
		thisComm.receiveMessages(function response(message){
			const remotePackage=message.package;
			if (remotePackage) {
				eventComm.send({ 
					name:"remotepackagereceived", 
					date: new Date(), 
					data: remotePackage
				});
				build.installFromGithub(remotePackage.installurl);
				const librariesToMinify=getLibrariesToMinify(remotePackage);
				const minifiedFileName=`${remotePackage.name}.js`;
				createLibrary(libDir, minifiedFileName, librariesToMinify, remotePackage.isdebug, remotePackage.isnodelibrary, function(minifiedLibraryPath){
					const script=fs.readFileSync(minifiedLibraryPath,'utf8');
					eventComm.send({ 
						name:`${remotePackage.name}minified`, 
						date: new Date(), 
						data: script
					});
				},function failed(err){
					eventComm.send({ 
						name:`${remotePackage.name}failedtominify`, 
						date: new Date(), 
						data: err.toString()
					});
				});
			}
		});
	}

	this.stop=function(){
		const appDir= __dirname;
		const libDir=`${appDir}/lib/`;
		const io = require('socket.io-client');
		const port=process.env.PORT || package.port;
		const host= process.env.IP || package.host || os.hostname();

		const socketClient = io.connect(`http://${host}:${port}`); // Specify port if your express server is not using default port 80

		socketClient.on('connect', () => {
		  socketClient.emit('npmStop');
		  setTimeout(() => {
		    process.exit(0);
		  }, 1000);
		});
	}

};