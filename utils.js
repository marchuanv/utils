const http=require('http');
module.exports={
  getRandomNumber: function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  createTimer: function(isInterval, name){
    const Timer = require('./timer.js');
    return new Timer(isInterval, name);
  },
  getJSONString: function(data){
       if (data){
          if (typeof data !== 'string'){
             try{
                return JSON.stringify(data);
             }catch(err){
               return null;
             }
          }
          return data;
      }else{
        return null;
      }
  },
  getJSONObject: function(jsonString){
     try{
        console.log('parsing object to JSON');
        return JSON.parse(jsonString);
      }catch(err){
        return null;
      }
  },
  newGuid: function(){
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
  },
  receiveMessagesOnSocket: function(hostPort, callback){
      console.log();
      console.log(`/////////////////////////////////  STARTING SOCKET SERVER ///////////////////////////////`);
      const net = require('net');
      var server = net.createServer(function(socket) {
          socket.setEncoding("utf8");
          socket.write('Echo server\r\n');
          socket.on('data', function(message) {
              callback(message);
          });
      });
      server.listen(hostPort,function(){
          console.log('socket server started on port 80');
      });
      console.log();
  },
  sendMessagesOnSocket: function(hostPort, message){
      console.log();
      console.log(`/////////////////////////////////  SENDING MESSAGE TO SOCKET SERVER ///////////////////////////////`);
      const net = require('net');
      var client = new net.Socket();
      client.connect(hostPort, function(){
          console.log(`connected to socket server on port ${hostPort}`);
          const dataStr=module.exports.getJSONString(message);
          client.write(dataStr);
      });
      console.log();
  },
  createChildProcess:function(name, fileName, port, protocol, autoRestart, restartTimer){
      console.log();
      console.log(`/////////////////////////////////  CREATING CHILD PROCESS ${name} ///////////////////////////////`);
      if (!restartTimer){
        restartTimer=module.exports.createTimer(false, 'child process restart');
        restartTimer.setTime(10000);
      }
      const childFile=`${__dirname}/childProcess.js`;
      const cp = require('child_process');
      const childProcess=cp.fork(childFile, [name, fileName, port, protocol]);
      function handleEvent(reason, error){
          childProcess.kill();
          console.log(`reason: ${reason}, error: ${error}`);
          if (autoRestart && restartTimer.started==false){
              restartTimer.start(function(){
                  module.exports.createChildProcess(name, fileName, port, protocol, autoRestart, restartTimer);
                  restartTimer.stop();
              });
          }
      };
       childProcess.on('exit', function(obj){
        handleEvent("exit", obj);
      });
      childProcess.on('SIGINT',  function(obj){
        handleEvent("SIGINT");
      });
      childProcess.on('SIGHUP', function(obj){
        handleEvent("SIGHUP");
      });
      childProcess.on('SIGUSR1', function(obj){
        handleEvent("SIGUSR1");
      });
      childProcess.on('SIGUSR2', function(obj){
        handleEvent("SIGUSR2");
      });
      childProcess.on('close', function(obj){
        handleEvent("close", obj);
      });
      childProcess.on( 'SIGTERM', function(obj){
        handleEvent("SIGTERM");
      });
      childProcess.on('error', function(obj){
        handleEvent("error", obj);
      });
      childProcess.on('uncaughtException', function(obj){
        handleEvent("uncaughtException", obj);
      });
      console.log();
      return childProcess;
  },
  createMessageBusManager: function(){
      const MessageBusManager=require('./messageBusManager.js');
      const port= process.env.PORT;
      const protocol= process.env.protocol;
      if (protocol=='HTTP'){
          var httpMessageBus=module.exports.createChildProcess('HttpMessageBus', './messageBus.js', port, 'HTTP', true);
          const messageBusManager=new MessageBusManager(httpMessageBus);
          return messageBusManager;
      }else if (protocol=='TCP'){
          var tcpMessageBus=module.exports.createChildProcess('HttpMessageBus', './messageBus.js', port, 'TCP', true);
          const messageBusManager=new MessageBusManager(tcpMessageBus);
          return messageBusManager;
      }
  },
  consoleReset :function () {
    return process.stdout.write('\033c');
  },
  removeUnserialisableFields: function(data){
    const newObj={};
    for(var i in data){
      try{
        JSON.stringify(data[i]);
        newObj[i]=data[i];
      }catch(err){
      }
    };
    return newObj;
  },
  createCache: function(cacheJson){
    const Cache = require('/cache.js');
    return new Cache(cacheJson);
  },
  sendHttpRequest: function(url, data, callback){
      console.log('creating an http request.');
      const postData=module.exports.getJSONString(data);
      
      const addressSplit=url.replace('http://','')
                                .replace('https://','')
                                .split(':');
      const host = addressSplit[0].split('/')[0];
      const path = module.exports.getUrlPath(url);
      var port=addressSplit[1].split('/')[0];
      if (!port){
        port=80;
      }
      const options = {
          host: host,
          port: port, 
          method:'POST',
          path: path,
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
          }
      };
      console.log('options',options);
      const request=http.request(options);
      request.on('error', function(err){
        const errMsg=`Http error occurred: ${err}`;
        console.log(errMsg);
        throw errMsg;
      });
      request.on('response', function (response) {
          response.setEncoding('utf8');
          response.on('data', function (body) {
            if (callback){
              callback(body);
            }
          });
      });
      request.end(postData);
    },
    receiveHttpRequest: function(hostPort, callback, callbackError){
      const httpServer=http.createServer(function(req, res){
          console.log('http request received');
          const body = [];
          res.on('error',function(err){
              const errMsg=`Http error occurred at ${location}: ${err}`;
              console.log(errMsg);
              callbackError(errMsg);
          });
          req.on('data', function (chunk) {
              body.push(chunk);
          });
          req.on('end', function () {
            console.log('http request data received');
            const requestBodyJson=Buffer.concat(body).toString();
            const requestBody=module.exports.getJSONObject(requestBodyJson);
            if (requestBody) {
                res.statusCode = 200;
                res.end(`subscribers at ${req.url} was notified`);
                callback(requestBody);
            } else {
                res.statusCode = 500;
                res.end(message);
                callbackError(`no request body`);
            }
        });
      });
      httpServer.listen(hostPort,function(){
          console.log();
          console.log(`http server started and listening on port ${hostPort}`);
          console.log();
      });
    },
    isValidUrl:function(url){
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(url);
    },
    getUrlPath(url){
        var url_parts = require('url').parse(url);
        return url_parts.pathname;
    }
};