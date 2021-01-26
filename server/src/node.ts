import { OptionData, optionSymbolToObject, getDxSymbol, OptionSymbol } from "./models/OptionChain";
import TastyWorks from './lib/TastyWorks';
import { DxFeed, Request } from "./lib/dxfeed";
import { MappedData } from "./models/BasePackage";
import { WrappedMetrics, Metrics } from "./models/Metrics";
import { StrictMode } from "react";
import { ActionType } from "./lib/executeOrder";
import { Streamer } from './lib/streamer';
import { OrderStream } from "./models/Order";

var stdin = process.openStdin();
const testExport = async () => {
    // Test code. remove

    const credentials = {
        username: process.env.TASTY_USERNAME,
        password: process.env.TASTY_PASSWORD
    };
    const symbolstr = process.env.TASTY_SYMBOLS;
    const symbols = JSON.parse(symbolstr);
    const symbolObjects: OptionSymbol[] = symbols.map(s => optionSymbolToObject(s));
    const dxsymbols = symbolObjects.map(s => getDxSymbol(s));
    const underlyings = symbolObjects.map(s => s.underlyingSymbol);
    let optionChain: OptionData;


    let bought = false;
    console.log(JSON.stringify(credentials));

    // Set the username and password
    TastyWorks.setUser(credentials);
    const token = await TastyWorks.authorization()
    TastyWorks.setAuthorizationToken(token);

    // Before making any calls, get the session-token via the authorization endpoint
    // Set the authorization in the headers
    console.log('Session is active, continue with other calls.');

    const metrics: Metrics = (await TastyWorks.marketMetrics("SPY")).items[0];
    // console.table(metrics);

    const tasks = underlyings.map(s => TastyWorks.optionChain(s));
    // Hmm...js doesn't have a t.result...
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
    for (let t of symbolTasks) {
        const sym = await t;
        console.log(sym["underlying-symbol"]);
        optionChain = sym;

        console.table(sym.expirations[0].strikes);
    }

    // const chain: OptionData = await TastyWorks.optionChain('TSLA');

    // console.log('======= Option chain =======');
    // console.table(chain);
    // const strikes = chain.expirations[0].strikes;
    // console.table(strikes);
    // const meta = optionSymbolToObject(strikes[9].call);

    // rootSymbol = meta.rootSymbol || meta.underlyingSymbol;
    // rootSymbol = "." + rootSymbol + meta.rawOptionChainType + meta.dateRaw + meta.callOrPut + meta.strikePrice;
    // console.log(rootSymbol);

    // cometd.subscribe({
    //     quote: ["SPY", ".SPCE210129C25"],
    //     profile: ["SPY", ".SPCE210129C25"],
    //     summary: ["SPY", ".SPCE210129C25"],
    //     trade: ["SPY", ".SPCE210129C25"],
    // });

    try {
        const accounts: any[] = await TastyWorks.accounts();
        console.log("Accounts:");
        console.table(accounts);

        const orderStatuses = {};
        const liveQuotes = {};

        const streamer = new Streamer(token);
        streamer.addListener("Order", (pkg: any) => {
            const orderStream = pkg as OrderStream;
            if (!orderStream) debugger;

            let { data } = orderStream;
            if (!data || !data.id || !data.status) debugger;

            orderStatuses[data.id + ''] = data.status;
            console.log("OrderStatus:");
            console.table(orderStatuses);
        });
        await streamer.sendJson({
            action: "account-subscribe",
            value: accounts.map(a => a["account-number"])
        });

        // await streamer.sendJson({
        //     action: "public-watchlists-subscribe",
        // });
        await streamer.sendJson({
            action: "quote-alerts-subscribe",
        });

        console.log('*******************************************************************************************************************');
        console.log('');
        const account = process.env.TASTY_ACCOUNT;

        let liveOrders = await TastyWorks.liveOrders(account);
        console.table(liveOrders);

        const streamerTokenTask = TastyWorks.getStreamerToken();

        const cometd = new DxFeed();
        const streamerToken = await streamerTokenTask;
        cometd.connect(streamerToken);
        cometd.addListener("data", (data: MappedData) => {
            // console.log(data.type);
            // console.table(data.mappedData);
            if (!data.mappedData || !data.mappedData[0]) {
                debugger;
                return;
            }

            if (data.type === "Quote") {

                for (var mapped of data.mappedData) {
                    const { eventSymbol, bidPrice, askPrice } = mapped

                    liveQuotes[eventSymbol] = liveQuotes[eventSymbol] || {};
                    liveQuotes[eventSymbol].bidPrice = bidPrice;
                    liveQuotes[eventSymbol].askPrice = askPrice;
                }

                console.log("Quote");
                console.table(liveQuotes);
            }
            if (data.type === "Trade") {

                for (var mapped of data.mappedData) {
                    const { eventSymbol, dayVolume } = mapped;

                    liveQuotes[eventSymbol] = liveQuotes[eventSymbol] || {};
                    liveQuotes[eventSymbol].dayVolume = dayVolume;
                }

                console.log("Trade");
                console.table(liveQuotes);
            }
        });

        cometd.enqueue(dxsymbols);




        // const orderResponse = await TastyWorks.executeOrder(account, "SPY   210201C00375000", "0.01", 1, ActionType.BTO);
        // console.log("New order: " + orderResponse.order.id);

        // const deleteResponse = await TastyWorks.cancelOrder(account, orderResponse.order.id);
        // console.log("Delete Response");
        // console.table(deleteResponse);

        stdin.on('data', async () => {
            let q = liveQuotes[dxsymbols[0]];
            if (!q || !q.bidPrice || !q.askPrice) debugger;

            // TODO: Properly calc size based on threshold.
            let tickSize = optionChain["tick-sizes"].reduce((p, c) => Math.max(p + 0, Number(c.value)), 0);

            let targetBid = q.bidPrice + tickSize;
            targetBid = targetBid.toFixed(2);

            let delay = 200;

            if (!bought) {
                console.log(`Flash order ${account}, ${symbols[0]}, ${targetBid}`);
                try {
                    let orderResponse = await TastyWorks.executeOrder(account, symbols[0], targetBid, 1, ActionType.BTO);
                    const oid = orderResponse.order.id + '';
                    console.log("New order: " + orderResponse.order.id);

                    if(!oid) return;

                    setTimeout(async () => {
                        const status = orderStatuses[oid];
                        if (!status || status.toUpperCase() != "FILLED") {
                            const deleteResponse = await TastyWorks.cancelOrder(account, orderResponse.order.id);
                            console.log("Delete Response");
                            console.table(deleteResponse);
                        } else {
                            bought = true;
                            sell(account, symbols[0], targetBid);
                        }
                    }, delay);
                } catch (e) {
                    console.error(e);
                    debugger;
                }
            } else {
                console.warn("Already have open")
            }
        });

        const sell = async (account: string, symbol: string, targetBid: number) => {
            let q = liveQuotes[dxsymbols[0]];
            if (!q || !q.bidPrice || !q.askPrice) debugger;

            // TODO: Properly calc size based on threshold.
            let tickSize = optionChain["tick-sizes"].reduce((p, c) => Math.max(p + 0, Number(c.value)), 0);

            let targetAsk: any = q.askPrice - tickSize;
            targetAsk = targetAsk.toFixed(2);

            if (targetBid < targetAsk) {
                console.warn("Ask is less than we bought it for");
                debugger;
            }

            console.log(`Flashing order ${account}, ${symbol}, ${targetAsk}`);
            let orderResponse = await TastyWorks.executeOrder(account, symbol, targetBid, 1, ActionType.STC);
            const oid = orderResponse.order.id + '';
            console.log("Close Order: " + orderResponse.order.id);
            setTimeout(async () => {
                const status = orderStatuses[oid];
                if (!status || status.toUpperCase() != "FILLED") {
                    const deleteResponse = await TastyWorks.cancelOrder(account, orderResponse.order.id);
                    console.log("Did not sell, trying again.");
                    console.table(deleteResponse);

                    sell(account, symbol, targetBid);
                } else {
                    console.log("Successfully sold...");
                    bought = false;
                }
            }, 100);
        }


    } catch (e) {
        console.log(e);
    }
};

let resolv = null;
const promise = new Promise((resolve, reject) => {
    resolv = resolve;
})

console.log('Press any key continue');
const first = () => {
    resolv();
    console.log("Key pressed");
}

stdin.on('data', () => {
    first();
    stdin.removeListener("data", first);
});

promise.then(testExport);

/***
 *  Needed:
 *
 *   Metrics.liquidity - filter 3,4
 *   last price - sub trade on symbols.
 *   max single sub 67. Need queue.
 *   option chain -
 *   all chain symbols, sub to Trade, Quote, Summary
 * Summary
 *   - prevDayVolume, dayhigh, daylow
 *
 * Quote
 *   - bidPrice, askPrice...etc
 *
 * Trade
 *   - dayVolume, price, time, tickDirection, dayTurnover?
 *
 *
 */