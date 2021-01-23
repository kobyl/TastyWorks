import { BaseMessage, IncomingType, LoginResponse, LoginRequest, OutgoingTypes, TypedMessage, BaseResponse, ServerNotification, GetOptionsRequest, GetOptionsResponse } from "../clientlib/Messages";
import { Assert } from "../clientlib/Assert";
import { Streamer } from './streamer';
import { TastyWorks } from './TastyWorks';
import DxFeed from "./dxfeed";
import { optionSymbolToObject, getDxSymbol } from "../models/OptionChain";
import optionChain from "./optionChain";

const WebSocket = require('ws');


export class Server {
    private wss: any;
    private handlers: { [type: string]: (msg: BaseMessage) => void } = {};
    private streamer: Streamer;
    private tw: TastyWorks = new TastyWorks();
    private dxfeed = new DxFeed();

    constructor() {
        this.handlers[IncomingType.Login] = this.handleLogin;
        this.handlers[IncomingType.GetOptions] = this.getOptions;
    }

    listen = (port: number) => {
        this.wss = new WebSocket.Server({ port: port });
        this.wss.on('connection', client => {
            client.send(JSON.stringify({ Server: "Connected" }));

            client.on('message', this.onMessage);
        });
    }
    // ws.send(asStr({ Hello: "there" }));

    onMessage = (msgStr: string) => {
        try {
            const message = JSON.parse(msgStr);
            this.handlers[message.type] && this.handlers[message.type](message);
        } catch (e) {
            console.error(`Unexpected non json message: ${msgStr}`);
        }
    }

    send = (message: BaseMessage | BaseResponse | ServerNotification) => {
        for (const client of this.wss.clients) {
            client.send(JSON.stringify(message));
        }
    }

    getOptions = async (msg: TypedMessage) => {
        Assert(msg.type === IncomingType.GetOptions, "Wrong Type");

        const request = msg as GetOptionsRequest;
        const tasks = request.underlyings.map(s => this.tw.optionChain(s));

        await Promise.all(tasks.map(async t =>
            (await t).expirations
                .map(expire => expire.strikes)
                .map(strikes => strikes
                    .map(strike => {
                        const callmeta = optionSymbolToObject(strike.call);
                        const putmeta = optionSymbolToObject(strike.put);
                        strike.callDx = getDxSymbol(callmeta);
                        strike.putDx = getDxSymbol(putmeta);
                        return strike;
                    }))
        ));

        let symbolTasks = await Promise.all(tasks);
        const chainResponse:GetOptionsResponse = {
            chains: {},
            requestId: msg.requestId
        };

        for (let t of symbolTasks) {
            const sym = await t;
            chainResponse.chains[sym["root-symbol"]] = sym;
        }

        this.send(chainResponse);
    }

    handleLogin = async (msg: TypedMessage) => {
        Assert(msg.type === IncomingType.Login, "Wrong Type");

        const loginRequest = msg as LoginRequest;
        const response: LoginResponse = {
            accounts: [],
            sessionToken: '',
            errors: [],
            requestId: msg.requestId
        };

        if (!loginRequest || !loginRequest.username || !loginRequest.password) {
            response.errors = ["Invalid request"];
            this.send(response);
            return;
        }

        try {
            this.tw.setUser(loginRequest);
            const token = await this.tw.authorization();
            this.tw.setAuthorizationToken(token);
            response.sessionToken = token;

            this.streamer = new Streamer(token);
            response.accounts = await this.tw.accounts();

            const streamerToken = await this.tw.getStreamerToken();
            this.dxfeed.connect(streamerToken);

        } catch (e) {
            response.errors.push(e);
        }
        this.send(response);
    }
}

