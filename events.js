var google = require('googleapis');
var key = require('./privatekey.json');
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
  // Make an authorized request to list Drive files.
  drive.files.list({
    auth: jwtClient
  }, function (err, resp) {
    // handle err and response
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
  }
};
