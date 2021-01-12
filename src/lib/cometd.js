'use strict';

require('cometd-nodejs-client').adapt();
const lib = require("cometd");

// Function that manages the connection status with the Bayeux server
function onMetaHandshake(message) {
    // if (cometd === null || cometd.isDisconnected()) {
    //     updateConnectedState(false);
    //     return;
    // }
    // if (!message.successful) {
    //     info("Authentication failed or no token provided");
    // }
    // updateConnectedState(message.successful === true);
}

// Function that manages the connection status with the Bayeux server
function onMetaConnect(message) {
    // if (cometd === null || cometd.isDisconnected()) {
    //     updateConnectedState(false);
    //     return;
    // }
    // updateConnectedState(message.successful === true);
}

function onMetaUnsuccessful() {
    // updateConnectedState(false)
}

function onServiceState(message) {
    // debug("Received state " + JSON.stringify(message));
    // endpointImpl.onStateChange(message.data);
}

function onServiceData(message) {
    // debug("Received data " + JSON.stringify(message));
    // endpointImpl.onData(message.data, false);
}

function onServiceTimeSeriesData(message) {
    // debug("Received time series data " + JSON.stringify(message));
    // endpointImpl.onData(message.data, true);
}

const subscribe = function(message) {

}

const publish = function (service, message) {
    debug("Publishing to " + service + ": " + JSON.stringify(message));
    cometd.publish("/service/" + service, message);
};

// https://api.tastyworks.com/quote-streamer-tokens

/**
 * Connect to cometd
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

module.exports = (headers, data) => {
    console.log(data);
    console.log("Starting cometd");
    let config = {};
    const cometd = new lib.CometD();
    // cometd.unregisterTransports();

    // Registration order is important.
    // cometd.registerTransport('websocket', new cometd.WebSocketTransport());
    // cometd.registerTransport('long-polling', new LongPollingTransport(cometd));
    // cometd.registerTransport('callback-polling', new CallbackPollingTransport(cometd));

    console.table(headers['Authorization']);

    const printData = pkg => {
        
        
    };

    cometd.addListener("/meta/handshake", console.table);
    cometd.addListener("/meta/connect", console.table);
    cometd.addListener("/meta/unsuccessful", console.table);
    cometd.addListener("/service/state", console.table);
    cometd.addListener("/service/data", console.table);
    cometd.addListener("/service/timeSeriesData", console.table);

    config.url = 'wss://tasty.dxfeed.com/live/cometd';
    cometd.configure(config);
    cometd.handshake({ ext: { "com.devexperts.auth.AuthToken": data.token } });

    cometd.publish("/service/sub", {"reset":true,"add":{"Trade":["SPY"],"Quote":["SPY"],"Summary":["SPY"],"Profile":["SPY"]}});

    console.log("Call complete");
}
