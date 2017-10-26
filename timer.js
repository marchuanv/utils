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
              console.log(`interval for ${name}`);
              thisInstance.callback();
            }catch(err){
              console.log(err);
            }
            internalStart(thisInstance);
          }, milliseconds);
      } else {
        console.log('started non interval timer');
        setTimeout(function(){
            try{
              thisInstance.callback();
            }catch(err){
                console.log(err);
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
      console.log(` ${name} timer started`);
      thisInstance.callback=callback;
      internalStart();
  };
  thisInstance.stop=function(){
    thisInstance.started=false;
    console.log(` ${name} timer stopped`);
    thisInstance.stopped=true;
    thisInstance.started=false;
  };
};
module.exports=Timer;