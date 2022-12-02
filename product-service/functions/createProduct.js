'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const { dataIsValid } = require('../validation');
const defaultHeaders = { 'Access-Control-Allow-Origin': '*' };

// @todo: in the future re-factor the entire file to use createProduct method.

module.exports = async (product) => {
  console.log("lambda invocation on createProduct", product);

  if (!dataIsValid(product)) {
    return {
      statusCode: 400,
      headers: defaultHeaders,
      body: JSON.stringify("Invalid Request: all product attributes must be present.")
    };
  }

  try {
    const itemCount = await dynamo.scan({
      TableName: process.env.TABLE_PRODUCTS,
      Select: "COUNT"
    }).promise();

    product.id = itemCount.Count + 1;

    await dynamo.put({
      "TableName": process.env.TABLE_STOCKS,
      "Item": {
        product_id: product.id,
        count: product.count
      }
    }).promise();

    delete product.count;

    await dynamo.put({
      "TableName": process.env.TABLE_PRODUCTS,
      "Item": product
    }).promise();

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(product.id)
    };
  }
  catch (err) {
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify(err)
    };
  }
}
