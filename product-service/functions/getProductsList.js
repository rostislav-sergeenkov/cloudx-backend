'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports = async (event) => {
  console.log("lambda invocation on getProductsList", event);
  try {
    const response = [];
    const products = await dynamo.scan({TableName: process.env.TABLE_PRODUCTS}).promise();

    if (products.Items.length) {
      const stocks = await dynamo.scan({TableName: process.env.TABLE_STOCKS}).promise();

      products.Items.forEach((item) => {
        const inStock = stocks.Items.find((stock) => stock.product_id === item.id);
        response.push({...item, count: inStock.count});
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
