const http=require('http');
const logging=require('./logging.js');
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
        logging.write('parsing object to JSON');
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
      logging.write();
      logging.write(`/////////////////////////////////  STARTING SOCKET SERVER ///////////////////////////////`);
      const net = require('net');
      var server = net.createServer(function(socket) {
          socket.setEncoding("utf8");
          socket.write('Echo server\r\n');
          socket.on('data', function(message) {
              callback(message);
          });
      });
      server.listen(hostPort,function(){
          logging.write('socket server started on port 80');
      });
      logging.write();
  },
  sendMessagesOnSocket: function(hostPort, message){
      logging.write();
      logging.write(`/////////////////////////////////  SENDING MESSAGE TO SOCKET SERVER ///////////////////////////////`);
      const net = require('net');
      var client = new net.Socket();
      client.connect(hostPort, function(){
          logging.write(`connected to socket server on port ${hostPort}`);
          const dataStr=module.exports.getJSONString(message);
          client.write(dataStr);
      });
      logging.write();
  },
  createMessageBusProcess:function(name, fileName, thisServerAddress, autoRestart, restartTimer){
      logging.write();
      logging.write(`/////////////////////////////////  CREATING CHILD PROCESS ${name} ///////////////////////////////`);
      if (!restartTimer){
        restartTimer=module.exports.createTimer(false, 'child process restart');
        restartTimer.setTime(10000);
      }
      const childFile=`${__dirname}/messageBusProcess.js`;
      const cp = require('child_process');
      const childProcess=cp.fork(childFile, [name, fileName, thisServerAddress]);
      function handleEvent(reason, error){
          childProcess.kill();
          logging.write(`reason: ${reason}, error: ${error}`);
          if (autoRestart && restartTimer.started==false){
              restartTimer.start(function(){
                  module.exports.createMessageBusProcess(name, fileName, thisServerAddress, autoRestart, restartTimer);
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
      logging.write();
      return childProcess;
  },
  createMessageBusClient: function(){
      const MessageBus=require('./messageBus.js');
      const thisServerAddress=process.env.thisserveraddress;
      if (module.exports.isValidUrl(thisServerAddress)==false){
        throw 'child process was provided with an invalid sender address';
      }
      var messageBusProcess=module.exports.createMessageBusProcess('ChildMessageBus', './messageBus.js', thisServerAddress, true);
      const messageBusClient = new MessageBus('ParentMessageBus', thisServerAddress, 
                          function _receivePublishMessage(callback){
                                messageBusProcess.on('message', (message) => {
                                  if (message && message !='heartbeat'){
                                    callback(message);
                                  }
                                });
                          },function _receiveSubscribeMessage(callback){
                                messageBusProcess.on('message', (message) => {
                                  if (message && message !='heartbeat'){
                                    callback(message);
                                  }
                                });
                          },function _sendMessage(message){
                                messageBusProcess.send(message);
                          },function _sendHttpMessage(){},isClient=true);
      return messageBusClient;
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
  getHostAndPortFromUrl: function(url){
      var addressSplit=url.replace('http://','')
                                .replace('https://','')
                                .split(':');
      const host=addressSplit[0].split('/')[0];
      const port=addressSplit[1].split('/')[0];
      logging.write('port',port);
      return {
          host: host,
          port: port
      };
  },
  sendHttpRequest: function(url, data, path, callback){
      logging.write('creating an http request.');
      const postData=module.exports.getJSONString(data);
      const info = module.exports.getHostAndPortFromUrl(url);
      const host=info.host;
      var port=info.port;
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
      logging.write('http options: ',options);
      const request=http.request(options);
      request.on('error', function(err){
        const errMsg=`Http error occurred: ${err}`;
        logging.write(errMsg);
        throw errMsg;
      });
      request.on('response', function (response) {
          response.setEncoding('utf8');
          logging.write('http response received from request, status code: ',response.statusCode);
          response.on('data', function (body) {
            if (callback){
              callback(body);
            }
          });
      });
      request.end(postData);
    },
    receiveHttpRequest: function(hostPort, callback, callbackError){
      const port = process.env.PORT || hostPort;
      const httpServer=http.createServer(function(req, res){
          logging.write('http request received');
          const body = [];
          res.on('error',function(err){
              const errMsg=`Http error occurred at ${location}: ${err}`;
              logging.write(errMsg);
              callbackError(errMsg);
          });
          req.on('data', function (chunk) {
              body.push(chunk);
          });
          req.on('end', function () {
            logging.write('http request data received');
            const requestBodyJson=Buffer.concat(body).toString();
            const requestBody=module.exports.getJSONObject(requestBodyJson);
            if (requestBody) {
                res.statusCode = 200;
                res.end();
                callback(requestBody);
            } else {
                res.statusCode = 500;
                res.end();
                callbackError(`no request body`);
            }
        });
      });
      httpServer.listen(port,function(){
          logging.write();
          logging.write(`http server started and listening on port ${port}`);
          logging.write();
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
    },
    createCache:function(cacheString){
        return new Cache(cacheString);
    }
};