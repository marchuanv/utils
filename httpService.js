const MessageService=require(`./messageService.js`);

function HttpService(utils){

  const messageService = new MessageService(utils, `${__dirname}/httpServiceInstance.js`);

  messageService.receive('makeRequest', function(message, complete){
      complete();
      if (message.responded==true){
        if (message.responseData){
            message.callback(message.responseData);

        }
      }
  });

  messageService.receive('receiveRequest', function(message, complete){
      complete();
      message.callback(message.requestData, function complete(data){
          message.responseData=data;
          messageService.send('receiveRequest', message);
      });
  });

  messageService.receive('httpListen', function(message, complete){
      complete();
      message.callback();
  });

  messageService.receive('fail', function(message, complete){
      complete();
      if (message.callbackFail){
         message.callbackFail(message.reason);
      }
  });

  this.send=function(url, data, callback, callbackFail){
      var messageId=utils.newGuid();
      messageService.send('httpListen',{
        Id: messageId,
        callback: function(){
          console.log('server is listening at traffic');
        },  
        callbackFail: function(){
          console.log('failed to start server');
        }
      });
      messageId=utils.newGuid();
      messageService.send('makeRequest',{
          Id: messageId,
          url: url,
          requestData: data,
          callback: callback,
          callbackFail: callbackFail
      });
  };
  this.receive=function(path, callback, callbackFail){
      var messageId=utils.newGuid();
      messageService.send('httpListen',{
        Id: messageId,
        callback: function(){
          console.log('server is listening at traffic');
        },  
        callbackFail: function(){
          console.log('failed to start server');
        }
      });
      messageId=utils.newGuid();
      messageService.send('receiveRequest',{
          Id: messageId,
          path: path,
          callback: callback,
          callbackFail: callbackFail
      });
  };
};
module.exports=HttpService;