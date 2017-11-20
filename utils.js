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
        
      try{
        httpServer.listen(port, function(){
            logging.write('');
            logging.write(`http server started and listening on port ${port}`);
            logging.write('');
        });
      }catch(err){
        
        console.log('MESSAGE: ',err.message);
        if (err.message.indexOf('EADDRINUSE') == -1){
          throw err;
        }else{
          console.error(`port ${hostPort} already in use`);
        }
      }
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
