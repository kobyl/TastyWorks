'use strict';

/**
 * Execute Order
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const request = require('superagent');
const endpoints = require('../util/endpoints');

export enum ActionType {
    BTO = "Buy to Open",
    BTC = "Buy to Close",

    STO = "Sell to Open",
    STC = "Sell to Close",
};

export default (headers, account_id, symbol, price, quantity, action: ActionType, dryRun = false) => {
    let endpoint = endpoints['executeOrder'](account_id);
    if(dryRun) 
        endpoint = endpoint + "/dry-run";

    const effect = action === ActionType.BTO || action === ActionType.BTC
        ? "Debit"
        : "Credit";

    const json = {
        "source": "WBT-ember;production-2020-10-15-0",
        "order-type": "Limit",
        "price": price,
        "price-effect": effect,
        "time-in-force": "Day",
        "legs": [{
            "instrument-type": "Equity Option",
            "symbol": symbol,
            "quantity": quantity,
            "action": action
        }]
    };

    console.table(json);

    return request
        .post(`${endpoint}`)
        .set(headers)
        .send(json)
        .then(res => {
            return res.body.data;
        });
}
