'use strict';

import { BasePackage, mapdata } from "../models/BasePackage";
const Comet = require("cometd");

require('cometd-nodejs-client').adapt();

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

// https://api.tastyworks.com/quote-streamer-tokens

export class Request {
    trade?: string[];
    quote?: string[];
    summary?: string[];
    profile?: string[];

    static makeRequest = function (request: Request) {
        const output = {};
        for (let key of ["trade", "quote", "summary", "profile"]) {
            if (request[key]) {
                const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
                output[upperKey] = request[key];
            }
        }
        return output;
    }
}

export class Cometd {
    private cometd: any;

    private dataListeners: { [key: string]: (data: any) => void } = {};

    addListener = (key: string, callback: (data: any) => void) => {
        this.dataListeners[key] = callback;
    }

    subscribe = (request: Request) => {
        this.cometd.publish("/service/sub", { "reset": true, "add": Request.makeRequest(request) });
    }

    connect = (token) => {
        console.log("Starting cometd");
        this.cometd = new Comet.CometD();
        // cometd.unregisterTransports();

        // Registration order is important.
        // cometd.registerTransport('websocket', new cometd.WebSocketTransport());
        // cometd.registerTransport('long-polling', new LongPollingTransport(cometd));
        // cometd.registerTransport('callback-polling', new CallbackPollingTransport(cometd));

        const processData = (pkg: BasePackage) => {
            const data = mapdata(pkg);

            for (let callback of Object.values(this.dataListeners)) {
                callback && callback(data);
            }
        };

        this.cometd.addListener("/meta/handshake", console.table);
        this.cometd.addListener("/meta/connect", console.table);
        this.cometd.addListener("/meta/unsuccessful", console.table);
        this.cometd.addListener("/service/state", console.table);
        this.cometd.addListener("/service/data", processData);
        this.cometd.addListener("/service/timeSeriesData", processData);

        let config = {
            url: 'wss://tasty.dxfeed.com/live/cometd',
        };
        this.cometd.configure(config);
        this.cometd.handshake({ ext: { "com.devexperts.auth.AuthToken": token } });
        console.log("Call complete");

    }
}
/**
 * Connect to cometd
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const cometd = (headers, data, strike) => {
    console.log(data);
    console.log("Starting cometd");
    const cometd = new Comet.CometD();
    // cometd.unregisterTransports();

    // Registration order is important.
    // cometd.registerTransport('websocket', new cometd.WebSocketTransport());
    // cometd.registerTransport('long-polling', new LongPollingTransport(cometd));
    // cometd.registerTransport('callback-polling', new CallbackPollingTransport(cometd));

    console.table(headers['Authorization']);

    const processData = (pkg: BasePackage) => {
        const data = mapdata(pkg);
        console.log("Type:" + data.type);
        console.table(data.mappedData);
    };

    cometd.addListener("/meta/handshake", console.table);
    cometd.addListener("/meta/connect", console.table);
    cometd.addListener("/meta/unsuccessful", console.table);
    cometd.addListener("/service/state", console.table);
    cometd.addListener("/service/data", processData);
    cometd.addListener("/service/timeSeriesData", console.table);

    let config = {
        url: 'wss://tasty.dxfeed.com/live/cometd',
    };
    cometd.configure(config);
    cometd.handshake({ ext: { "com.devexperts.auth.AuthToken": data.token } });
    console.log("Call complete");
}

export default Cometd;