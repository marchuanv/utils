const utils = require('./utils.js');
const logging = require('./logging.js');
const MessageBus = require('./messageBus.js');

function MessageBusService(routingMode, messageBusProcess, messageSendRetryMax, isHost) {
    this.messageBus = new MessageBus(this);
    const thisService = this;
    const privatekey=utils.getJSONObject(process.env.privatekey);

    if (isHost == true) {
        const port = utils.getHostAndPortFromUrl(process.env.thisserveraddress).port;
        utils.receiveHttpRequest(port, function requestReceived(obj) {
            if (obj.data && obj.channel) {
                thisService.messageBus.receiveExternalPublishMessage(obj);
            } else if(typeof obj==='function'){
                utils.downloadGoogleDriveData(privatekey, 'messages.json', function(existingMessages) {
                   const resData=utils.getJSONString(existingMessages);
                   obj(resData);
                });
            } else {
                logging.write('received http message structure is wrong.');
            }
        });
    }

    messageBusProcess.on('message', (receiveMessage) => {
        if (routingMode == true) {
            logging.write('internal message will be sent to routing subscription');
            thisService.messageBus.receiveRoutingMessage(receiveMessage);
        } else {
            thisService.messageBus.receiveInternalPublishMessage(receiveMessage);
        }
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

    this.sendExternalPublishMessage = function(message) {
        utils.readJsonFile('publishAddresses.json', function(publishAddresses) {
            for (var i = publishAddresses.length - 1; i >= 0; i--) {
                const publishAddress=publishAddresses[i];
                if (publishAddress.channel==message.channel && utils.isValidUrl(publishAddress.address)==true){
                    logging.write(`notifying remote subscriptions at ${publishAddress.address}`);
                    utils.sendHttpRequest(publishAddress.address, message, '', function sucess() {
                        utils.downloadGoogleDriveData(privatekey, 'messages.json', function(existingMessages) {
                            if (existingMessages) {
                                existingMessages.push(message);
                                utils.uploadGoogleDriveData(privatekey, 'messages.json', existingMessages);
                            } else {

                                utils.uploadGoogleDriveData(privatekey, 'messages.json', [message]);
                            }
                        });
                    }, function fail() {
                        var retryCounter = 0;
                        const serviceUnavailableRetry = utils.createTimer(true, `${message.channel} retrying`);
                        serviceUnavailableRetry.setTime(5000);
                        serviceUnavailableRetry.start(function() {
                            logging.write(`retry: sending message to ${publishAddress.address} on channel #{message.channel}`);
                            utils.sendHttpRequest(publishAddress.address, message, '', function success() {
                                utils.downloadGoogleDriveData(privatekey, 'messages.json', function(existingMessages) {
                                    if (existingMessages) {
                                        existingMessages.push(message);
                                        utils.uploadGoogleDriveData(privatekey, 'messages.json', existingMessages);
                                    } else {
                                        
                                        utils.uploadGoogleDriveData(privatekey, 'messages.json', [message]);
                                    }
                                });
                                serviceUnavailableRetry.stop();
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