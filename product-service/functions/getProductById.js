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

  if (!event || !event.pathParameters || !event.pathParameters.id) {
    return {
      ...RESPONSE,
      statusCode: 400,
      body: JSON.stringify({error: 'Product ID is required'}),
    };
  }

  const id = Number(event.pathParameters.id);

  if (isNaN(id)) {
    return {
      ...RESPONSE,
      statusCode: 400,
      body: JSON.stringify({error: 'Invalid product ID'}),
    };
  }

  try {
    const response = [];
    const products = await dynamo.query({
      TableName: process.env.TABLE_PRODUCTS,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {':id': id},
    }).promise();

    if (products.Items && products.Items.length) {
      const stocks = await dynamo.query({
        TableName: process.env.TABLE_STOCKS,
        KeyConditionExpression: 'product_id = :product_id',
        ExpressionAttributeValues: {':product_id': id},
      }).promise();

      const stockData = stocks.Items && stocks.Items.length > 0 ? stocks.Items[0] : {count: 0};
      response.push({...products.Items[0], ...stockData});

      return {
        ...RESPONSE,
        statusCode: 200,
        body: JSON.stringify(response),
      };
    }

    return {
      ...RESPONSE,
      statusCode: 404,
      body: JSON.stringify({error: 'Product not found'}),
    };
  } catch (err) {
    console.error('Error fetching product:', err);
    return {
      ...RESPONSE,
      statusCode: 500,
      body: JSON.stringify({error: 'Internal server error'}),
    };
  }
};
