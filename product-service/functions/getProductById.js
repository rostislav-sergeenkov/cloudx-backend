'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const RESPONSE = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  }
};

module.exports = async (event) => {
  console.log("lambda invocation on getProductById", event);

  if (!event || !event.pathParameters) {
    return {
      ...RESPONSE,
      statusCode: 400,
      body: 'Such product cannot be found.',
    };
  }

  const id = Number(event.pathParameters.id);

  try {
    const response = [];
    const products = await dynamo.query({
      TableName: process.env.TABLE_PRODUCTS,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {':id': id},
    }).promise();

    if (products.Items.length) {
      const stocks = await dynamo.query({
        TableName: process.env.TABLE_STOCKS,
        KeyConditionExpression: 'product_id = :product_id',
        ExpressionAttributeValues: {':product_id': id},
      }).promise();

      response.push({...products.Items[0], ...stocks.Items[0]});

      return {
        ...RESPONSE,
        statusCode: 200,
        body: JSON.stringify(response),
      };
    }

    return {
      ...RESPONSE,
      statusCode: 400,
      body: JSON.stringify('Product not found.'),
    };
  } catch (err) {
    return {
      ...RESPONSE,
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
