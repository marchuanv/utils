var google = require('googleapis');
function GoogleDrive(key){
    var drive = null;

    var authScopes =  ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/drive.file'];

    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      authScopes, // an array of auth scopes
      null
    );

    jwtClient.authorize(function (err, tokens) {
      if (err) {
        console.log(err);
        return;
      }
      drive = google.drive({
        version: 'v3',
        auth: jwtClient
      });
    });
    
    function getFileId(name, callback){
        setTimeout(function(){
          drive.files.list(function(res){
              console.log('Files:', res);
              for (var i = 0; i < res.files.length; i++) {
                const file = res.files[i];
                if (file.name==name){
                    callback(file.id);
                    return;
                }
              };
              callback(null);
          });
        },5000);
    };
    
    this.replace=function(name, data, callback){
      getFileId(name, function(_fileId){
          if (_fileId){
                drive.files.delete({fileId: _fileId});
          }
          drive.files.create({
            resource: {
              name: name,
              mimeType: 'application/json'
            },
            media: {
              mimeType: 'application/json',
              body: data
            }
          }, callback);
      });
    };
    
    this.load=function(name, callback){
        getFileId(name, function(_fileId){
          if (_fileId){
              drive.files.get({
                  fileId: _fileId,
                  alt: 'media' // THIS IS IMPORTANT PART! WITHOUT THIS YOU WOULD GET ONLY METADATA
              }, function(err, result) {
                  if(err){
                    console.log(err);
                    return;
                  }
                  callback(result);
              });
          }else{
            console.log(`${name} does not exist`);
          }
        });
    }
}
module.exports=GoogleDrive;
