var google = require('googleapis');
var key = require('./privatekey.json');
var drive = google.drive('v2');

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
});
module.exports={
  create: function(name, data, callback){
    drive.files.create({
      auth: jwtClient,
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
