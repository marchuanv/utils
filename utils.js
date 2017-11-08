const http=require('http');
const logging=require('./logging.js');

function createMessageBusProcess(name, fileName, thisServerAddress, googleDrivePrivateKey, routingMode, messageSendRetryMax, autoRestart, restartTimer){
    logging.write('');
    logging.write(`/////////////////////////////////  CREATING CHILD PROCESS ${name} ///////////////////////////////`);
    if (!restartTimer){
      restartTimer=module.exports.createTimer(false, 'child process restart');
      restartTimer.setTime(10000);
    }
    const childFile=`${__dirname}/messageBusProcess.js`;
    const cp = require('child_process');
    const childProcess=cp.fork(childFile, 
        [name, fileName, thisServerAddress, messageSendRetryMax, routingMode, googleDrivePrivateKey]
        // { silent: true }
    );
    function handleEvent(reason, error){
        childProcess.kill();
        
        logging.write(`reason: ${reason}, error: ${error}`);
        if (autoRestart && restartTimer.started==false){
            restartTimer.start(function(){
                createMessageBusProcess(name, fileName, thisServerAddress, googleDrivePrivateKey, routingMode, messageSendRetryMax, autoRestart, restartTimer);
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
    logging.write('');
    return childProcess;
};

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
      logging.write(`parsing ${jsonString} to object`);
      return JSON.parse(jsonString);
    }catch(err){
      logging.write('parsing failed with error:',err);
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
  createMessageBusClient: function(routingMode){
      const MessageBus=require('./messageBus.js');
      const MessageBusService=require('./messageBusService.js');
      const thisServerAddress=process.env.thisserveraddress;
      const googleDrivePrivateKey=process.env.privatekey;
      if (routingMode == undefined || routingMode == null || routingMode == ''){
         routingMode=false;
      }
      if (!thisServerAddress || module.exports.isValidUrl(thisServerAddress)==false){
        throw 'child process was provided with an invalid sender address';
      }
      if (!googleDrivePrivateKey){
        throw 'no privatekey was provided for google drive';
      }

      var messageSendRetryMax=5;
      var messageBusProcess=createMessageBusProcess(
          'ChildMessageBus', 
          './messageBus.js', 
          thisServerAddress,
          googleDrivePrivateKey,
          routingMode,
          messageSendRetryMax, 
          true
      );
      const messageBusService = new MessageBusService(
          routingMode,
          messageBusProcess,
          messageSendRetryMax,
          false
      );
      return messageBusService.messageBus;
  },
  consoleReset :function () {
    return process.stdout.write('\033c');
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
      logging.write('port', port);
      return {
          host: host,
          port: port
      };
  },
  sendHttpRequest: function(url, data, path, callback, callbackFail){
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
      const request=http.request(options);
      request.on('error', function(err){
          if (callbackFail){
              callbackFail(err);
          }else{
              logging.write(`Http error occurred: ${err}`);
          }
      });
      request.on('response', function (response) {
          response.setEncoding('utf8');
          if (response.statusCode != 200){
              if (callbackFail){
                callbackFail(`http request responded with http status code: ${response.statusCode}`);
              }else{
                logging.write('http response received from request, status code: ', response.statusCode);
              }
          }else{
            response.on('data', function (body) {
                if (callback){
                  callback(body);
                }
            });
          }
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
            const requestBodyJson=Buffer.concat(body).toString();
            const requestBody=module.exports.getJSONObject(requestBodyJson);
            logging.write('http request data received.');
                if (requestBody) {
                    res.statusCode = 200;
                    res.end('success');
                    callback(requestBody);
                } else if(req.method.toLowerCase()=="get"){
                    callback(function(resData){
                        res.statusCode = 200;
                        var resDataJson=module.exports.getJSONString(resData);
                        res.end(resDataJson);
                    });
                }else{
                    res.statusCode = 500;
                    res.end('failed');
                    callbackError(`no request body`);
                }
            
        });
      });
        
      httpServer.listen(port, function(){
          logging.write('');
          logging.write(`http server started and listening on port ${port}`);
          logging.write('');
      });
    },
    isValidUrl: function(url){
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
    createCache: function(cacheString){
        const Cache=require('./cache.js');
        return new Cache(cacheString);
    },
    createLogging: function(){
      return require('./logging.js');
    },
    uploadGoogleDriveData: function(key, name, data){
        const GoogleDrive=require('./googleDrive.js');
        const drive=new GoogleDrive(key);
        console.log();
        console.log('UPLOADING: ',data);
        console.log();
        drive.replace(name, data, function(){
            console.log();
            console.log('UPLOADED: ',data);
            console.log();
        });
    },
    downloadGoogleDriveData: function(key, name, callback){
        const GoogleDrive=require('./googleDrive.js');
        const drive=new GoogleDrive(key);
        drive.load(name, function(data){
          console.log();
          console.log('DOWNLOADED: ',data);
          console.log('TYPE: ',typeof data);
          console.log();
          callback(data);
        }); 
    },
    readJsonFile: function(name, callback){
        var filePath=`${__dirname}/${name}`;
        filePath=filePath.replace('.json','');
        filePath=`${filePath}.json`;
        filePath=filePath.replace('node_modules/utils/','');
        const fs=require('fs');
        fs.readFile(filePath, 'utf8', function(err, jsonStr){
            const data=module.exports.getJSONObject(jsonStr);
            callback(data);
        });
    },
    replaceJsonFile: function(name, data){
        var filePath=`${__dirname}/${name}`;
        filePath=filePath.replace('.json','');
        filePath=`${filePath}.json`;
        filePath=filePath.replace('node_modules/utils/','');
        const fs=require('fs');
        fs.unlink(filePath, function(err) {
           // Ignore error if no file already exists	 
           if (err && err.code !== 'ENOENT') {
              throw err;
           }
           const dataStr = module.exports.getJSONString(data);
           var options = {
              flag: 'w'
           };
           fs.writeFile(filePath, dataStr, options, function(err) {
              if (err) {
                 throw err;
              }
           });
         });
      }
};
