const utils = require('./utils.js');
const logging = require('./logging.js');
const MessageBus = require('./messageBus.js');
const MessageStore = require('./messageStore.js');

function MessageBusService(messageBusProcess, messageSendRetryMax, isHost, canReplay) {
    
    const thisService = this;
    const serviceName=process.env.thisserveraddress.split('.')[0];
    const serviceFileName=`${serviceName}.json`;

    this.messageStore = new MessageStore(process.env.privatekey, isHost, serviceFileName);
    this.messageBus = new MessageBus(this, serviceFileName, canReplay, this.messageStore);
    
    if (isHost == true) {
        const port = utils.getHostAndPortFromUrl(process.env.thisserveraddress).port;
        utils.receiveHttpRequest(port, function requestReceived(obj) {
            if (obj.data && obj.channel) {
                thisService.messageBus.receiveExternalPublishMessage(obj);
            } else if(typeof obj==='function'){
                thisService.messageStore.load(function(messages){
                   const messagesJson=utils.getJSONString(messages);
                   obj(messagesJson);
                });
            } else {
                logging.write('received http message structure is wrong.');
            }
        });
    }

    messageBusProcess.on('message', (receiveMessage) => {
        thisService.messageBus.receiveInternalPublishMessage(receiveMessage);
    });

    this.sendInternalPublishMessage = function(message, callback, callbackFail) {
        logging.write(`sending internal message to ${message.channel} channel.`);
        const result = messageBusProcess.send(message);
        if (result == true) {
            callback();
        } else {
            if (callbackFail) {
                callbackFail();
            } else {
                logging.write(`failed to notify parent process`);
            }
        }
    };

    this.sendExternalPublishMessage = function(message, callback) {
        utils.readJsonFile('publishAddresses.json', function(publishAddresses) {
            for (var i = publishAddresses.length - 1; i >= 0; i--) {
                const publishAddress=publishAddresses[i];
                if (publishAddress.channel==message.channel && utils.isValidUrl(publishAddress.address)==true){
                    logging.write(`sending message to ${publishAddress.address}`);
                    utils.sendHttpRequest(publishAddress.address, message, '', function sucess() {
                        thisService.messageStore.save(message, callback);
                    }, function fail() {
                        var retryCounter = 0;
                        const serviceUnavailableRetry = utils.createTimer(true, `${message.channel} retrying`);
                        serviceUnavailableRetry.setTime(5000);
                        serviceUnavailableRetry.start(function() {
                            logging.write(`retry: sending message to ${publishAddress.address} on channel #{message.channel}`);
                            utils.sendHttpRequest(publishAddress.address, message, '', function success() {
                                serviceUnavailableRetry.stop();
                                thisService.messageStore.save(message, callback);
                            }, function fail() {
                                if (retryCounter > messageSendRetryMax) {
                                    logging.write(`retry limit of ${messageSendRetryMax} has been reached, stopping retry`);
                                    serviceUnavailableRetry.stop();
                                }
                                retryCounter++;
                            });
                        });
                    });
                }
            };
        });
    };
    
};
module.exports = MessageBusService;
