'use strict';

const API_DOCS = require('../api-docs/swagger.json');

module.exports = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify(API_DOCS),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        }
    };
};
