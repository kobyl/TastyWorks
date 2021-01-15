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


var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const OptionChain_1 = __webpack_require__(/*! ./models/OptionChain */ "./src/models/OptionChain.ts");

const TastyWorks_1 = __webpack_require__(/*! ./lib/TastyWorks */ "./src/lib/TastyWorks.ts");

const cometd_1 = __webpack_require__(/*! ./lib/cometd */ "./src/lib/cometd.ts");

const testExport = () => __awaiter(void 0, void 0, void 0, function* () {
  // Test code. remove
  const credentials = {
    username: process.env.TASTY_USERNAME,
    password: process.env.TASTY_PASSWORD
  };
  console.log(JSON.stringify(credentials));
  let TASTY_ACCOUNT_ID; // Set the username and password

  TastyWorks_1.default.setUser(credentials);
  let rootSymbol = null; // Before making any calls, get the session-token via the authorization endpoint

  TastyWorks_1.default.authorization().then(token => {
    // Set the authorization in the headers
    TastyWorks_1.default.setAuthorizationToken(token);
    console.log('Session is active, continue with other calls.');
    return true;
  }).then(() => TastyWorks_1.default.optionChain('/ES')).then(chain => {
    console.log('======= Option chain =======');
    console.table(chain);
    const strikes = chain.expirations[0].strikes;
    console.table(strikes);
    const meta = OptionChain_1.optionSymbolToObject(strikes[9].call);
    rootSymbol = meta.rootSymbol || meta.underlyingSymbol;
    rootSymbol = "." + rootSymbol + meta.rawOptionChainType + meta.dateRaw + meta.callOrPut + meta.strikePrice;
    console.log(rootSymbol);
  }).then(() => TastyWorks_1.default.streamer()).then(data => {
    const cometd = new cometd_1.Cometd();
    cometd.connect(data.token);
    cometd.addListener("data", data => {
      console.log(data.type);
      console.table(data.mappedData);
    });
    cometd.subscribe({
      quote: ["SPY", ".SPCE210129C25"],
      profile: ["SPY", ".SPCE210129C25"],
      summary: ["SPY", ".SPCE210129C25"],
      trade: ["SPY", ".SPCE210129C25"]
    });
  });
});

let resolv = null;
const promise = new Promise((resolve, reject) => {
  resolv = resolve;
});
var stdin = process.openStdin();
console.log('Press any key continue');
stdin.on('data', () => {
  resolv();
  console.log("Key pressed");
});
promise.then(testExport);

/***/ }),

/***/ "./src/lib/TastyWorks.ts":
/*!*******************************!*\
  !*** ./src/lib/TastyWorks.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const authorization_1 = __webpack_require__(/*! ./authorization */ "./src/lib/authorization.ts");

const accounts_1 = __webpack_require__(/*! ./accounts */ "./src/lib/accounts.js");

const balances_1 = __webpack_require__(/*! ./balances */ "./src/lib/balances.js");

const positions_1 = __webpack_require__(/*! ./positions */ "./src/lib/positions.js");

const liveOrders_1 = __webpack_require__(/*! ./liveOrders */ "./src/lib/liveOrders.js");

const executeOrder_1 = __webpack_require__(/*! ./executeOrder */ "./src/lib/executeOrder.js");

const cancelOrder_1 = __webpack_require__(/*! ./cancelOrder */ "./src/lib/cancelOrder.js");

const marketMetrics_1 = __webpack_require__(/*! ./marketMetrics */ "./src/lib/marketMetrics.js");

const history_1 = __webpack_require__(/*! ./history */ "./src/lib/history.js");

const streamer_1 = __webpack_require__(/*! ./streamer */ "./src/lib/streamer.ts");

const optionChain_1 = __webpack_require__(/*! ./optionChain */ "./src/lib/optionChain.ts");

let _headers = __webpack_require__(/*! ../util/defaultHeaders */ "./src/util/defaultHeaders.js");

