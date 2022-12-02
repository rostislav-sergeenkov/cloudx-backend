const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const { dataIsValid } = require("./validation");

const putProduct = async (item) => {
  return await dynamo
    .put({
      TableName: process.env.TABLE_PRODUCTS,
      Item: item,
    })
    .promise();
};

const putStock = async (item) => {
  return await dynamo
    .put({
      TableName: process.env.TABLE_STOCKS,
      Item: item,
    })
    .promise();
};

module.exports = {
  createProduct: async (data) => {
    if (!dataIsValid(data)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: 'Data is invalid.',
      };
    }

    const id = AWS.util.uuid.v4();

    const product = {
      id: id,
      price: data.price,
      title: data.title,
      description: data.description,
    };

    const stock = {
      product_id: id,
      count: data.count,
    };

    return Promise.all([putProduct(product), putStock(stock)]).then(() => {
      return {
        ...data,
        id,
      };
    });
  },
};
