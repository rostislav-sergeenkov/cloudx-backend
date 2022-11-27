'use strict';

const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Bucket = new S3({
  region: 'eu-west-1'
});

module.exports = async (event) => {
  const fileName = event.queryStringParameters['name'];
  // Basic filename validation RegEx, for the future switch to https://www.npmjs.com/package/valid-filename.
  const filenameRegEx = /^[0-9a-zA-Z.]+$/;
  const headers = {
    'Access-Control-Allow-Origin': '*',
  };
  let status = 500;
  let message = `Name parameter "${fileName}" is invalid and cannot be used as a filename.`;

  console.log(fileName);

  if (fileName && filenameRegEx.test(fileName)) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `${process.env.UPLOADED_DIR}/${fileName}`
    });

    try {
      message = await getSignedUrl(s3Bucket, command, { expiresIn: 3600 });
      status = 200;
    } catch (error) {
      message = error.toString();
    }
  }

  return {
    statusCode: status,
    headers: headers,
    body: JSON.stringify(message)
  }
}