class TastyWorks {
  constructor() {
    this.setUser = user => {
      this._user = Object.assign(Object.assign({}, this._user), user);
    };

    this.getUser = () => this._user;

    this.setAuthorizationToken = authorization_token => _headers['Authorization'] = authorization_token;

    this.getHeaders = () => _headers;

    this.authorization = () => authorization_1.default(this._user.username, this._user.password, _headers);

    this.accounts = () => accounts_1.default(_headers);

    this.balances = account_id => balances_1.default(_headers, account_id);

    this.positions = account_id => positions_1.default(_headers, account_id);

    this.marketMetrics = (account_id, tickers) => marketMetrics_1.default(_headers, account_id, tickers);

    this.optionChain = ticker => optionChain_1.default(_headers, ticker);

    this.liveOrders = account_id => liveOrders_1.default(_headers, account_id);

    this.executeOrder = (account_id, symbol, price, quantity) => executeOrder_1.default(_headers, account_id, symbol, price, quantity);

    this.cancelOrder = (account_id, order_id) => cancelOrder_1.default(_headers, account_id, order_id);

    this.streamer = () => streamer_1.default(_headers);

    this.history = (account_id, start_date, end_date) => history_1.default(_headers, account_id, start_date, end_date);
  }

}

const tasty = new TastyWorks();
exports.default = tasty;

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

/***/ "./src/lib/authorization.ts":
/*!**********************************!*\
  !*** ./src/lib/authorization.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Get Authorization Token
 * @param {string} username
 * @param {string} passworde
 * @return {string} session token
 */

const request = __webpack_require__(/*! superagent */ "superagent");

const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

const authorize = (username, password, headers) => {
  const endpoint = endpoints['login']();
  return request.post(`${endpoint}`).set(headers).send({
    login: username,
    password: password
  }).then(res => {
    const {
      body: {
        data
      }
    } = res;
    return data['session-token'];
  });
};

exports.default = authorize;

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

/***/ "./src/lib/cometd.ts":
/*!***************************!*\
  !*** ./src/lib/cometd.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cometd = exports.Request = void 0;

const BasePackage_1 = __webpack_require__(/*! ../models/BasePackage */ "./src/models/BasePackage.ts");

const Comet = __webpack_require__(/*! cometd */ "cometd");

__webpack_require__(/*! cometd-nodejs-client */ "cometd-nodejs-client").adapt(); // Function that manages the connection status with the Bayeux server


function onMetaHandshake(message) {// if (cometd === null || cometd.isDisconnected()) {
  //     updateConnectedState(false);
  //     return;
  // }
  // if (!message.successful) {
  //     info("Authentication failed or no token provided");
  // }
  // updateConnectedState(message.successful === true);
} // Function that manages the connection status with the Bayeux server


function onMetaConnect(message) {// if (cometd === null || cometd.isDisconnected()) {
  //     updateConnectedState(false);
  //     return;
  // }
  // updateConnectedState(message.successful === true);
}

function onMetaUnsuccessful() {// updateConnectedState(false)
}

function onServiceState(message) {// debug("Received state " + JSON.stringify(message));
  // endpointImpl.onStateChange(message.data);
}

function onServiceData(message) {// debug("Received data " + JSON.stringify(message));
  // endpointImpl.onData(message.data, false);
}

function onServiceTimeSeriesData(message) {// debug("Received time series data " + JSON.stringify(message));
  // endpointImpl.onData(message.data, true);
} // https://api.tastyworks.com/quote-streamer-tokens


class Request {}

exports.Request = Request;

Request.makeRequest = function (request) {
  const output = {};

  for (let key of ["trade", "quote", "summary", "profile"]) {
    if (request[key]) {
      const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
      output[upperKey] = request[key];
    }
  }

  return output;
};

