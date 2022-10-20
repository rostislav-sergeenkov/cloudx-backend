'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports = async (product) => {
  console.log("lambda invocation on createProduct", product);

  if (!product.title || !product.description || !product.price || !product.count) {
    return {
      statusCode: 400,
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
      body: JSON.stringify(product.id)
    };
  }
  catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
}
