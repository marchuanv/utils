function Utils({ fs, vm, crypto, fsPath }){

  const whiteSpaceRegEx = new RegExp(/\s*/,"g");
  const funcDestructionMatch = new RegExp(/\s*function\s*[A-z]+\s*\(\s*\{\s*((?:\s*[A-z0-9]+\s*\,)+)(\s*[A-z0-9]+\s*)\}\s*\)/);
  const funcParamMatch = new RegExp(/\s*function\s*[A-z]+\s*\((((?:\s*[A-z0-9]+\s*\,)+)(\s*[A-z0-9]+\s*)|(\s*[A-z0-9]+\s*)|\s*)\)/);
  const classCtorParamMatch = new RegExp(/constructor\s*\((\s*[A-z0-9,]\s*)+\)\s*\{/);
  const base64RegEx = new RegExp(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/,"g");
  const genRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
  };
  const sha512 = (password, salt) => {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return { hashedPassphraseSalt: salt, hashedPassphrase: value };
  };

  this.hashPassphrase = (userpassword, salt) => {
    salt = salt || genRandomString(16); /** Gives us salt of length 16 */
    return sha512(userpassword, salt);
  }

  this.sizeOf = (obj) => {
      let bytes=0;
      switch(typeof obj) {
          case 'number':
              bytes += 8;
              break;
          case 'string':
              bytes += obj.length * 2;
              break;
          case 'boolean':
              bytes += 4;
              break;
          case 'object':
              var objClass = Object.prototype.toString.call(obj).slice(8, -1);
              if(objClass === 'Object' || objClass === 'Array') {
                  for(var key in obj) {
                      if(obj.hasOwnProperty(key)){
                          const prop = obj[key];
                          bytes = bytes + this.sizeOf(prop);
                      } else {
                          continue;
                      }
                  }
              } else if (objClass !== "Null") {
                  bytes += obj.toString().length * 2
              };
              break;
      }
      return bytes;
  };
  
  this.requireUncached = function (module) {
      delete require.cache[require.resolve(module)];
      return require(module);
  };
  
  this.toArrayBuffer=function(str) {
      var ab = new ArrayBuffer(str.length);
      var view = new Uint8Array(ab);
      for (var i = 0; i < buf.length; ++i) {
          view[i] = buf[i];
      }
      return ab;
  }
  
  this.toBuffer=function(str) {
      return new Buffer(str);
  }
  
  this.getByteLength=function(str) {
       return Buffer.byteLength(str, 'utf8');
  }
  
  this.syncObject=function(obj, sourceObj){
      for(const propName in obj){
          if (sourceObj[propName]) {
              obj[propName] = sourceObj[propName];
          }
      };
  };

  this.mergeObject=function(obj, sourceObj){
      for(const propName in sourceObj){
          if (sourceObj[propName]) {
              obj[propName] = sourceObj[propName];
          }
      };
  };
  
  this.wait=function(intervalsInMilliseconds, timeoutInMilliseconds, cbInterval, cbComplete, cbTimeout){
      let interval = setInterval(async() => {
          const obj = await cbInterval();
          if (obj){
              clearInterval(interval);
              interval = null;
              await cbComplete(obj);
          }
      },intervalsInMilliseconds);
      if (timeoutInMilliseconds > 0 && cbTimeout){
          setTimeout(async()=>{
              if (interval){
                  clearInterval(interval);
                  await cbTimeout();
              }
          },timeoutInMilliseconds);
      }
  };
  
  this.isEmptyObject=function(obj) {
      if (obj) {
          const properties = Object.getOwnPropertyNames(obj);
          for(const prop in properties) {
              return false;
          };
      }
      return true;
  };
  
  this.generateGUID=function() {
    return crypto.randomUUID();
  };
  
  this.getFunctionName=function(func) {
    var ret = func.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
  };

  this.getFunctionParams=function(func){
      
    whiteSpaceRegEx.lastIndex = 0;
    funcDestructionMatch.lastIndex = 0;
    classCtorParamMatch.lastIndex = 0;
    funcParamMatch.lastIndex = 0;

    const getParams = (regEx) => {
      let params = regEx.exec(func.toString());
      if (params && params.length > 0) {
        const firstMatch = params[0];
        params = params.filter(p => p && p !== firstMatch);
        if (params.length === 0 && firstMatch) {
          return [];
        }
        const paramLength = params.length;
        for(let i = 0; i < paramLength; i++) {
          const param = params[i];
          const paramSplit = param.split(',').filter(ps => ps);
          if (paramSplit && paramSplit.length > 1) {
            params.splice(i, 1);
          }
          params = params.concat(paramSplit);
        }
        params = params.map(ps => ps.replace(whiteSpaceRegEx,'').replace(/\,/g,''));
        params = [...new Set(params)].map(param => { return { name: param } });
        return params;
      } else {
        return null;
      }
    };
    let params = getParams(funcParamMatch);
    if (!params) {
      params = getParams(classCtorParamMatch);
    }
    if (!params) {
      params = getParams(funcDestructionMatch);
    }
    return params;
  };

  this.getRandomNumber=function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
  };
  
  this.getJSONString=function(data, includeFunctions=false){
     try{
        if (!data){
          return "";
        }
        let jsonStr = JSON.stringify(data, (key, value) => {
          if (typeof value === "function" && includeFunctions === true) {
            return "/Function(" + value.toString() + ")/";
          }
          return value;
        },4);
        jsonStr = jsonStr.replace(/\\n/g, '').replace(/\\/g, "");
        return jsonStr;
     }catch(err){
         return "";
     }
  };

  this.getJSONObject=function(jsonString, includeFunctions=false){
    try{
        const dateFormat = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/;
        const obj = JSON.parse(jsonString, (key, value) => {
          if (typeof value === "string" && dateFormat.test(value)) {
            return new Date(value);
          }
          if (typeof value === "string" && value.startsWith("/Function(") && value.endsWith(")/") && includeFunctions===true) {
            value = value.substring(10, value.length - 2);
            return eval("(" + value + ")");
          }
          return value;
        });
        return obj;
    }catch(err){
      return null;
    }
  };

  this.isValidUrl=function(url){
      var pattern1= new RegExp('^(http?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      var pattern2= new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return pattern1.test(url) || pattern2.test(url);
  };

  this.getUrlPath=function(url){
      var url_parts = require('url').parse(url);
      return url_parts.pathname;
  };

  this.getFunctions=function(obj, callback){
    for(const prop in obj){
      if (typeof obj[prop] === "function"){
        callback(prop, obj[prop]);
      }
    };
  }

this.getCanvasMousePos=(mouse, canvas)=>{
  const rect = canvas.getBoundingClientRect();
  return {
    x: mouse.x - rect.left,
    y: mouse.y - rect.top
  };
}
  
this.getRemainingDays = (month) =>{
  const currentDate = new Date();
  let year = currentDate.getFullYear();
  const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
  const newDate = new Date();
  if (month < (currentDate.getMonth()+1)) {
    year = year + 1;
  } 
  newDate.setFullYear(year);
  newDate.setMonth(month-1);
  const lastDayOfSelectedMonth = new Date(newDate.getFullYear(), newDate.getMonth()+1, 0).getDate();
  const currentDay = currentDate.getDate();
  newDate.setDate(lastDayOfSelectedMonth);

  return Math.round(Math.abs((newDate.getTime() - currentDate.getTime())/(oneDay)));
}

this.getFullPaths = (rootDir) => {
  let paths = [];
  fs.readdirSync(rootDir).forEach(file => {
   let fullPath = fsPath.join(rootDir, file);
 
   if (fs.lstatSync(fullPath).isDirectory()) {
      paths = paths.concat(this.getFullPaths(fullPath));
   } else {
      paths.push(fullPath);
   }
  });
  return paths;
}

this.getCurrentMonth = () => {
  const currentDate = new Date();
  return currentDate.getMonth()+1;
}

this.createWhitespace = (level) => {
  let whitespace = "";
  for (let i = 0; i < level; i++) {
      whitespace = whitespace + " ";
  };
  return whitespace;
}

this.isBase64String = (str) => {
  const params = base64RegEx.exec(str);
  return params !== null && params.length > 0;
};

this.base64ToString = (base64Str) => {
  return Buffer.from(base64Str, "base64").toString("utf8");
};

this.stringToBase64 = (str) => {
  return Buffer.from(str, "utf8").toString("base64");
};

this.decryptFromBase64Str = (base64Str, decryptionKey, passphrase) => {
  const dataBuf = Buffer.from(base64Str, "base64");
  try {
      return crypto.privateDecrypt({ 
          key: decryptionKey,
          passphrase,
          padding: crypto.constants.RSA_PKCS1_PADDING
      }, dataBuf).toString("utf8");
  } catch (err) {
      console.log(err);
      return null;
  }
};

this.encryptToBase64Str = (dataStr, encryptionkey) => {
  const dataBuf = Buffer.from(dataStr, "utf8");
  try {
      return crypto.publicEncrypt( { 
          key: encryptionkey,
          padding: crypto.constants.RSA_PKCS1_PADDING
      }, dataBuf).toString("base64");
  } catch (err) {
      console.log(err);
      return null;
  }
};

this.generatePublicPrivateKeys = function(passphrase) {
  return crypto.generateKeyPairSync('rsa', { modulusLength: 4096,
      publicKeyEncoding: { type: 'spki', format: 'pem'},
      privateKeyEncoding: { type: 'pkcs8', format: 'pem', cipher: 'aes-256-cbc', passphrase }
  });
};
  
this.createProperty = function(object, name, callback, eventCallback) {
  Object.defineProperty(object, name, { configurable: false, writable: false, value: callback });
  Object.defineProperty(object, `${name}Event`, { configurable: false, writable: false, value: eventCallback });
};
  
}

if (typeof module === "undefined"){
window.module = { exports: null };
} else {
  const fs = require("fs");
  const vm = require("vm");
  const crypto = require("crypto");
  const fsPath = require("path");
  module.exports = new Utils({ fs, vm, fsPath, crypto });
}
if (typeof window !== "undefined"){
window.require = (src) => {
  return new Promise( (resolve) => {
      var script = document.createElement('script');
      script.onload = () => {
          resolve(module.exports);
      };
      script.src = src;
      document.getElementsByTagName('head')[0].appendChild(script);
  });
}
window.utils = new Utils({ fs:null,vm: null, path: null });;
}
