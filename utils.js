module.exports={
  getRandomNumber: function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  createTimer: function(isInterval){
    const Timer = require('./timer.js');
    return new Timer(isInterval);
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
  getJSONObject: function(){
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
  createMessageBus: function(isChildProcess){
    const MessageBus=require('./messageBus.js');
    if (isChildProcess==true){
      return new MessageBus();
    }
    const childFile=`${__dirname}/messageBus.js`;
    return new MessageBus(childFile);
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
      
      const addressSplit=channel.replace('http://','')
                                .replace('https://','')
                                .split(':');
      const host = addressSplit[0].split('/')[0];
      var port=addressSplit[1].split('/')[0];
      if (!port){
        port=80;
      }
      const options = {
          host: host,
          port: port, 
          method:'POST',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
          }
      };
      const request=http.request(options);
      request.on('error', function(err){
        const errMsg=`Http error occurred at ${location}: ${err}`;
        console.log(errMsg);
        throw errMsg;
      });
      request.on('response', function (response) {
          response.setEncoding('utf8');
          response.on('data', function (body) {
            callback(body);
          });
      });
      request.end(postData);
    }
};