const common=require('./common.js');
const http=require('http');
const url  = require('url');

var httpServer;
const receiveRequestMessages=[];
process.on('message', (msg) => {
    if (msg.name=='receiveRequest'){
        receiveRequestMessages.push(msg);
    }
    if (msg.name=='startServer' && !httpServer){
        const hostPort= process.env.PORT || 3000;
        const http=require('http');
        httpServer=http.createServer(function(req, res){
            res.on('error',function(err){
              process.send({
                  Id: msg.Id,
                  name: "fail",
                  reason: `HttpServer: ${err}`
              });
            });
            const urlParts = url.parse(req.url, true);
            const urlPathname = urlParts.pathname;
            for (var i = receiveRequestMessages.length - 1; i >= 0; i--) {
                var receiveRequestMessage=receiveRequestMessages[i];
                if (receiveRequestMessage.path==urlPathname){
                    receiveRequestMessage.request=req.body;
                    process.send(receiveRequestMessage);
                }
            };
            res.statusCode = 200;
            res.end();
        });
    }
    if (msg.name=='exitServer'){
       process.send(msg);
       httpServer.close(function() { 
          process.exit();
       });
    }
    if (msg.name=='makeRequest'){

        console.log('HttpServer: creating new request.');
        const addressSplit=msg.url.replace('http://','')
                              .replace('https://','')
                              .split(':');
        const hostName = addressSplit[0].split('/')[0];
        var port=80;
        if (addressSplit[1]){
            port = addressSplit[1].split('/')[0];
        }
        const jsonData=common.getJSONString(msg.request);
        if (!jsonData){
            cbFail('HttpServer: data parameter is not a valid object');
            return;
        }
        const options = {
            host: hostName,
            port: port, 
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(jsonData)
            }
        };
        const request=http.request(options);
        request.on('error', function(err){
            process.send({
              Id: msg.Id,
              name: "fail",
              reason: `HttpServer: ${err}`
            });
        });
        var responseBody;
        request.on('response', function (res) {
            res.setEncoding('utf8');
            res.on('data', function (body) {
              msg.response=bodyObj;
              process.send(msg);
            });
        });
        request.write(jsonData);
        request.end();
    }
});

function HttpServer(_messages){
  
  const { fork } = require('child_process');
  const forked = fork('httpServer.js');

  const messages=[_messages];
  if (!messages){
    messages=[];
  }

  forked.on('message', (msg) => {
      for (var i = messages.length - 1; i >= 0; i--) {
          var message=messages[i];
          console.log('message: ',message);
          if (msg.Id==message.Id){
              if (msg.name=='receiveRequest'){
                  message.callback(msg.request);
                  messages.splice(i,1);
              }
              if (msg.name=='exitServer'){
                  new HttpServer(messages);
                  message.callback('server stopped');
                  messages.splice(i,1);
              }
              if (msg.name=='makeRequest'){
                  message.callback(msg.response);
                  messages.splice(i,1);
              }
              if (msg.name=='startServer'){
                  message.callback('server started');
                  messages.splice(i,1);
              }
              if (msg.name=='fail'){
                if (message.callbackFail){
                  message.callbackFail(msg.reason);
                  messages.splice(i,1);
                }
              }
          }
      };
  });

  this.getHost=function(isExpress, callback){
      const messageId=common.newGuid();
      const message={
        Id: messageId,
        name: 'startServer',
        callback: callback
      };
      forked.send(message);
      callback(function _exitServer(callback, callbackFail){
         const message={
            Id: messageId,
            name:'exitServer',
            callback: callback,
            callbackFail: callbackFail
         };
         messages.push(message);
         forked.send(message);
      }, function _makeRequest(url, data, callback, callbackFail){
         const message={
            Id: messageId,
            url: url,
            request: data,
            name: 'makeRequest',
            callback: callback,
            callbackFail: callbackFail
         };
         messages.push(message);
         forked.send(message);
      }, function _receiveRequest(path, callback, callbackFail){
         const message={
            Id: messageId,
            name: 'receiveRequest',
            path: path,
            callback: callback,
            callbackFail: callbackFail
         };
         messages.push(message);
         forked.send(message);
      });
  };
};
module.exports=new HttpServer();