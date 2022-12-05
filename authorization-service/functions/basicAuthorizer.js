'use strict';

module.exports = async (event, ctx, cb) => {
  console.log('Event: ', JSON.stringify(event));

  if (event.type !== 'TOKEN') {
    cb('Unauthorized');
  }

  try {
    const encodedCreds = event.authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainTextCreds = buff.toString('utf-8').split(':');
    const username = plainTextCreds[0];
    const password = plainTextCreds[1];

    console.log(`token username: ${username} / token pwd: ${password}`);

    const storedUserPassword = process.env[username];

    console.log(`.env username: ${username} / .env pwd: ${process.env[username]}`);

    const effect = (!storedUserPassword || storedUserPassword !== password) ? 'Deny' : 'Allow';
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    cb(null, policy);
  } catch (e) {
    cb(`Unauthorized: ${e.message}`);
  }
};

const generatePolicy = (principalId, resource, effect = 'Allow') => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
