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
      drive.files.list(function(err, res){
          if (err) {
            console.log(err);
            return;
          }
          for (var i = 0; i < res.files.length; i++) {
              const file = res.files[i];
              console.log('deleting ',file.id);
              drive.files.delete({
                fileId: file.id
              });
          };
      });

    });
    drive = google.drive({
        version: 'v3',
        auth: jwtClient
    });
    
    function getFileId(name, callback){
        
          drive.files.list(function(err, res){
              if (err) {
                console.log(err);
                return;
              }
              for (var i = 0; i < res.files.length; i++) {
                const file = res.files[i];
                if (file.name==name){
                    console.log('file was found: ',file.id);
                    callback(file.id);
                    return;
                }
              };
              callback(null);
          });
    };

    
    
    this.replace=function(name, data, callback){
      getFileId(name, function(_fileId){
          if (_fileId){
            drive.files.delete({
              fileId: _fileId
            });
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
                  mimeType: 'application/json',
                  alt: 'media' // THIS IS IMPORTANT PART! WITHOUT THIS YOU WOULD GET ONLY METADATA
              }, function(err, result) {
                  if(err){
                    console.log(err);
                    callback(null);
                  }else{
                    callback(result);
                  }
              });
          }else{
            console.log(`${name} does not exist`);
            callback(null);
          }
        });
    }
}
module.exports=GoogleDrive;
