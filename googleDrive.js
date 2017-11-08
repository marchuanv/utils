var google = require('googleapis');
function GoogleDrive(key){
    var drive = null;

    var authScopes =  ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/drive.file'];
    const thisInstance=this;
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
      
      });
    });

    drive = google.drive({
        version: 'v3',
        auth: jwtClient
    });

    function getFileId(name, cbFound, cbNotFound){
          drive.files.list(function(err, res){
              if (err && err.toString().indexOf('File not found')==-1) {
                console.log(err);
                return;
              }
              var exists=false;
              for (var i = 0; i < res.files.length; i++) {
                const file = res.files[i];
                if (file.name==name){
                    exists=true;
                    cbFound(file.id);
                    return;
                }else if (!name){
                    exists=true;
                    cbFound(file.id);
                }
              };
              if (!exists && cbNotFound){
                  cbNotFound(null);
              }
          });
    };
    
    this.delete=function(name){
        getFileId(name, function found(_fileId){
              console.log(`deleting ${_fileId}.`);
              drive.files.delete({
                  fileId: _fileId
              },function(){
                console.log(`${_fileId} was deleted.`);
              });
        },function notFound(){
           console.log('no files to delete');
        });
    };

    this.new=function(name, dataStr, cbDone){
        getFileId(name, function found(_fileId){
           console.log('could not create new file, already exists.');
        },function notFound(){
            drive.files.create({
              resource: {
                name: name,
                mimeType: 'application/json'
              },
              media: {
                mimeType: 'application/json',
                body: dataStr
              }
            }, function(err){
                if (err){
                  console.log(err);
                }else{
                  if (cbDone){
                      cbDone();
                  }
                }
            });
        });
    };

    this.replace=function(name, dataStr, cbDone, cbNotFound){
        getFileId(name, function found(_fileId){
            drive.files.delete({
                fileId: _fileId
            },function(err){
                if (err){
                   console.log(err);
                } else {
                    thisInstance.new(
                      name, 
                      dataStr, 
                      cbDone
                    );
                }
            });
        },cbNotFound);
    };
    
    this.load=function(name, cbFound, cbNotFound){
        getFileId(name, function found(_fileId){
            drive.files.get({
                fileId: _fileId,
                mimeType: 'application/json',
                alt: 'media' // THIS IS IMPORTANT PART! WITHOUT THIS YOU WOULD GET ONLY METADATA
            }, function(err, result) {
                if(err){
                  console.log(err);
                }else{
                  cbFound(result);
                }
            });
        },cbNotFound);
    }
}
module.exports=GoogleDrive;
