const logging = require('./logging.js');
function Timer(isInterval, name){
  let milliseconds=1000;
  let thisInstance=this;
  thisInstance.stopped=false;
  thisInstance.started=false;
  thisInstance.callback=null;
  function internalStart(){
      if (isInterval){
         if (thisInstance.stopped==true){
            return;
         }
         setTimeout(function(){
            try{
              thisInstance.callback();
            }catch(err){
              logging.write(err);
            }
            internalStart(thisInstance);
          }, milliseconds);
      } else {
        setTimeout(function(){
            try{
              thisInstance.callback();
            }catch(err){
                logging.write(err);
            }
            thisInstance.stopped=true;
            thisInstance.started=false;
        }, milliseconds);
      }
  };
  thisInstance.setTime=function(_milliseconds){
    milliseconds=_milliseconds;
  };
  thisInstance.start=function(callback){
      thisInstance.stopped=false;
      thisInstance.started=true;
      logging.write(`${name} timer started`);
      thisInstance.callback=callback;
      internalStart();
  };
  thisInstance.stop=function(){
    thisInstance.started=false;
    logging.write(`${name} timer stopped`);
    thisInstance.stopped=true;
    thisInstance.started=false;
  };
};
module.exports=Timer;