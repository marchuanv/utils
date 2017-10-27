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
  createMessageBus: function(){
      const childFile=`${__dirname}/messageBus.js`;
      const cp = require('child_process');
      return cp.fork(childFile);
  },
  createMessageBusManager: function(){
    const MessageBusManager=require('./messageBusManager.js');
    const messageBusManager=new MessageBusManager();
    return messageBusManager;
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
  postOverHttp: function postOverHttp(url, data, callback){
      console.log('creating an http request.');
      const postData=utils.getJSONString(data);
      
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
    },setupHttpServer: function(){
      const httpInstance=http.createServer(function(req, res){
        console.log('http request received');
        const body = [];
        res.on('error',function(err){
          const errMsg=`Http error occurred at ${location}: ${err}`;
          console.log(errMsg);
        });
        req.on('data', function (chunk) {
          body.push(chunk);
        });
        req.on('end', function () {
          console.log('http request data received');
          const requestBodyJson=Buffer.concat(body).toString();
          const requestBody=utils.getJSONObject(requestBodyJson);
          if (requestBody) {
            res.statusCode = 200;
              res.end(`subscribers at ${req.url} was notified`);
            process.send(requestBody);
          } else {
            const message=`no request body`;
            res.statusCode = 500;
              res.end(message);
            throw message;
          }
        });
      });
    };
    ,
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
    subscribeToProcessEvents: function(process, callback){
        process.on('exit', function(obj){
          callback("exit");
        });
          process.on('SIGINT',  function(obj){
          callback("SIGINT");
        });
          process.on('SIGHUP', function(obj){
          callback("SIGHUP");
        });
          process.on('SIGUSR1', function(obj){
          callback("SIGUSR1");
        });
        process.on('SIGUSR2', function(obj){
          callback("SIGUSR2");
        });
        process.on('close', function(obj){
          callback("close");
        });

        process.on( 'SIGTERM', function(obj){
          callback("SIGTERM");
        });
          process.on('error', function(obj){
          callback("error", obj);
        });
        process.on('uncaughtException', function(obj){
          callback("uncaughtException", obj);
        });
    }
};