class Cometd {
  constructor() {
    this.dataListeners = {};

    this.addListener = (key, callback) => {
      this.dataListeners[key] = callback;
    };

    this.subscribe = request => {
      this.cometd.publish("/service/sub", {
        "reset": true,
        "add": Request.makeRequest(request)
      });
    };

    this.connect = token => {
      console.log("Starting cometd");
      this.cometd = new Comet.CometD(); // cometd.unregisterTransports();
      // Registration order is important.
      // cometd.registerTransport('websocket', new cometd.WebSocketTransport());
      // cometd.registerTransport('long-polling', new LongPollingTransport(cometd));
      // cometd.registerTransport('callback-polling', new CallbackPollingTransport(cometd));

      const processData = pkg => {
        const data = BasePackage_1.mapdata(pkg);

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
        url: 'wss://tasty.dxfeed.com/live/cometd'
      };
      this.cometd.configure(config);
      this.cometd.handshake({
        ext: {
          "com.devexperts.auth.AuthToken": token
        }
      });
      console.log("Call complete");
    };
  }

}

exports.Cometd = Cometd;
/**
 * Connect to cometd
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const cometd = (headers, data, strike) => {
  console.log(data);
  console.log("Starting cometd");
  const cometd = new Comet.CometD(); // cometd.unregisterTransports();
  // Registration order is important.
  // cometd.registerTransport('websocket', new cometd.WebSocketTransport());
  // cometd.registerTransport('long-polling', new LongPollingTransport(cometd));
  // cometd.registerTransport('callback-polling', new CallbackPollingTransport(cometd));

  console.table(headers['Authorization']);

  const processData = pkg => {
    const data = BasePackage_1.mapdata(pkg);
    console.log("Type:" + data.type);
    console.table(data.mappedData);
  };

  cometd.addListener("/meta/handshake", console.table);
  cometd.addListener("/meta/connect", console.table);
  cometd.addListener("/meta/unsuccessful", console.table);
  cometd.addListener("/service/state", console.table);
  cometd.addListener("/service/data", processData);
  cometd.addListener("/service/timeSeriesData", console.table);
  let config = {
    url: 'wss://tasty.dxfeed.com/live/cometd'
  };
  cometd.configure(config);
  cometd.handshake({
    ext: {
      "com.devexperts.auth.AuthToken": data.token
    }
  });
  console.log("Call complete");
};

exports.default = Cometd;

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

/***/ "./src/lib/optionChain.ts":
/*!********************************!*\
  !*** ./src/lib/optionChain.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Get market metrics
 * @param {object} headers
 * @param {string} ticker
 */

const request = __webpack_require__(/*! superagent */ "superagent");

const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

const optionChain = (headers, ticker) => __awaiter(void 0, void 0, void 0, function* () {
  const endpoint = endpoints['optionChain'](ticker);
  return yield request.get(`${endpoint}`).set(headers).send().then(res => {
    const {
      body: {
        data
      }
    } = res;
    return data.items[0];
  });
});

exports.default = optionChain;

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

/***/ "./src/lib/streamer.ts":
/*!*****************************!*\
  !*** ./src/lib/streamer.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Get Account Orders
 * @param {object} headers
 * @param {string} accountId
 * @return {object} orders
 */

const request = __webpack_require__(/*! superagent */ "superagent");

const endpoints = __webpack_require__(/*! ../util/endpoints */ "./src/util/endpoints.js");

exports.default = headers => {
  const endpoint = endpoints['streamer']();
  return request.get(`${endpoint}`).set(headers).send().then(res => {
    const {
      body: {
        data
      }
    } = res;
    return data;
  });
};

/***/ }),

/***/ "./src/models/BasePackage.ts":
/*!***********************************!*\
  !*** ./src/models/BasePackage.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapdata = exports.Schema = void 0;

const Assert_1 = __webpack_require__(/*! ../util/Assert */ "./src/util/Assert.ts");

const util_1 = __webpack_require__(/*! util */ "util");

const Tickers_1 = __webpack_require__(/*! ./Tickers */ "./src/models/Tickers.ts");

exports.Schema = {};

