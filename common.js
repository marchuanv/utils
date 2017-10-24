function Timer(isInterval){
  let milliseconds=1000;
  let stop=false;
  this.started=false;
  function internalStart(callback){
    if (stop){
      return;
    }
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
      this.started=true;
      internalStart.apply(this, [callback]);
  };
  this.stop=function(){
    this.started=false;
    stop=true;
  };
};
function getJSONObject(jsonString){
    try{
      console.log('parsing object to JSON');
      return JSON.parse(jsonString);
    }catch(err){
      return null;
    }
};
function getJSONString(data){
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
};
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};
module.exports={
  getRandomNumber: function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  createTimer: function(isInterval){
    return new Timer(isInterval);
  },
  getJSONString: getJSONString,
  getJSONObject: getJSONObject,
  newGuid: generateUUID
};
