'use strict';

const AWS = require('aws-sdk');
const csv = require('csv-parser');
const s3 = new AWS.S3({
  region: 'eu-west-1'
});

module.exports = async (event) => {
  let statusCode = 202;
  let message = '';

  for (let record of event.Records) {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: record.s3.object.key,
    };

    try {
      console.log(record.s3.object.key);

      const s3Stream = s3.getObject(params).createReadStream().pipe(csv());

      await s3Stream
        .on('data', (data) => console.log(data))
        .on('error', () => reject());

      await s3
        .copyObject({
          Bucket: process.env.S3_BUCKET,
          CopySource: process.env.S3_BUCKET + '/' + record.s3.object.key,
          Key: record.s3.object.key.replace(process.env.UPLOADED_DIR, process.env.PARSED_DIR),
        })
        .promise();

      await s3
        .deleteObject({
          Bucket: process.env.S3_BUCKET,
          Key: record.s3.object.key,
        })
        .promise();
    }
    catch (error) {
      message = error.toString();
      statusCode = 500;
    }
  }

  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(message)
  };
};
