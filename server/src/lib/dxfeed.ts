'use strict';
import { ResetTimer } from './ResetTimer';
import { BasePackage, mapdata, MappedData } from "../models/BasePackage";
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
    trade?: string[] = [];
    quote?: string[] = [];
    summary?: string[] = [];
    profile?: string[] = [];

    dirty: boolean = false;

    static makeRequest = function (request: Request) {
        const output = {};
        for (const key of ["trade", "quote", "summary", "profile"]) {
            if (request[key]) {
                const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
                output[upperKey] = request[key];
            }
        }
        return output;
    }

    add = (sym: string) => {
        for (const key of ["trade", "quote", "summary", "profile"]) {
            this[key] = this[key] || [];
            this[key].push(sym);
        }
    }

    merge = (request: Request) => {
        if (!request) return;

        for (const s of ["trade", "quote", "summary", "profile"]) {
            if (request[s] && request[s].length) {
                const all = (this[s] || []).concat(request[s]);
                const tmp = {};
                for (const sym of all) {
                    tmp[sym] = null;
                }
                this[s] = Object.keys(tmp);
            }
        }
        this.dirty = true;
    }
}



export class DxFeed {
    private cometd: any;

    private resetTimer: ResetTimer;

    private dataListeners: { [key: string]: (data: any) => void } = {};

    private symbolsToSubscribe = {};


    addListener = (key: string, callback: (data: MappedData) => void) => {
        this.dataListeners[key] = callback;
    }

    // It's your responsibility to make sure the request is < 264000
    // That's the max size set by TW.
    enqueue = (symbols: string[]) => {
        for (const s of (symbols || [])) {
            this.symbolsToSubscribe[s] = null;
        }

        this.resetTimer = this.resetTimer || new ResetTimer(this.publish);
        this.resetTimer.start();
    }

    private publish = (first:boolean = false) => {
        const syms = Object.keys(this.symbolsToSubscribe);
        if (syms && syms.length) {
            const nextRequest = new Request();
            for (let i = 0; i < Math.min(syms.length, 50); i++) {
                const sym = syms[i];
                delete this.symbolsToSubscribe[sym];

                nextRequest.add(sym);
            }

            try {
                this.cometd.publish("/service/sub", { "add": Request.makeRequest(nextRequest) });
                console.debug(`Subscribing to ${(nextRequest.trade && nextRequest.trade.length) || 0} symbols...`);
            } catch (e) { }

            this.resetTimer.stop();
            if (Object.keys(this.symbolsToSubscribe).length) {
                this.resetTimer.start();
            }
        }
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

export default DxFeed;