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
    this.create=function(name, data, callback){
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
    };
    this.load=function(name, callback){
        var files = drive.files;
        if (files.length == 0) {
          console.log('No files found.');
        } else {
          console.log('Files:');
          for (var i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.name==name){
              drive.files.get({
                  fileId: file.id,
                  alt: 'media' // THIS IS IMPORTANT PART! WITHOUT THIS YOU WOULD GET ONLY METADATA
              }, function(err, result) {
                  if(err){
                    console.log(err);
                    return;
                  }
                  callback(result);
              });
              return;
            }
          }
        }
    }
}
module.exports=GoogleDrive;
