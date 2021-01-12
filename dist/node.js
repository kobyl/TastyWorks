/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/exports.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/exports.ts":
/*!************************!*\
  !*** ./src/exports.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const lib_1 = __webpack_require__(/*! ./lib */ "./src/lib/index.ts"); // Test code. remove


const credentials = {
  username: process.env.TASTY_USERNAME,
  password: process.env.TASTY_PASSWORD
};
console.log(JSON.stringify(credentials));
let TASTY_ACCOUNT_ID; // Set the username and password

lib_1.default.setUser(credentials); // Before making any calls, get the session-token via the authorization endpoint

lib_1.default.authorization().then(token => {
  // Set the authorization in the headers
  lib_1.default.setAuthorizationToken(token);
  console.log('Session is active, continue with other calls.');
  return true;
}).then(() => lib_1.default.optionChain('TSLA')).then(chain => {
  console.log('======= Option chain =======');
  console.log(chain);
  console.table(chain.items[0].expirations[0].strikes);
}).then(() => lib_1.default.streamer()).then(data => lib_1.default.cometd(data));

/***/ }),

/***/ "./src/lib/accounts.js":
/*!*****************************!*\
  !*** ./src/lib/accounts.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get Accounts
 * @param {object} headers
 * @return {object} array of accounts
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers) => {
    const endpoint = endpoints['accounts']();
    return request
        .get(`${endpoint}`)
        .set(headers)
        .then(res => {
            const {
                body: {
                    data: {
                        items
                    }
                }
            } = res;

            const accounts = items.map(data => {
                const {
                    account
                } = data;

                return account;
            });

            return accounts;
        });
}


/***/ }),

/***/ "./src/lib/authorization.js":
/*!**********************************!*\
  !*** ./src/lib/authorization.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get Authorization Token
 * @param {string} username
 * @param {string} passworde
 * @return {string} session token
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (username, password, headers) => {
    const endpoint = endpoints['login']();
    return request
        .post(`${endpoint}`)
        .set(headers)
        .send({
            login: username,
            password: password
        })
        .then(res => {
            const {
                body: {
                    data
                }
            } = res;
            return data['session-token'];
        });
}


/***/ }),

/***/ "./src/lib/balances.js":
/*!*****************************!*\
  !*** ./src/lib/balances.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get Account Balances
 * @param {object} headers
 * @param {string} accountId
 * @return {object} account balances
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers, account_id) => {
    const endpoint = endpoints['balances'](account_id);
    return request
        .get(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            const {
                body: {
                    data
                }
            } = res;

            return data;
        });
}


/***/ }),

/***/ "./src/lib/cancelOrder.js":
/*!********************************!*\
  !*** ./src/lib/cancelOrder.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Execute Order
 * @param {object} headers
 * @param {string} accountId
 * @param {string} orderId
 * @return {object} data
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers, account_id, order_id) => {
    const endpoint = endpoints['cancelOrder'](account_id,order_id);
    return request
        .delete(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            const {
                body: {
                    data
                }
            } = res;

            return data;
        });
}


/***/ }),

/***/ "./src/lib/cometd.js":
/*!***************************!*\
  !*** ./src/lib/cometd.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(/*! cometd-nodejs-client */ "cometd-nodejs-client").adapt();
const lib = __webpack_require__(/*! cometd */ "cometd");

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

const subscribe = function(message) {

}

const publish = function (service, message) {
    debug("Publishing to " + service + ": " + JSON.stringify(message));
    cometd.publish("/service/" + service, message);
};

// https://api.tastyworks.com/quote-streamer-tokens

/**
 * Connect to cometd
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

module.exports = (headers, data) => {
    console.log(data);
    console.log("Starting cometd");
    let config = {};
    const cometd = new lib.CometD();
    // cometd.unregisterTransports();

    // Registration order is important.
    // cometd.registerTransport('websocket', new cometd.WebSocketTransport());
    // cometd.registerTransport('long-polling', new LongPollingTransport(cometd));
    // cometd.registerTransport('callback-polling', new CallbackPollingTransport(cometd));

    console.table(headers['Authorization']);

    const printData = pkg => {
        
        
    };

    cometd.addListener("/meta/handshake", console.table);
    cometd.addListener("/meta/connect", console.table);
    cometd.addListener("/meta/unsuccessful", console.table);
    cometd.addListener("/service/state", console.table);
    cometd.addListener("/service/data", console.table);
    cometd.addListener("/service/timeSeriesData", console.table);

    config.url = 'wss://tasty.dxfeed.com/live/cometd';
    cometd.configure(config);
    cometd.handshake({ ext: { "com.devexperts.auth.AuthToken": data.token } });

    cometd.publish("/service/sub", {"reset":true,"add":{"Trade":["SPY"],"Quote":["SPY"],"Summary":["SPY"],"Profile":["SPY"]}});

    console.log("Call complete");
}


/***/ }),

