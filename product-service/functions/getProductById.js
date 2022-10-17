'use strict';

const PRODUCTS = require('../mocks/products.json');
const RESPONSE = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    }
};

module.exports = async (event) => {
    if (!event || !event.pathParameters) {
        return {
            ...RESPONSE,
            statusCode: 400,
            body: 'Such product cannot be found.',
        };
    }

    const productId = event.pathParameters.id;
    const product = PRODUCTS.find((item) => item.id === productId);

    return product
        ? {
            ...RESPONSE,
            statusCode: 200,
            body: JSON.stringify({ product }),
        }
        : {
            ...RESPONSE,
            statusCode: 400,
            body: 'Such product cannot be found.'
        };
};
