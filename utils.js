const http = require('http');
function Timer(isInterval){
  let milliseconds=1000;
  function internalStart(callback){
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
      internalStart.apply(this, [callback]);
  };
};

function parseJSON(jsonString){
    try{
      console.log('parsing object to JSON');
      return JSON.parse(jsonString);
    }catch(err){
      console.error(err);
      return null;
    }
};

function getJSON(data, cbFail){
    if (data){
        if (typeof data !== 'string'){
           try{
              return JSON.stringify(data);
           }catch(err){
             cbFail('HTTP: failed to parse data to json');
             return;
           }
        }
        return data;
    }else{
      cbFail('HTTP: data cant be null or empty');
      return;
    }
};

function handleHttpResponse(response, cbSuccess, cbFail, isNewRequest, jsonData) {  
    response.on('error', function (err) {
        console.error(err);
        response.statusCode = 500;
        response.write({message: err});
        response.end();
        cbFail(err);
    });
    if (isNewRequest==true){
        response.setEncoding('utf8');
        response.on('data', function (bodyStr) {
            if (response.statusCode==200){
               const bodyObj=parseJSON(bodyStr);
               if (bodyObj){
                  cbSuccess(bodyObj);
               }
            }else{
              cbFail(`request failed with http status code ${response.statusCode}`);
            }
            console.log(`////////////////////////////// HTTP: done  /////////////////////////////////`);
            console.log();
       });
     }else{
        response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        response.write(jsonData);
        response.end();
        cbSuccess(jsonData);
        console.log(`////////////////////////////// HTTP: done  /////////////////////////////////`);
        console.log();
     }
};

function handleHttpRequest(url, data, cbPass, cbFail, req, res){
   console.log();
   console.log(`////////////////////////////// HTTP: handling request  /////////////////////////////////`);
   var request=req;
   var response=res;
   var jsonData=data;
   if (!request && !url){
      console.log('HTTP: have to provide either an existing http request object or a url to create a new request.');
      return;
   }
   if (!request){
      console.log('creating new request.');
      const addressSplit=url.replace('http://','')
                            .replace('https://','')
                            .split(':');
      const hostName = addressSplit[0].split('/')[0];
      var port=80;
      if (addressSplit[1]){
          port = addressSplit[1].split('/')[0];
      }
      jsonData=getJSON(data, cbFail);
      const options = {
          host: hostName,
          port: port, 
          method:'POST',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(jsonData)
          }
      };
      request=http.request(options);
   }
   request.on('error', function(err){
      console.log(`HTTP: ${err}`);
      cbFail(err);
   });
   if (response){ //EXISTING REQUEST
       let body = [];
       request.on('data', function(chunk) {
         body.push(chunk);
       }).on('end', function() {
            var requestBodyStr;
            try{
                const requestMethod=request.method.toLowerCase();
                console.log('handling existing request response.');
                if (requestMethod=="post"){
                  requestBodyStr=Buffer.concat(body).toString();
                  handleHttpResponse(response, cbPass, cbFail, false, requestBodyStr);
                }else if (requestMethod=="get"){
                  const resData=getJSON(data, cbFail);
                  handleHttpResponse(response, cbPass, cbFail, false, resData);
                }
            }catch(err){
              console.error(err);
              cbFail(err);
            }
       });
   }else{ //NEW REQUEST
      console.log('handling new request response.');
      request.on('response', function (_response) {
          console.log('request response received, responding to requester.');
          handleHttpResponse(_response, cbPass, cbFail, true);
      });
      request.write(jsonData);
      request.end();
   }
};

module.exports={
  getRandomNumber: function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  createTimer: function(isInterval){
    return new Timer(isInterval);
  },
  handleHttpRequest: handleHttpRequest
};
