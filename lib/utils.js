//TEST2
function Utils(){
    
    this.isEmptyObject=function(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        };
        return JSON.stringify(obj) === JSON.stringify({});
    };

    this.generateGUID=function(argument) {
        function S4() {
            return (((1 + Math.random()) * 0x10000) |0).toString(16).substring(1); 
        }
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
     };

    this.getFunctionName=function(func) {
      var ret = func.toString();
      ret = ret.substr('function '.length);
      ret = ret.substr(0, ret.indexOf('('));
      return ret;
    };

    this.getFunctionArguments=function(func){
      var args = func.toString().
          replace(/[\r\n\s]+/g, ' ').
          match(/function\s*\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);
      return args;
    };

    this.getRandomNumber=function(min, max){
      return Math.floor(Math.random()*(max-min+1)+min);
    };
    
    this.getJSONString=function(data, includeFunctions){
       try{
        if (includeFunctions==true){
          return JSON.stringify(data, function(key, value) {
            if (typeof value === "function") {
              return "/Function(" + value.toString() + ")/";
            }
            return value;
          });
        }else{
          return JSON.stringify(data);
        }
       }catch(err){
         console.log("error creating json string",err);
         return null;
       }
    };

    this.getJSONObject=function(jsonString, includeFunctions){
      try{
        if (includeFunctions==true){
          const parsedObj =JSON.parse(jsonString, function(key, value) {
            if (typeof value === "string" && value.startsWith("/Function(") && value.endsWith(")/")) {
              value = value.substring(10, value.length - 2);
              return eval("(" + value + ")");
            }
            return value;
          });
          return parsedObj;
        }else{
          return JSON.parse(jsonString);
        }
      }catch(err){
        console.log("error parsing json",err);
        return null;
      }
    };

    this.newGuid=function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    this.getHostAndPortFromUrl=function(url){
        var addressSplit=url.replace('http://','')
                                  .replace('https://','')
                                  .split(':');
        const host=addressSplit[0].split('/')[0];
        const port=addressSplit[1].split('/')[0];
        console.log('port', port);
        return {
            host: host,
            port: port
        };
    };

    this.isValidUrl=function(url){
        var pattern1= new RegExp('^(http?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        var pattern2= new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern1.test(url) || pattern2.test(url);
    };

    this.getUrlPath=function(url){
        var url_parts = require('url').parse(url);
        return url_parts.pathname;
    };

    this.createCache=function(cacheString){
        const Cache=require('./cache.js');
        const cache=new Cache(cacheString);
        return cache;
    };

    this.readJsonFile=function(dirPath, name, callback){
        var filePath=`${dirPath}/${name}`;
        filePath=filePath.replace('.json','');
        filePath=`${filePath}.json`;
        const fs=require('fs');
        fs.readFile(filePath, 'utf8', function(err, jsonStr){
            const data=module.exports.getJSONObject(jsonStr);
            callback(data);
        });
    };
    
    this.readHtmlFile=function(dirPath, name, callback){
        var filePath=`${dirPath}/${name}`;
        filePath=filePath.replace('.html','');
        filePath=`${filePath}.html`;
        const fs=require('fs');
        fs.readFile(filePath, 'utf8', function(err, html){
            callback(html);
        });
    };
    
    this.readJavaScriptFile=function(dirPath, name, callback){
        var filePath=`${dirPath}/${name}`;
        filePath=filePath.replace('.js','');
        filePath=`${filePath}.js`;
        const fs=require('fs');
        fs.readFile(filePath, 'utf8', function(err, javascript){
            callback(javascript);
        });
    };

    this.replaceJsonFile=function(dirPath, name, data){
        var filePath=`${dirPath}/${name}`;
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
    };

    this.getFunctions=function(obj, callback){
      for(const prop in obj){
        if (typeof obj[prop] === "function"){
          callback(prop, obj[prop]);
        }
      };
    }
}