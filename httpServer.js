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

            const body = [];
            const urlParts = url.parse(req.url, true);
            const urlPathname = urlParts.pathname;

            res.on('error',function(err){
              process.send({
                  Id: msg.Id,
                  name: "fail",
                  reason: `HttpServer: ${err}`
              });
            });
            req.on('data', function (chunk) {
              body.push(chunk);
            });
            req.on('end', function () {
            });

            const intervalTimer = common.createTimer(true);
            intervalTimer.setTime(1000);
            const timeOut = common.createTimer(false);
            timeOut.setTime(60000);

            intervalTimer.start(function(){
                console.log('HttpServer: checking received messages for new request');
                for (var i=0; i < receiveRequestMessages.length; i++) {
                    var receiveRequestMessage=receiveRequestMessages.splice(i,1)[0];
                    if (receiveRequestMessage.path==urlPathname){
                        if (receiveRequestMessage.request) {
                            if (receiveRequestMessage.response){
                              console.log();
                              console.log('MESSAGE WITH RESPONSE: ', receiveRequestMessage);
                              console.log();
                              res.statusCode = 200;
                              const json=JSON.stringify(receiveRequestMessage.response);
                              res.end(json);
                              intervalTimer.stop();
                              break;
                            }else{
                                console.log();
                                console.log('MESSAGE WITH NO RESPONSE: ', receiveRequestMessage);
                                console.log();
                                process.send({
                                  Id: msg.Id,
                                  name: "fail",
                                  reason: 'HttpServer: message did not have any response data'
                                });
                                res.statusCode = 500;
                                res.end();
                                intervalTimer.stop();
                                break;
                            }
                        }else{
                            console.log();
                            console.log('MESSAGE WITH NO REQUEST: ', receiveRequestMessage);
                            console.log();
                            const requestBody=Buffer.concat(body).toString();
                            receiveRequestMessage.request=JSON.parse(requestBody);
                            process.send(receiveRequestMessage);
                            break;
                        }
                    }else{
                      receiveRequestMessages.push(receiveRequestMessage);
                    }
                };
            });
            timeOut.start(function(){
              console.log('timeout waiting for response.');
                if (res.headersSent==false){
                    process.send({
                      Id: msg.Id,
                      name: "fail",
                      reason: 'HttpServer: timeout waiting for response'
                    });
                    res.statusCode = 500;
                    res.end();
                }
                intervalTimer.stop();
            });
        });
        httpServer.listen(hostPort,function(){
            process.send(msg);
        });
    }
    if (msg.name=='exitServer'){
       console.log('stopping server');
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
            process.send({
              Id: msg.Id,
              name: "fail",
              reason: 'HttpServer: data parameter is not a valid object'
            });
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

        var responseData=null;
        var response=null;
        request.on('response', function (res) {
            res.setEncoding('utf8');
            response=res;
            res.on('data', function (body) {
              responseData=body;
            });
        });
        request.write(jsonData);
        request.end();

        const intervalTimer = common.createTimer(true);
        intervalTimer.setTime(1000);
        intervalTimer.start(function(){
            if (response){
                if (response.statusCode!=200){
                   process.send({
                      Id: msg.Id,
                      name: "fail",
                      reason: `HttpServer: response http status code is ${response.statusCode}`
                   });
                   intervalTimer.stop();
                }else{
                    msg.response=responseData;
                    process.send(msg);
                    intervalTimer.stop();
                }
            }else{
              console.log('waiting for response from server');
            }
        });
    }
});

function HttpServer(){
  const messages=[];
  const cp = require('child_process');
  const subprocess = cp.fork('httpServer.js');
  subprocess.on('message', (msg) => {
      for (var i = 0; i < messages.length; i++) {
          var message=messages.splice(i,1)[0];
          if (msg.Id==message.Id){
              if (msg.name=='receiveRequest'){
                  if (!msg.response){
                      message.callback(msg.request, function complete(data){
                         message.response=data;
                         message.request=msg.request;
                         messages.push(message);
                         subprocess.send(message);
                      });
                  }
              }
              if (msg.name=='makeRequest'){
                  message.callback(msg.response);
              }
              if (msg.name=='startServer'){
                  message.callback();  
              }
          }else if (msg.name=='fail'){
            if (message.callbackFail){
              message.callbackFail(msg.reason);
            }
          } else {
            messages.push(message);
          }
      };
  });
  this.start=function(callback, callbackFail){
      const messageId=common.newGuid();
      const newMsg={
        Id: messageId,
        name: 'startServer',
        callback: callback,
        callbackFail: callbackFail
      };
      subprocess.send(newMsg);
      messages.push(newMsg);
  };
  this.stop=function(){
      const messageId=common.newGuid();
       const newMsg={
          Id: messageId,
          name:'exitServer',
          callback: null,
          callbackFail: null
       };
       messages.push(newMsg);
       subprocess.send(newMsg);
  };

  this.send=function(url, data, callback, callbackFail){
       const messageId=common.newGuid();
       const newMsg={
          Id: messageId,
          url: url,
          request: data,
          name: 'makeRequest',
          callback: callback,
          callbackFail: callbackFail
       };
       messages.push(newMsg);
       subprocess.send(newMsg);
  };

  this.receive=function(path, callback, callbackFail){
      const messageId=common.newGuid();
       const newMsg={
          Id: messageId,
          name: 'receiveRequest',
          path: path,
          callback: callback,
          callbackFail: callbackFail
       };
       messages.push(newMsg);
       subprocess.send(newMsg);
  };
};
module.exports=HttpServer;