import { BaseMessage, IncomingType, LoginResponse, LoginRequest, OutgoingTypes, TypedMessage, BaseResponse, ServerNotification, GetOptionsRequest, GetOptionsResponse, DxData, ClientQuote, FlashOrderRequest, ClientTrade, LiveOrdersResponse, LiveOrdersRequest, } from "../clientlib/Messages";
import { Assert } from "../clientlib/Assert";
import { Streamer } from './streamer';
import { TastyWorks } from './TastyWorks';
import DxFeed, { Request } from "./dxfeed";
import { optionSymbolToObject, getDxSymbol, OptionData } from "../models/OptionChain";
import { MappedData } from "../models/BasePackage";
import { Quote, Summary, Trade } from "../models/Tickers";
import { OrderStream } from "../models/Order";
import { ActionType } from "./executeOrder";

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
        this.handlers[IncomingType.FlashOrder] = this.flashOrder;
        this.handlers[IncomingType.LiveOrders] = this.liveOrders;
    }

    listen = (port: number) => {
        this.wss = new WebSocket.Server({ port: port });
        this.wss.on('connection', client => {
            client.send(JSON.stringify({ Server: "Connected" }));

            client.on('message', this.onMessage);
        });
    }
    // ws.send(asStr({ Hello: "there" }));

    private onMessage = (msgStr: string) => {
        try {
            const message = JSON.parse(msgStr);
            this.handlers[message.type] && this.handlers[message.type](message);
        } catch (e) {
            console.error(`Unexpected non json message: ${msgStr}`);
        }
    }

    private send = (message: BaseMessage | BaseResponse | ServerNotification | DxData) => {
        for (const client of this.wss.clients) {
            client.send(JSON.stringify(message));
        }
    }

    flashOrder = async (msg: TypedMessage) => {
        try {
            Assert(msg.type === IncomingType.FlashOrder, "Wrong Type");
            const req = msg as FlashOrderRequest;
            const symbol = req.symbol;
            const account = req.account;
            const action = req.action;

            let q = this.liveQuotes[symbol];
            const optionChain = this.optionChains[q.underlying];

            if (!q || !q.bidPrice || !q.askPrice || !q.officialSymbol) {
                debugger;
                return;
            }
            if (!optionChain) {
                debugger;
                return;
            }

            // TODO: Properly calc size based on threshold.
            // For now - if the option is > $3 we use 0.05. Otherwise 0.01. I haven't figured out how they determine tick sizes.
            let tickSize = q.bidPrice < 3 ? 0.01 : 0.05;

            let targetBid: any = action === ActionType.BTO
               ? q.bidPrice + tickSize
               : q.askPrice - tickSize;

            targetBid = targetBid.toFixed(2);

            let delay = 200;

            console.log(`Flash order ${account}, ${q.officialSymbol}, ${targetBid}`);
            let orderResponse = await this.tw.executeOrder(account, q.officialSymbol, targetBid, 1, action);
            const oid = orderResponse.order.id + '';
            console.log("New order: " + orderResponse.order.id);

            if (!oid) return;

            setTimeout(async () => {
                const status = this.orderStatuses[oid];
                if (!status || status.toUpperCase() != "FILLED") {
                    const deleteResponse = await this.tw.cancelOrder(account, orderResponse.order.id);
                    console.log("Delete Response");
                    console.table(deleteResponse);
                } else {
                    // bought = true;
                    // sell(account, symbols[0], targetBid);
                }
            }, delay);
        } catch (e) {
            console.error(e);
            debugger;
        }
    }


    getOptions = async (msg: TypedMessage) => {
        Assert(msg.type === IncomingType.GetOptions, "Wrong Type");

        const request = msg as GetOptionsRequest;
        const underlyings = (request.underlyings || []).map(s => (s || '').toUpperCase().trim()).filter(s => s);

        const tasks = underlyings.map(s => this.tw.optionChain(s));

        await Promise.all(tasks.map(async t => {
            let chain: OptionData = await t;
            this.optionChains[chain["underlying-symbol"]] = chain;
            chain.expirations
                .map(expire => expire.strikes)
                .map(strikes => strikes
                    .map(strike => {
                        const callmeta = optionSymbolToObject(strike.call);
                        const putmeta = optionSymbolToObject(strike.put);
                        strike.callDx = getDxSymbol(callmeta);
                        strike.putDx = getDxSymbol(putmeta);

                        this.liveQuotes[strike.callDx] = this.liveQuotes[strike.callDx] || {};
                        this.liveQuotes[strike.putDx] = this.liveQuotes[strike.putDx] || {};

                        this.liveQuotes[strike.callDx].officialSymbol = callmeta.realTradingSymbol;
                        this.liveQuotes[strike.putDx].officialSymbol = putmeta.realTradingSymbol;
                        this.liveQuotes[strike.putDx].underlying = chain["underlying-symbol"];
                        this.liveQuotes[strike.callDx].underlying = chain["underlying-symbol"];
                        return strike;
                    }))
        }
        ));

        let symbolTasks = await Promise.all(tasks);
        const chainResponse: GetOptionsResponse = {
            chains: {},
            requestId: msg.requestId
        };

        for (let t of symbolTasks) {
            const sym = await t;
            chainResponse.chains[sym["root-symbol"]] = sym as OptionData;
        }

        this.send(chainResponse);

        const syms: string[] = [...underlyings];

        for (const sym of Object.keys(chainResponse.chains)) {
            const chain = chainResponse.chains[sym];
            for (const exp of chain.expirations) {
                for (const strike of exp.strikes) {
                    syms.push(strike.callDx);
                    syms.push(strike.putDx);
                }
            }
        }

        this.dxfeed.enqueue(syms);
    }

    liveOrders = async (msg: TypedMessage) => {
        Assert(msg.type === IncomingType.LiveOrders, "Wrong Type");
        const request: LiveOrdersRequest = msg as LiveOrdersRequest;
        const accounts: string[] = request.accounts;
        
        let liveOrderTasks = accounts.map(account => this.tw.liveOrders(account));
        const orders = await Promise.all(liveOrderTasks);

        const response : LiveOrdersResponse = {
            type: IncomingType.LiveOrders,
            orders,
            requestId: msg.requestId
        }
        this.send(response);
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
            this.streamer.addListener("Order", (pkg: any) => {
                const orderStream = pkg as OrderStream;
                if (!orderStream) debugger;

                let { data } = orderStream;
                if (!data || !data.id || !data.status) debugger;

                this.orderStatuses[data.id + ''] = data.status;
            });


            response.accounts = await this.tw.accounts();

            const streamerToken = await this.tw.getStreamerToken();
            this.dxfeed.connect(streamerToken);
            this.dxfeed.addListener("data", this.handleDxData);
        } catch (e) {
            response.errors.push(e);
        }
        this.send(response);
    }


    liveQuotes: { [symbol: string]: Partial<ClientQuote> } = {};
    liveTrades: { [symbol: string]: Partial<ClientTrade> } = {};
    optionChains: { [underlying: string]: OptionData } = {};
    orderStatuses = {};

    handleDxData = (data: MappedData) => {
        const quotes: { [symbol: string]: Partial<ClientQuote> } = {};
        const trades: { [symbol: string]: Partial<ClientTrade> } = {};
        const dxData: DxData = {
            type: OutgoingTypes.Quote,
            quotes: quotes,
            trades: trades,
        };

        // console.log(data.type);
        // console.table(data.mappedData);
        if (!data.mappedData || !data.mappedData[0]) {
            debugger;
            return;
        }


        if (data.type === "Quote") {
            for (var mapped of data.mappedData) {
                const quote: Quote = mapped;
                const { eventSymbol, bidPrice, askPrice, bidTime, askTime } = quote;

                this.liveQuotes[eventSymbol] = this.liveQuotes[eventSymbol] || {};

                quotes[eventSymbol] = this.liveQuotes[eventSymbol];
                quotes[eventSymbol].bidPrice = bidPrice;
                quotes[eventSymbol].askPrice = askPrice;
                quotes[eventSymbol].bidTime = bidTime;
                quotes[eventSymbol].askTime = askTime;
            }
        }
        if (data.type === "Summary") {

            for (var mapped of data.mappedData) {
                const summary: Summary = mapped;
                const { eventSymbol, prevDayVolume, dayHighPrice, dayLowPrice } = summary;

                this.liveQuotes[eventSymbol] = this.liveQuotes[eventSymbol] || {};

                quotes[eventSymbol] = this.liveQuotes[eventSymbol];
                quotes[eventSymbol].dayHighPrice = dayHighPrice;
                quotes[eventSymbol].dayLowPrice = dayLowPrice;
                quotes[eventSymbol].prevDayVolume = prevDayVolume;
            }
        }
        if (data.type === "Trade") {

            for (const mapped of data.mappedData) {
                const trade: Trade = mapped;
                const { eventSymbol, dayVolume, price, time, tickDirection } = trade;

                this.liveTrades[eventSymbol] = this.liveTrades[eventSymbol] || {};
                trades[eventSymbol] = this.liveTrades[eventSymbol];
                trades[eventSymbol].dayVolume = dayVolume;
                trades[eventSymbol].tradePrice = price;
                trades[eventSymbol].tradeTime = time;
                trades[eventSymbol].tickDirection = tickDirection;
            }
        }

        this.send(dxData);
    }
}