exports.mapdata = base => {
  const data = base.data;
  Assert_1.Assert(util_1.isArray(data) && data.length === 2, "Expecting data to be an array of len 2", data);
  let type = data[0];
  let values = data[1]; // The first message contains the schema of the data package.

  if (typeof type !== 'string') {
    const schema = type[1];
    Tickers_1.validateSchema(type[0], schema);
    type = type[0]; // type will always be a string now.

    exports.Schema[type] = schema;
  }

  const schema = exports.Schema[type];
  const schemaLen = schema.length;
  const mappedData = [];
  let currData = {};
  mappedData.push(currData);
  currData[schema[0]] = values[0]; // The data is just sent in serial. We can loop through and just map to the incoming type.

  for (let i = 1; i < values.length; ++i) {
    const currIndex = i % schemaLen;

    if (currIndex === 0) {
      currData = {};
      mappedData.push(currData);
    }

    currData[schema[currIndex]] = values[i];
  }

  return {
    type,
    mappedData
  };
};

/***/ }),

/***/ "./src/models/OptionChain.ts":
/*!***********************************!*\
  !*** ./src/models/OptionChain.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.optionSymbolToObject = exports.SettlementType = exports.ExpirationType = void 0; // Generated by https://quicktype.io

const moment = __webpack_require__(/*! moment-timezone */ "moment-timezone");

var ExpirationType;

(function (ExpirationType) {
  ExpirationType["Regular"] = "Regular";
  ExpirationType["Weekly"] = "Weekly";
})(ExpirationType = exports.ExpirationType || (exports.ExpirationType = {}));

var SettlementType;

(function (SettlementType) {
  SettlementType["Pm"] = "PM";
})(SettlementType = exports.SettlementType || (exports.SettlementType = {}));

const PATTERNS = {
  OCC_SYMBOL_PATTERN: /^([A-Z]{1,5})(\d?)([ ]{0,5})(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/,
  OPTION_SYMBOL_PATTERN_OLD: /^([A-Z]+)(\d?)(\d{2})(\d{2})(\d{2})(\w)(.+)$/,
  OPTION_SYMBOL_PATTERN_NEW: /^([A-Z]+)(\d?)_(\d{2})(\d{2})(\d{2})(\w)(.+)$/,
  DX_OPTION_SYMBOL_PATTERN: /^\.([A-Z]+)(\d?)(\d{2})(\d{2})(\d{2})(\w)(.+)$/,
  DX_FUTURES_OPTION_SYMBOL_PATTERN: /^(\/[A-Z0-9]+)()_(\d{2})(\d{2})(\d{2})(\w)(.+)$/,
  TW_TWO_DIGIT_YEAR_FUTURES_OPTION_SYMBOL_PATTERN: /^\.\/([A-Z0-9]{2,4})([A-Z])([0-9]{2})[ ]([A-Z0-9]{2,4})([A-Z])([0-9]{2})[ ](\d{2})(\d{2})(\d{2})([CP])(\S+)$/,
  TW_ONE_DIGIT_YEAR_FUTURES_OPTION_SYMBOL_PATTERN: /^\.\/([A-Z0-9]{2,3})([A-Z])([0-9])[ ]{0,1}([A-Z0-9]{2,3})([A-Z])([0-9])[ ]{0,2}(\d{2})(\d{2})(\d{2})([CP])(\S+)$/
};
const EXPIRATION_OFFSETS = {
  SPX: {
    standard: -1,
    weekly: 0,
    quarterly: 0
  },
  SPXPM: {
    standard: 0
  },
  NDX: {
    standard: -1,
    weekly: -1
  },
  VIX: {
    standard: -1
  },
  VIXW: {
    standard: -1
  },
  RUT: {
    standard: -1,
    weekly: -1
  },
  DJX: {
    standard: -1,
    weekly: -1
  },
  MNX: {
    standard: -1,
    weekly: -1
  }
};
const TradeUtils = {
  OPEN_HOUR: 9.5,
  NEW_YORK_TZ: 'America/New_York',
  CLOSE_HOUR: 16,
  DEFAULT_OPTION_MULTIPLIER: 100,
  openingTimeForDateStrings: function (year, month, day) {
    return this.tradeTimeForDateStrings(year, month, day, TradeUtils.OPEN_HOUR);
  },
  tradeTimeForDateStrings: function (year, month, day, hour) {
    return TradeUtils._adjustDateTimeForHour(moment.tz(year + month + day, 'YYMMDD', TradeUtils.NEW_YORK_TZ), hour);
  },
  _adjustDateTimeForHour: function (datetime, hour) {
    var wholeHours, wholeMinutes;
    wholeHours = Math.floor(hour);
    wholeMinutes = hour % 1 * 60;
    return datetime.hour(wholeHours).minutes(wholeMinutes).seconds(0).milliseconds(0);
  },
  closingTimeForDateStrings: function (year, month, day) {
    return this.tradeTimeForDateStrings(year, month, day, TradeUtils.CLOSE_HOUR);
  }
};

const isAmSettled = function (rootSymbol) {
  var offset;
  offset = EXPIRATION_OFFSETS[rootSymbol];
  return offset && offset['standard'] < 0;
};

const STANDARD = 'standard';
const MINI_FLAGS = ['7', '8', '9'];

const __indexOf = [].indexOf || function (item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) return i;
  }

  return -1;
};

