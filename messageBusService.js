const utils = require('./utils.js');
const logging = require('./logging.js');
const MessageBus = require('./messageBus.js');

function MessageBusService(messageBusProcess, messageSendRetryMax, isHost, canReplay) {
    
    
    const thisService = this;
    const privatekey=utils.getJSONObject(process.env.privatekey);
    const serviceName=process.env.thisserveraddress.split('.')[0];
    const serviceFileName=`${serviceName}.json`;

    this.messageBus = new MessageBus(this, serviceFileName, privatekey, canReplay);
    
    if (isHost == true) {
        const port = utils.getHostAndPortFromUrl(process.env.thisserveraddress).port;
        utils.receiveHttpRequest(port, function requestReceived(obj) {
            if (obj.data && obj.channel) {
                thisService.messageBus.receiveExternalPublishMessage(obj);
            } else if(typeof obj==='function'){
                utils.downloadGoogleDriveData(privatekey, serviceFileName, function found(messages) {
                   const messagesJson=utils.getJSONString(messages);
                   obj(messagesJson);
                },function notFound(){
                    obj('no messages found');
                });
            } else {
                logging.write('received http message structure is wrong.');
            }
        });
    }

    const unsavedMessages=[];
    const saveMessageQueueTimer=utils.createTimer(false, 'save message queue');
    var lock=false;
    function queueMessageSave(message){
        if (canReplay==true && message.channel != 'replay' && message.channel != 'purge' && isHost==false){
            console.log();
            console.log(`/////////////////////// QUEUING MESSAGE ${message.channel} ////////////////////////`);
            console.log();
            unsavedMessages.push(message);
            if (lock==false){
                lock=true;
                utils.downloadGoogleDriveData(privatekey, serviceFileName, function found(savedMessages) {
                    logging.write('messages downloaded');
                    utils.clearGoogleDriveData(privatekey, serviceFileName);
                    while(unsavedMessages.length>0){
                        const unsavedMessage=unsavedMessages.splice(0, 1)[0];
                        console.log();
                        console.log(`/////////////////////// SAVING MESSAGE ${unsavedMessage.channel} ////////////////////////`);
                        console.log();
                        for (var x = savedMessages.length - 1; x >= 0; x--) {
                            const savedMessage=savedMessages[x];
                            if (savedMessage.id==unsavedMessage.id) {
                                savedMessages.splice(x, 1)[0];
                            }
                        };
                        savedMessages.push(unsavedMessage);
                    };
                    utils.uploadGoogleDriveData(privatekey, serviceFileName, savedMessages);
                    lock=false;
                },function notFound(){
                    lock=false;
                });
            }
        }
    };

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

    this.sendExternalPublishMessage = function(message) {
        utils.readJsonFile('publishAddresses.json', function(publishAddresses) {
            for (var i = publishAddresses.length - 1; i >= 0; i--) {
                const publishAddress=publishAddresses[i];
                if (publishAddress.channel==message.channel && utils.isValidUrl(publishAddress.address)==true){
                    logging.write(`sending message to ${publishAddress.address}`);
                    utils.sendHttpRequest(publishAddress.address, message, '', function sucess() {
                       queueMessageSave(message);
                    }, function fail() {
                        var retryCounter = 0;
                        const serviceUnavailableRetry = utils.createTimer(true, `${message.channel} retrying`);
                        serviceUnavailableRetry.setTime(5000);
                        serviceUnavailableRetry.start(function() {
                            logging.write(`retry: sending message to ${publishAddress.address} on channel #{message.channel}`);
                            utils.sendHttpRequest(publishAddress.address, message, '', function success() {
                                queueMessageSave(message);
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