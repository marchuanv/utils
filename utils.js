function Timer(isInterval){
  let milliseconds=1000;
  function internalStart(callback){
    if (isInterval){
         setTimeout.apply(this, [function(){
            callback.apply(this);
            internalStart.apply(this,[callback]);
          }, milliseconds]);
      } else {
        setTimeout.apply(this, [function(){
          callback.apply(this);
        }, milliseconds]);
      }
  };
  this.setTime=function(_milliseconds){
    milliseconds=_milliseconds;
  };
  this.start=function(callback){
      internalStart.apply(this, [callback]);
  };
};
function getHostAndPortFromUrl(url){
    const addressSplit=url.replace('http://','').replace('https://','').split(':');
    const hostName = addressSplit[0].split('/')[0];
    var port=80;
    if (addressSplit[1]){
        port = addressSplit[1].split('/')[0];
    }
    return {
        host: hostName,
        port: port
    };
};
module.exports={
  getRandomNumber: function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  createTimer: function(isInterval){
    return new Timer(isInterval);
  },
  getHostAndPortFromUrl: getHostAndPortFromUrl
};
