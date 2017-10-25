const utils=require('./utils.js');
const http=require('http');
const url  = require('url');
const MessageService=require('./messageService.js')
const messageService = new MessageService(utils);

messageService.receive('httpListen', function(data, complete){
    if (data.server){
      console.log('already an instance of the http server running');
      complete();
      return;
    }
    const hostPort= process.env.PORT || 3000;
    const http=require('http');
    data.server=http.createServer(function(req, res){
        const body = [];
        const urlParts = url.parse(req.url, true);
        const urlPathname = urlParts.pathname;
        res.on('error',function(err){
            messageService.send('fail',{
              name: "fail",
              reason: `HttpServer: ${err}`
            });
        });
        req.on('data', function (chunk) {
          body.push(chunk);
        });
        req.on('end', function () {
            const requestBodyJson=Buffer.concat(body).toString();
            const requestBody=JSON.parse(requestBodyJson);
            messageService.send('receiveRequest',{
                response:res,
                requestPath: urlPathname,
                requestData: requestBody
            });
        });
    });
    data.server.listen(hostPort,function(){
        console.log();
        console.log('////////////////// HTTP SERVER STARTED ////////////////////');
        console.log();
        messageService.send('httpListen',data);
        complete();
    });
});

messageService.receive('receiveRequest', function(data, complete){
    const res=data.response;
    const path=data.path;
    const requestPath=data.requestPath;
    const responseData=data.responseData;
    if (path==requestPath){
      if (res){
        if (responseData){
          const respondDataJson=utils.getJSONString(responseData);
          throw 'TEST';
          res.statusCode = 200;
          res.end(respondDataJson);
        }else{
            messageService.send('fail',{
              name: "fail",
              reason: 'HttpServer: message did not have any response data'
            });
            res.statusCode = 500;
            res.end();
        }
      }
    }
    complete();
});

messageService.receive('makeRequest', function(message, complete){
    const url=message.url;
    const requestData=message.requestData;
    console.log('HttpServer: creating new request.');
    const addressSplit=url.replace('http://','')
                              .replace('https://','')
                              .split(':');
    const hostName = addressSplit[0].split('/')[0];
    var port=80;
    if (addressSplit[1]){
        port = addressSplit[1].split('/')[0];
    }
    const jsonData=utils.getJSONString(requestData);
    if (!jsonData){
        messageService.send('fail',{
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
        messageService.send('fail',{
          name: "fail",
          reason: `HttpServer: ${err}`
        });
    });
    request.on('response', function (res) {
        res.setEncoding('utf8');
        res.on('data', function (body) {
          message.responseData=JSON.parse(body);
          messageService.send('makeRequest', message);
        });
        message.responded=true;
        messageService.send('makeRequest',message);
    });
    request.write(jsonData);
    request.end();
    complete();
});

messageService.receive('exitServer', function(message, complete){
  complete();
  process.exit();
});
