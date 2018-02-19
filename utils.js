const logging=require('./logging.js');

module.exports={
  getFunctionName: function(func) {
    var ret = func.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
  },
  getFunctionArguments: function(func){
    var args = func.toString().
        replace(/[\r\n\s]+/g, ' ').
        match(/function\s*\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);
    return args;
  },
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
  createHttpService: function(){
      const httpService=new require('HttpService').HttpService(this);
      return httpService;
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
