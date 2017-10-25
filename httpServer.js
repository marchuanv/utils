const common=require(`${__dirname}/common.js`);
const MessageService=require(`${__dirname}/messageService.js`);
const messageService = new MessageService(`${__dirname}/httpServerInstance.js`);

function HttpServer(){

  messageService.receive('makeRequest', function(message){
      if (message.responded==true){
        if (message.responseData){
            message.callback(message.responseData);
        }else{
            console.log('request responded with no data.');  
        }
      }else{
        console.log('request failed.');
      }
  });

  messageService.receive('receiveRequest', function(message){
      message.callback(message.requestData, function complete(data){
          message.responseData=data;
          messageService.send('receiveRequest', message);
      });
  });

  messageService.receive('startServer', function(message){
      message.callback();
  });

  messageService.receive('fail', function(message){
      if (message.callbackFail){
         message.callbackFail(message.reason);
      }
  });

  this.start=function(callback, callbackFail){
      const messageId=common.newGuid();
      messageService.send('startServer',{
        Id: messageId,
        callback: callback,
        callbackFail: callbackFail
      });
  };
  this.stop=function(){
      const messageId=common.newGuid();
      messageService.send('exitServer',{
        Id: messageId,
        callback: null,
        callbackFail: null
      });
  };
  this.send=function(url, data, callback, callbackFail){
      const messageId=common.newGuid();
      messageService.send('makeRequest',{
          Id: messageId,
          url: url,
          requestData: data,
          callback: callback,
          callbackFail: callbackFail
      });
  };
  this.receive=function(path, callback, callbackFail){
      const messageId=common.newGuid();
      messageService.send('receiveRequest',{
          Id: messageId,
          path: path,
          callback: callback,
          callbackFail: callbackFail
      });
  };
};
module.exports=HttpServer;