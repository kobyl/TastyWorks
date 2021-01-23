'use strict';

import _authorization from './authorization';
import _accounts from './accounts';
import _balances from './balances';
import _positions from './positions';
import _liveOrders from './liveOrders';
import _executeOrder, { ActionType } from './executeOrder';
import _cancelOrder from './cancelOrder';
import _marketMetrics from './marketMetrics';
import _history from './history';
import _streamer from './streamerToken';
import _optionChain from './optionChain';
import { OptionData } from '../models/OptionChain';
import { OrderResponse } from '../models/Order';
import { CancelOrderResponse } from '../models/CancelOrder';

let _headers = require('../util/defaultHeaders');

export class TastyWorks {
    _user: {
        username: null,
        password: null,
        authorization_token: null,
        accounts: []
    };


    setUser = (user) => {
        this._user = {
            ...this._user,
            ...user
        };
    }

    getUser = () => this._user;
    setAuthorizationToken = (authorization_token) => _headers['Authorization'] = authorization_token;
    getHeaders = () => _headers;

    authorization = () => _authorization(this._user.username, this._user.password, _headers);
    accounts = () => _accounts(_headers);
    balances = (account_id) => _balances(_headers, account_id);
    positions = (account_id) => _positions(_headers, account_id);
    marketMetrics = (tickers) => _marketMetrics(_headers, tickers);
    optionChain: (t: string) => Promise<OptionData> = (ticker) => _optionChain(_headers, ticker);
    liveOrders = (account_id) => _liveOrders(_headers, account_id);
    executeOrder: (account_id, symbol, price, quantity, action: ActionType, dryRun?: boolean) => OrderResponse = (account_id, symbol, price, quantity, action, dry: boolean = false) => _executeOrder(_headers, account_id, symbol, price, quantity, action, dry);
    cancelOrder: (acc, oid) => CancelOrderResponse = (account_id, order_id) => _cancelOrder(_headers, account_id, order_id);
    getStreamerToken = () => _streamer(_headers);
    history = (account_id, start_date, end_date) => _history(_headers, account_id, start_date, end_date);
}

const tasty = new TastyWorks();
export default tasty;