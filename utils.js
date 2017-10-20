function Timer(isInterval){
  this.seconds=1000;
  this.start=function(callback){
      if (isInterval){
         setTimeout.apply(this, function(){
            callback.apply(this);
            this.start(callback);
          }, this.seconds);
      } else {
        setTimeout.apply(this, function(){
          callback.apply(this);
        }, this.seconds);
      }
  }
};
module.exports={
  getRandomNumber: function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  createTimer: function(isInterval){
    return new Timer(isInterval);
  }
};
