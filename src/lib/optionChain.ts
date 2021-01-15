'use strict';

/**
 * Get market metrics
 * @param {object} headers
 * @param {string} ticker
 */

const request = require('superagent');
const endpoints = require('../util/endpoints');

const optionChain = async (headers, ticker) => {
    const endpoint = endpoints['optionChain'](ticker);
    return await request
        .get(`${endpoint}`)
        .set(headers)
        .send()
        .then(res => {
            const {
                body: {
                    data
                }
            } = res;

            return data.items[0];
        });
}

export default optionChain;