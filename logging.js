function Logging() {
    function generateGUID(argument) {
      function S4() {
          return (((1 + Math.random()) * 0x10000) |0).toString(16).substring(1); 
      }
      return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }
    var logTrack='';
    this.track=function(){
        logTrack=generateGUID();
    },
    this.write = function(message, args) {
        if (message == undefined || message == null) {
            var err = new Error('message was empty');
            throw err;
        }
        if(typeof message!=='string'){
            console.error(' MESSAGE WAS NOT A STRING',message);
        }
        var newMessage=`[${logTrack}]${message}`;
        if (args) {
            console.log(newMessage, args);
        } else {
            console.log(newMessage);
        }
    };
};
module.exports = new Logging();