const MARKET_HOLIDAYS = {
  "2014-07-04": "Independence Day 2014",
  "2015-03-29": "Good Friday 2015",
  "2015-07-03": "Independence Day 2015",
  "2015-12-25": "Christmas Day 2015",
  "2016-01-01": "New Years Day 2016",
  "2016-03-25": "Good Friday 2016",
  "2017-04-14": "Good Friday 2017",
  "2018-03-30": "Good Friday 2018"
};
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const getExpirationDateAdjustedForHolidays = function (expirationDate) {
  var date;
  date = expirationDate.format('YYYY-MM-DD');

  if (MARKET_HOLIDAYS[date] || expirationDate.day() === 6) {
    expirationDate = expirationDate.clone();
    expirationDate.subtract(1, 'days');
  }

  return expirationDate;
};

const getDaysToExpirationWithType = function (expirationDate, _arg) {
  var adjustedExpirationDate, days, daysFraction, daysToExpiration, diff, settlementType, startDate, symbol;
  startDate = _arg.startDate, symbol = _arg.symbol, settlementType = _arg.settlementType;

  if (startDate == null) {
    startDate = new Date();
  }

  adjustedExpirationDate = getExpirationDateAdjustedForHolidays(expirationDate);
  daysFraction = (adjustedExpirationDate - startDate) / DAY;

  if (daysFraction < 0) {
    return NaN;
  }

  days = Math.floor(daysFraction);
  diff = daysFraction - days;
  daysToExpiration = diff > 0.6 ? days + 1 : days;

  if (settlementType === 'AM') {
    if (daysToExpiration < 1) {
      return 0;
    }

    return daysToExpiration - 1;
  }

  return daysToExpiration;
};