/***/ "./src/lib/executeOrder.js":
/*!*********************************!*\
  !*** ./src/lib/executeOrder.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Execute Order
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers, account_id, symbol, price, quantity) => {
    const endpoint = endpoints['executeOrder'](account_id);
    return request
        .post(`${endpoint}`)
        .set(headers)
        .send({
            "source": "WBT",
            "order-type": "Limit",
            "price": price,
            "price-effect": "Debit",
            "time-in-force": "Day",
            "legs": [{"instrument-type": "Equity Option",
                     "symbol": symbol,
                     "quantity": quantity,
                     "action": "Buy to Open"}]
        })
        .then(res => {
            const {
                body: {
                    data: {
                        order
                    }
                }
            } = res;

            return order;
        });
}


/***/ }),

/***/ "./src/lib/history.js":
/*!****************************!*\
  !*** ./src/lib/history.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get Account History
 * @param {object} headers
 * @param {string} account_id
 * @param {date} start_date (yyyy-mm-dd)
 * @param {date} end_date (yyyy-mm-dd)
 * @return {object} account history
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

const doRequest = (headers, endpoint, start_date, end_date, pageOffset) => {
  return request
    .get(`${endpoint}`)
    .query({
      'start-date': `${start_date}T07:00:00.000Z`
    })
    .query({
      'end-date': `${end_date}T07:00:00.000Z`
    })
    .query({
      'page-offset': pageOffset
    })
    .set(headers)
    .send()
    .then(res => {
      const {
        body: {
          pagination,
          data: {
            items
          }
        }
      } = res;
      return { items, pagination };
    });
}

module.exports = async (headers, account_id, start_date, end_date) => {
  const endpoint = endpoints['history'](account_id);
  const items = [];
  let currentPage = -1;
  let keepGoing = true;
  while (keepGoing) { 
    const r = await doRequest(headers, endpoint, start_date, end_date, ++currentPage);

    if(r && !!r.message && r.status !=200){
      keepGoing = false;
    } else {
      items.push.apply(items, r.items);
      keepGoing = currentPage < r.pagination['total-pages'] - 1;
    }
  }
  return items;
}


/***/ }),

/***/ "./src/lib/index.ts":
/*!**************************!*\
  !*** ./src/lib/index.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const _authorization = __webpack_require__(/*! ./authorization */ "./src/lib/authorization.js");

const _accounts = __webpack_require__(/*! ./accounts */ "./src/lib/accounts.js");

const _balances = __webpack_require__(/*! ./balances */ "./src/lib/balances.js");

const _positions = __webpack_require__(/*! ./positions */ "./src/lib/positions.js");

const _liveOrders = __webpack_require__(/*! ./liveOrders */ "./src/lib/liveOrders.js");

const _executeOrder = __webpack_require__(/*! ./executeOrder */ "./src/lib/executeOrder.js");

const _cancelOrder = __webpack_require__(/*! ./cancelOrder */ "./src/lib/cancelOrder.js");

const _marketMetrics = __webpack_require__(/*! ./marketMetrics */ "./src/lib/marketMetrics.js");

const _history = __webpack_require__(/*! ./history */ "./src/lib/history.js");

const _streamer = __webpack_require__(/*! ./streamer */ "./src/lib/streamer.js");

const _cometd = __webpack_require__(/*! ./cometd */ "./src/lib/cometd.js");

const _optionChain = __webpack_require__(/*! ./optionChain */ "./src/lib/optionChain.js");

let _headers = __webpack_require__(/*! ../util/defaultHeaders */ "./src/util/defaultHeaders.js");

let _user = {
  username: null,
  password: null,
  authorization_token: null,
  accounts: []
};
const TastyWorks = {
  setUser: user => {
    _user = Object.assign(Object.assign({}, _user), user);
  },
  getUser: () => _user,
  setAuthorizationToken: authorization_token => _headers['Authorization'] = authorization_token,
  getHeaders: () => _headers,
  authorization: () => _authorization(_user.username, _user.password, _headers),
  accounts: () => _accounts(_headers),
  balances: account_id => _balances(_headers, account_id),
  positions: account_id => _positions(_headers, account_id),
  marketMetrics: (account_id, tickers) => _marketMetrics(_headers, account_id, tickers),
  optionChain: (account_id, ticker) => _optionChain(_headers, account_id, ticker),
  liveOrders: account_id => _liveOrders(_headers, account_id),
  executeOrder: (account_id, symbol, price, quantity) => _executeOrder(_headers, account_id, symbol, price, quantity),
  cancelOrder: (account_id, order_id) => _cancelOrder(_headers, account_id, order_id),
  streamer: () => _streamer(_headers),
  cometd: data => _cometd(_headers, data),
  history: (account_id, start_date, end_date) => _history(_headers, account_id, start_date, end_date)
};
exports.default = TastyWorks;

