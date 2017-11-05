var google = require('googleapis');
var key = require('./privatekey.json');
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
module.exports={
  create: function(name, data, callback){
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
  },
  load: function(name, callback){
  }
};
