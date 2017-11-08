const utils = require('./utils.js');
const logging = require('./logging.js');
const MessageBus = require('./messageBus.js');

function MessageBusService(routingMode, messageBusProcess, messageSendRetryMax, isHost, publishOnRestart) {
    
    this.messageBus = new MessageBus(this);
    
    const thisService = this;
    const privatekey=utils.getJSONObject(process.env.privatekey);
    const serviceName=process.env.thisserveraddress.split('.')[0];
    const fileName=`${serviceName}.json`;
    const unsavedMessages=[];

    if (isHost == true) {
        const port = utils.getHostAndPortFromUrl(process.env.thisserveraddress).port;
        utils.receiveHttpRequest(port, function requestReceived(obj) {
            if (obj.data && obj.channel) {
                thisService.messageBus.receiveExternalPublishMessage(obj);
            } else if(typeof obj==='function'){
                utils.downloadGoogleDriveData(privatekey, fileName, function found(messages) {
                   const messagesJson=utils.getJSONString(messages);
                   obj(messagesJson);
                },function notFound(){
                    obj('no messages found');
                });
            } else {
                logging.write('received http message structure is wrong.');
            }
        });
    }else if (publishOnRestart==true){

        const publisherTimer=utils.createTimer(true, 'publisher');
        publisherTimer.setTime(10000);

        function savePublishedMessages(){
            logging.write('');
            logging.write('////////////////// SAVE TIMER ////////////////////');
            utils.downloadGoogleDriveData(privatekey, fileName, function found(messages) {
                logging.write('messages downloaded');
                while(unsavedMessages.length>0){
                        const message=unsavedMessages.splice(0, 1);
                        messages.push(message);
                };
                utils.uploadGoogleDriveData(privatekey, fileName, messages);
            });
            logging.write('');
        };

        utils.downloadGoogleDriveData(privatekey, fileName, function found(messages) {
            messages.sort(function(x,y){
                return y.date-x.date;
            });
            while(messages.length > 0) {
                const msg=messages.splice(0,1);
                thisService.messageBus.publish(msg.channel, msg.userId, msg.data);
            };
            utils.uploadGoogleDriveData(privatekey, fileName, []); //clear messages as they will be recreated during publish
            publisherTimer.start(savePublishedMessages);
        },function notFound(){
            const messages=[];
            utils.uploadGoogleDriveData(privatekey, fileName, messages);
            publisherTimer.start(savePublishedMessages);
        });

    }else {
         utils.uploadGoogleDriveData(privatekey, fileName, []);
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
                        if (publishOnRestart==true){
                            unsavedMessages.push(message);
                        }
                    }, function fail() {
                        var retryCounter = 0;
                        const serviceUnavailableRetry = utils.createTimer(true, `${message.channel} retrying`);
                        serviceUnavailableRetry.setTime(5000);
                        serviceUnavailableRetry.start(function() {
                            logging.write(`retry: sending message to ${publishAddress.address} on channel #{message.channel}`);
                            utils.sendHttpRequest(publishAddress.address, message, '', function success() {
                                if (publishOnRestart==true){
                                    unsavedMessages.push(message);
                                }
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