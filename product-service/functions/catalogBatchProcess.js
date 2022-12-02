const AWS = require('aws-sdk');
const defaultHeaders = { 'Access-Control-Allow-Origin': '*' }
const { createProduct } = require('../dal');

const getProduct = (data) => {
  const product = JSON.parse(data);
  return {
    ...product,
    price: Number(product.price),
    count: Number(product.count),
  };
};

const catalogBatchProcess = async (event) => {
  const items = event.Records.map(({ body }) => getProduct(body));

  await Promise.allSettled(
    items.map((product) => createProduct(product))
  );

  const sns = new AWS.SNS({ region: 'eu-west-1' });

  // Task 6.3.3: Update the catalogBatchProcess lambda function in the Product Service to send an event to the SNS topic.
  await sns
    .publish({
      Subject: 'Products were created in the database.',
      Message: JSON.stringify(items),
      TopicArn: process.env.SNS_TOPIC,
    })
    .promise();

  return {
    statusCode: 200,
    headers: defaultHeaders,
  };
};

module.exports = async (event) => {
  try {
    console.log('catalogBatchProcess: ', JSON.stringify(event));
    return await catalogBatchProcess(event);
  } catch {
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: 'Server error.',
    };
  }
};