exports.optionSymbolToObject = function (symbol) {
  var callOrPut, dateRaw, day, daysToExpiration, e, expirationDate, expirationKey, futureOptionRootSymbol, miniFlag, month, multiplier, nonStandard, optionChainType, rawOptionChainType, realTradingSymbol, res, rootSymbol, settlementType, strikePrice, strikePriceRaw, underlyingSymbol, year;

  try {
    futureOptionRootSymbol = null;

    if (res = symbol.match(PATTERNS.OCC_SYMBOL_PATTERN)) {
      year = res[4];
      month = res[5];
      day = res[6];
      callOrPut = res[7];
      strikePriceRaw = res[8];
      strikePrice = parseFloat(strikePriceRaw) / 1000.0;
      realTradingSymbol = symbol;
    } else if (symbol.indexOf('./') === 0 && symbol.length > 20) {
      if (res = symbol.match(PATTERNS.TW_TWO_DIGIT_YEAR_FUTURES_OPTION_SYMBOL_PATTERN)) {
        underlyingSymbol = '/' + res[1] + res[2] + res[3];
        futureOptionRootSymbol = res[4] + res[5] + res[6];
        year = res[7];
        month = res[8];
        day = res[9];
        callOrPut = res[10];
        strikePriceRaw = res[11];
        strikePrice = parseFloat(strikePriceRaw);
        realTradingSymbol = symbol;
        rootSymbol = underlyingSymbol + ' ' + futureOptionRootSymbol + ' ';
      } else if (res = symbol.match(PATTERNS.TW_ONE_DIGIT_YEAR_FUTURES_OPTION_SYMBOL_PATTERN)) {
        underlyingSymbol = '/' + res[1] + res[2] + res[3];
        futureOptionRootSymbol = res[4] + res[5] + res[6];
        year = res[7];
        month = res[8];
        day = res[9];
        callOrPut = res[10];
        strikePriceRaw = res[11];
        strikePrice = parseFloat(strikePriceRaw);
        realTradingSymbol = symbol;
        rootSymbol = symbol.substring(0, 13);
      } else {
        throw new Error('Invalid future option symbol');
      }
    } else if (symbol.indexOf('/') === 0) {
      res = symbol.match(PATTERNS.DX_FUTURES_OPTION_SYMBOL_PATTERN);
      month = res[3];
      day = res[4];
      year = res[5];
      callOrPut = res[6];
      strikePriceRaw = res[7];
      strikePrice = parseFloat(strikePriceRaw);
      realTradingSymbol = symbol;
    } else if (symbol.indexOf('_') > -1) {
      res = symbol.match(PATTERNS.OPTION_SYMBOL_PATTERN_NEW);
      month = res[3];
      day = res[4];
      year = res[5];
      callOrPut = res[6];
      strikePriceRaw = res[7];
      strikePrice = parseFloat(strikePriceRaw);
      realTradingSymbol = symbol;
    } else if (symbol[0] === '.') {
      res = symbol.match(PATTERNS.DX_OPTION_SYMBOL_PATTERN);
      year = res[3];
      month = res[4];
      day = res[5];
      callOrPut = res[6];
      strikePriceRaw = res[7];
      strikePrice = parseFloat(strikePriceRaw);
      realTradingSymbol = symbol;
    } else {
      res = symbol.match(PATTERNS.OPTION_SYMBOL_PATTERN_OLD);
      year = res[3];
      month = res[4];
      day = res[5];
      callOrPut = res[6];
      strikePriceRaw = res[7];
      strikePrice = parseFloat(strikePriceRaw);
      realTradingSymbol = "" + res[1] + res[2] + "_" + (res[4] + res[5] + res[3] + res[6] + res[7]);
    }
  } catch (_error) {
    e = _error; //   if (typeof Raven !== "undefined" && Raven !== null) {
    //     Raven.captureException(e, {
    //       tags: {
    //         context: "SymbolUtils.optionSymbolToObject while trying to parse symbol: " + symbol
    //       }
    //     });
    //   }

    throw e;
  }

  if (!underlyingSymbol) {
    underlyingSymbol = res[1];
  }

  if (!rootSymbol) {
    rootSymbol = underlyingSymbol;
  }

  if (underlyingSymbol === 'SPXW' || underlyingSymbol === 'SPXQ') {
    underlyingSymbol = 'SPX';
  }

  if (underlyingSymbol === 'VIXW') {
    underlyingSymbol = 'VIX';
  }

  if (underlyingSymbol === 'RUTQ' || underlyingSymbol === 'RUTW') {
    underlyingSymbol = 'RUT';
  }

  if (underlyingSymbol === 'NDXP') {
    underlyingSymbol = 'NDX';
  }

  if (isAmSettled(rootSymbol)) {
    expirationDate = TradeUtils.openingTimeForDateStrings(year, month, day); //, expirationDate);

    settlementType = 'AM';
  } else {
    expirationDate = TradeUtils.closingTimeForDateStrings(year, month, day); //, expirationDate);

    settlementType = 'PM';
  }

  optionChainType = STANDARD;

  if (futureOptionRootSymbol === null) {
    expirationKey = "20" + year + "-" + month + "-" + day + " " + settlementType;
    rawOptionChainType = nonStandard = res[2];
    multiplier = TradeUtils.DEFAULT_OPTION_MULTIPLIER;

    if (nonStandard) {
      if (__indexOf.call(MINI_FLAGS, nonStandard) >= 0) {
        multiplier = 10;
        optionChainType = 'mini' + nonStandard;
      } else {
        optionChainType = 'ns' + nonStandard;
      }

      miniFlag = nonStandard;
    }
  } else {
    expirationKey = "20" + year + "-" + month + "-" + day + " " + futureOptionRootSymbol;
    multiplier = 1;
  }

  daysToExpiration = getDaysToExpirationWithType(expirationDate, {
    symbol: rootSymbol,
    settlementType: settlementType
  });
  dateRaw = "" + year + month + day;
  return {
    underlyingSymbol: underlyingSymbol,
    expirationDate: expirationDate,
    daysToExpiration: daysToExpiration,
    callOrPut: callOrPut,
    strikePrice: strikePrice,
    realTradingSymbol: realTradingSymbol,
    optionChainType: optionChainType,
    miniFlag: miniFlag,
    rawOptionChainType: rawOptionChainType,
    multiplier: multiplier,
    dateRaw: dateRaw,
    strikePriceRaw: strikePriceRaw,
    rootSymbol: rootSymbol,
    expirationKey: expirationKey,
    futureOptionRootSymbol: futureOptionRootSymbol
  };
};

