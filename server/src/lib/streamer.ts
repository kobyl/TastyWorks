'use strict';

import { MappedData } from "../models/BasePackage";
import { runInThisContext } from "vm";
const WebSocket = require('ws');

export class Streamer {
    [x: string]: any;
    private dataListeners: { [key: string]: (data: any) => void } = {};
    private socket: typeof WebSocket;
    private nextRequestId: number = 0;
    private connected: boolean = false;
    private connectPromise: Promise<any> = null;

    constructor(private sessionToken) {

    }

    sendJson = async (json, includeToken = true) => {
        json['request-id'] = this.nextRequestId++;
        if (includeToken) {
            json['auth-token'] = this.sessionToken;
        }
        return this.send(JSON.stringify(json));
    }

    send = async (msg) => {
        let socket = await this.connect();
        return socket.send(msg)
    }

    interval;
    heartbeat = () => {
        this.interval = setInterval(() => {
            this.sendJson({
                action: "heartbeat"
            });
        }, 5000)
    }

    clearHearthbeat = () => {
        clearInterval(this.interval);
    }

    connect = () => {
        if (this.connectPromise) {
            return this.connectPromise;
        }
        if (typeof WebSocket === "undefined" || WebSocket === null) {
            return;
        }

        if (this.socket) {
            throw new Error('Previous socket still present!');
        }


        this.socket = new WebSocket("wss://streamer.tastyworks.com");
        const that = this;
        this.connectPromise = new Promise(function (resolve, reject) {
            that.socket.onopen = function (...args) {
                that.trigger('connect', args);
                that.heartbeat();
                return resolve(that.socket);
            };

            that.socket.onclose = function (...args) {
                var timeout;
                that.trigger("disconnect", args)
                that.connectPromise = null;
                that.socket = null;
                that.clearHearthbeat();

                reject(arguments);
                timeout = 10000;
                if (timeout > 0) {
                    console.log('schedule reconnect');
                    setTimeout(that.connect, timeout);
                }
            };

            that.socket.onerror = function (...args) {
                return that.trigger("error", ...args);
            };

            return that.socket.onmessage = (...args) => {
                return that.trigger('message', ...args);
            };
        });

        return this.connectPromise;
    }

    handleConnected = (msg) => {
        this.connected = true;
        return this.trigger('connected', msg);
    };

    handleError = (msg) => {
        // this.error = msg;
        return this.trigger('error', msg);
    };
    handleDisconnected = () => {
        return this.trigger('disconnected');
    }

    trigger = (name: string, msg: any = {}) => {
        try {
            var data:any = JSON.parse(msg.data);
            const type = data.type;
            this.dataListeners[type] && this.dataListeners[type](data);
        } catch (e) {
            console.warn(`Non json incoming: ${name}: ${msg.data}`);
         }
    }

    addListener = (key: string, callback: (data: any) => void) => {
        this.dataListeners[key] = callback;
    }

}

export default Streamer;

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