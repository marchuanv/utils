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
      console.log('timer started');
      internalStart.apply(this, [callback]);
  };
  this.stop=function(){
    this.started=false;
    console.log('timer stopped');
    stop=true;
  };
};
module.exports=Timer;