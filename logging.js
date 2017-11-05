function Logging() {
    var conditions = [];
    this.condition = function(cond) {
        conditions.push(cond);
    }
    this.write = function(message, args) {
        if (message == undefined || message == null) {
            var err = new Error('message was empty');
            throw err;
        }
        console.log();
        console.log('CONDITION CHECK START: ',conditions);
        var passed = true;
        for (var i = 0; i < conditions.length; i++) {
            const cond = conditions[i];
            if (cond(message) == false) {
                console.log('condition not met');
                passed = false;
            }
        };
        console.log('CONDITION CHECK STOP');
        console.log();
      
        if (passed == false) {
            return;
        }
        if (args) {
            console.log(message, args);
        } else {
            console.log(message);
        }
    };
};
module.exports = new Logging();
