function Timer(isInterval){
  let seconds=1000;
  this.setTime=function(_seconds){
    seconds=_seconds;
  };
  this.start=function(callback){
      if (isInterval){
         setTimeout.apply(this, function(){
            callback.apply(this);
            this.start(callback);
          }, seconds);
      } else {
        setTimeout.apply(this, function(){
          callback.apply(this);
        }, seconds);
      }
  };
};
module.exports={
  getRandomNumber: function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  createTimer: function(isInterval){
    return new Timer(isInterval);
  }
};
