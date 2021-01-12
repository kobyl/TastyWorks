import { OptionData } from "./models/OptionChain";
import TastyWorks from './lib';

// Test code. remove

const credentials = {
    username: process.env.TASTY_USERNAME,
    password: process.env.TASTY_PASSWORD
};

console.log(JSON.stringify(credentials));

let TASTY_ACCOUNT_ID;

// Set the username and password
TastyWorks.setUser(credentials);

// Before making any calls, get the session-token via the authorization endpoint
TastyWorks.authorization()
    .then(token => {
        // Set the authorization in the headers
        TastyWorks.setAuthorizationToken(token);
        console.log('Session is active, continue with other calls.');
        return true;
    })
    .then(() => TastyWorks.optionChain('TSLA'))
    .then((chain: OptionData) => {
        console.log('======= Option chain =======');
        console.log(chain)
        console.table(chain.items[0].expirations[0].strikes)
    })
    .then(() => TastyWorks.streamer())
    .then((data) => TastyWorks.cometd(data));