/***/ }),

/***/ "./src/models/Tickers.ts":
/*!*******************************!*\
  !*** ./src/models/Tickers.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Profile = exports.Summary = exports.Quote = exports.Trade = exports.validateSchema = void 0;

exports.validateSchema = (type, schema) => {
  const schemas = {
    "Trade": Trade.Schema,
    "Quote": Quote.Schema,
    "Summary": Summary.Schema,
    "Profile": Profile.Schema
  };
  const knownSchema = schemas[type];

  if (!knownSchema) {
    console.warn("Unknown type: " + type);
    debugger;
    return false;
  }

  for (let element of schema) {
    if (!knownSchema.includes(element)) {
      console.warn(type + " schema appears to have changed");
      debugger;
      return false;
    }
  }

  return true;
};

class Trade {}

exports.Trade = Trade;
Trade.Schema = ["eventSymbol", "eventTime", "time", "timeNanoPart", "sequence", "exchangeCode", "price", "change", "size", "dayVolume", "dayTurnover", "tickDirection", "extendedTradingHours"];

class Quote {}

exports.Quote = Quote;
Quote.Schema = ["eventSymbol", "eventTime", "sequence", "timeNanoPart", "bidTime", "bidExchangeCode", "bidPrice", "bidSize", "askTime", "askExchangeCode", "askPrice", "askSize"];

class Summary {}

exports.Summary = Summary;
Summary.Schema = ["eventSymbol", "eventTime", "dayId", "dayOpenPrice", "dayHighPrice", "dayLowPrice", "dayClosePrice", "dayClosePriceType", "prevDayId", "prevDayClosePrice", "prevDayClosePriceType", "prevDayVolume", "openInterest"];

class Profile {}

exports.Profile = Profile;
Profile.Schema = ["eventSymbol", "eventTime", "description", "shortSaleRestriction", "tradingStatus", "statusReason", "haltStartTime", "haltEndTime", "highLimitPrice", "lowLimitPrice", "high52WeekPrice", "low52WeekPrice"];

/***/ }),

/***/ "./src/util/Assert.ts":
/*!****************************!*\
  !*** ./src/util/Assert.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Assert = void 0;

exports.Assert = function (condition, msg, context = null) {
  if (!condition) {
    console.error(msg);
    context && console.table(context);
    debugger;
  }
};

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

/***/ "moment-timezone":
/*!**********************************!*\
  !*** external "moment-timezone" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("moment-timezone");

/***/ }),

/***/ "superagent":
/*!*****************************!*\
  !*** external "superagent" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("superagent");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ })

/******/ });
//# sourceMappingURL=node.js.map