/***/ }),

/***/ "./src/lib/liveOrders.js":
/*!*******************************!*\
  !*** ./src/lib/liveOrders.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get Account Orders
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers, account_id) => {
    const endpoint = endpoints['liveOrders'](account_id);
    return request
        .get(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            const {
                body: {
                    data: {
                        items
                    }
                }
            } = res;

            return items;
        });
}


/***/ }),

/***/ "./src/lib/marketMetrics.js":
/*!**********************************!*\
  !*** ./src/lib/marketMetrics.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get market metrics
 * @param {object} headers
 * @param {object} array of tickers
 * @return {object} array of metrics
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers, tickers) => {
    const endpoint = endpoints['marketMetrics'](tickers);
    return request
        .get(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            const {
                body: {
                    data
                }
            } = res;

            return data;
        });
}


/***/ }),

/***/ "./src/lib/optionChain.js":
/*!********************************!*\
  !*** ./src/lib/optionChain.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get market metrics
 * @param {object} headers
 * @param {string} ticker
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers, ticker) => {
    const endpoint = endpoints['optionChain'](ticker);
    return request
        .get(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            const {
                body: {
                    data
                }
            } = res;

            return data;
        });
}


/***/ }),

/***/ "./src/lib/positions.js":
/*!******************************!*\
  !*** ./src/lib/positions.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get Account Positions
 * @param {object} headers
 * @param {string} accountId
 * @return {object} account positions
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers, account_id) => {
    const endpoint = endpoints['positions'](account_id);
    return request
        .get(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            const {
                body: {
                    data
                }
            } = res;

            return data;
        });
}


/***/ }),

/***/ "./src/lib/streamer.js":
/*!*****************************!*\
  !*** ./src/lib/streamer.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get Account Orders
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const request = __webpack_require__(/*! superagent */ "superagent");
const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

module.exports = (headers) => {
    const endpoint = endpoints['streamer']();
    return request
        .get(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            const {
                body: {
                    data
                }
            } = res;

            return data;
        });
}


/***/ }),

/***/ "./src/util/defaultHeaders.js":
/*!************************************!*\
  !*** ./src/util/defaultHeaders.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
    'Accept-Version': 'v1',
    'Authorization': null,
    'Connection': 'keep-alive',
    'Host': 'api.tastyworks.com',
    'Origin': 'https://trade.tastyworks.com',
    'Referer': 'https://trade.tastyworks.com/tw'
}


/***/ }),

/***/ "./src/util/endpoints.js":
/*!*******************************!*\
  !*** ./src/util/endpoints.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

const baseURL = 'https://api.tastyworks.com';
//trade.dough.com

module.exports = {
    login: () => `${baseURL}/sessions`,
    validateLogin: () => `${baseURL}/sessions/validate`,
    accounts: () => `${baseURL}/customers/me/accounts`,
    balances: (account_id) => `${baseURL}/accounts/${account_id}/balances`,
    positions: (account_id) => `${baseURL}/accounts/${account_id}/positions`,
    liveOrders: (account_id) => `${baseURL}/accounts/${account_id}/orders/live`,
    executeOrder: (account_id) => `${baseURL}/accounts/${account_id}/orders`,
    cancelOrder: (account_id, order_id) => `${baseURL}/accounts/${account_id}/orders/${order_id}`,
    streamer: () => `${baseURL}/quote-streamer-tokens`,
  	optionChain: (ticker) => `${baseURL}/option-chains/${ticker}/nested`,
    history: (account_id) => `${baseURL}/accounts/${account_id}/transactions`,
    marketMetrics: (tickers) => `${baseURL}/market-metrics?symbols=${tickers}`
    // TODO: '{url}/dry-run'
}


/***/ }),

/***/ "cometd":
/*!*************************!*\
  !*** external "cometd" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cometd");

/***/ }),

/***/ "cometd-nodejs-client":
/*!***************************************!*\
  !*** external "cometd-nodejs-client" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cometd-nodejs-client");

/***/ }),

/***/ "superagent":
/*!*****************************!*\
  !*** external "superagent" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("superagent");

/***/ })

/******/ });
//# sourceMappingURL=node.js.map