'use strict';

const PRODUCTS = require('../mocks/products.json');

module.exports = async (event) => {
    // console.log("lambda invocation on products API", event);
    return {
        statusCode: 200,
        body: JSON.stringify(PRODUCTS),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        }
    };
};
