import { OptionData, optionSymbolToObject } from "./models/OptionChain";
import TastyWorks from './lib/TastyWorks';
import { Cometd }from "./lib/cometd";
import { MappedData } from "./models/BasePackage";

const testExport = async () => {
    // Test code. remove

    const credentials = {
        username: process.env.TASTY_USERNAME,
        password: process.env.TASTY_PASSWORD
    };

    console.log(JSON.stringify(credentials));

    let TASTY_ACCOUNT_ID;

    // Set the username and password
    TastyWorks.setUser(credentials);

    let rootSymbol = null;
    // Before making any calls, get the session-token via the authorization endpoint
    TastyWorks.authorization()
        .then(token => {
            // Set the authorization in the headers
            TastyWorks.setAuthorizationToken(token);
            console.log('Session is active, continue with other calls.');
            return true;
        })
        .then(() => TastyWorks.optionChain('/ES'))
        .then((chain: OptionData) => {
            console.log('======= Option chain =======');
            console.table(chain);
            const strikes = chain.expirations[0].strikes;
            console.table(strikes);
            const meta = optionSymbolToObject(strikes[9].call);

            rootSymbol = meta.rootSymbol || meta.underlyingSymbol;
            rootSymbol = "." + rootSymbol + meta.rawOptionChainType + meta.dateRaw + meta.callOrPut + meta.strikePrice;
            console.log(rootSymbol);
        })
        .then(() => TastyWorks.streamer())
        .then((data) => {
            const cometd = new Cometd();
            cometd.connect(data.token);
            cometd.addListener("data", (data: MappedData) => {
                console.log(data.type);
                console.table(data.mappedData);
            });

            cometd.subscribe({
                quote: ["SPY", ".SPCE210129C25"],
                profile: ["SPY", ".SPCE210129C25"],
                summary: ["SPY", ".SPCE210129C25"],
                trade: ["SPY", ".SPCE210129C25"],
            });
        });
};


let resolv = null;
const promise = new Promise((resolve, reject) => {
    resolv = resolve;
})

var stdin = process.openStdin();
console.log('Press any key continue');
stdin.on('data', () => {
    resolv();
    console.log("Key pressed");
});

promise.then(testExport);