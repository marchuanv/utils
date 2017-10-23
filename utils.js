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

function handleHttpResponse(response, cbSuccess, cbFail){
    let body = [];
    response.on('data', function (chunk) {
      body.push(chunk);
    });
    response.on('end', function () {
       
       response.setHeader('Content-Type', 'application/json');
        const bodyStr = Buffer.concat(body).toString();
        try{
          console.log('HTTP: parsing request body to JSON');
          JSON.parse(bodyStr);
        }catch(err){
            console.error(err);
            response.statusCode = 500;
            response.write({message:'HTTP: error parsing request body to json'});
            response.end();
            cbFail(err);
            return;
        }
        if (response.statusCode==200){
          
            response.write({message: "successful"});
            response.end();
            
            cbSuccess(body);
            console.log(`////////////////////////////// HTTP: done  /////////////////////////////////`);
            console.log();
        }else{
            const resMessage=`HTTP: request responded with status: ${response.statusCode}`;
            console.error(resMessage);
            response.statusCode = 500;
            response.write({message: resMessage });
            response.end();
            console.log(`////////////////////////////// HTTP: done  /////////////////////////////////`);
            console.log();
            cbFail(resMessage);
        }
    });
};

function handleHttpRequest(url, data, cbPass, cbFail, req, res){
   console.log();
   console.log(`////////////////////////////// HTTP: handling request  /////////////////////////////////`);
   var request=req;
   var response=res;
   var jsonData;
   if (data && typeof data !== 'string'){
     try{
        jsonData = JSON.stringify(data);
     }catch(err){
       cbFail('HTTP: failed to parse data to json');
       return;
     }
   }
   if (!request && !url){
      console.log('HTTP: have to provide either an existing http request object or a url to create a new request.');
      return;
   }
   if (!request){
     console.log('creating new request.');
      const addressSplit=url.replace('http://','').replace('https://','').split(':');
      const hostName = addressSplit[0].split('/')[0];
      var port=80;
      if (addressSplit[1]){
          port = addressSplit[1].split('/')[0];
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
      request=http.request(options);
   }
   request.on('error', function(err){
      console.log(`HTTP: ${err}`);
      cbFail(err);
   });
   request.on('data', function(){});
   if (response){
     request.on('end', () => {
          console.log('handling existing request response.');
          handleHttpResponse(response, cbPass, cbFail);
     });
   }else{
      console.log('handling new request response.');
      request.on('response', function (_response) {
          console.log('request response received, responding to requester.');
          handleHttpResponse(_response, cbPass, cbFail);
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
