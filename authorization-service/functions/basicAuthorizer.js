"use strict";

/**
 * Basic Authorizer Lambda Function
 *
 * Purpose:
 * This Lambda function implements an AWS API Gateway custom authorizer that performs
 * HTTP Basic Authentication. It is used to secure API endpoints by validating
 * credentials passed in the Authorization header.
 *
 * How it works:
 * 1. Receives an authorization event from API Gateway with a TOKEN type
 * 2. Extracts and decodes the Base64-encoded credentials from the Authorization header
 * 3. Parses the username and password from the decoded credentials
 * 4. Validates credentials against environment variables (username as key, password as value)
 * 5. Generates an IAM policy allowing or denying access to the requested resource
 * 6. Returns the policy to API Gateway, which enforces the authorization decision
 *
 * Authentication Flow:
 * - Client sends request with Authorization header: "Basic <base64(username:password)>"
 * - API Gateway invokes this authorizer before routing to the target Lambda
 * - Authorizer validates credentials and returns Allow/Deny policy
 * - API Gateway caches the policy result (TTL configured in serverless.yml)
 * - If allowed, request proceeds to target Lambda; if denied, returns 403
 *
 * Environment Variables Required:
 * - One environment variable per user, where:
 *   - Variable name = username
 *   - Variable value = password
 * - Example: If username is "testUser", set env var: testUser=testPassword
 *
 * Security Considerations:
 * - Credentials are stored as environment variables (consider AWS Secrets Manager for production)
 * - Passwords are logged (remove logging in production for security)
 * - Uses HTTP Basic Auth (recommend HTTPS only in production)
 * - Policy caching can be configured via resultTtlInSeconds in serverless.yml
 *
 * @param {Object} event - API Gateway authorizer event containing authorizationToken and methodArn
 * @param {Object} ctx - Lambda context object
 * @param {Function} cb - Callback function to return authorization result
 */
module.exports = async (event, ctx, cb) => {
  console.log("Event: ", JSON.stringify(event));

  // Validate that this is a TOKEN-based authorizer
  if (event.type !== "TOKEN") {
    cb("Unauthorized");
  }

  try {
    // Extract the Base64-encoded credentials from the Authorization header
    // Format: "Basic <base64(username:password)>"
    const encodedCreds = event.authorizationToken.split(" ")[1];

    // Decode the Base64 credentials
    const buff = Buffer.from(encodedCreds, "base64");
    const plainTextCreds = buff.toString("utf-8").split(":");
    const username = plainTextCreds[0];
    const password = plainTextCreds[1];

    console.log(`token username: ${username} / token pwd: ${password}`);

    // Retrieve the stored password for this username from environment variables
    const storedUserPassword = process.env[username];

    console.log(
      `.env username: ${username} / .env pwd: ${process.env[username]}`,
    );

    // Determine access based on credential validation
    // Deny if: username not found in env vars OR password doesn't match
    // Allow if: username exists and password matches
    const effect =
      !storedUserPassword || storedUserPassword !== password ? "Deny" : "Allow";

    // Generate IAM policy document with the authorization decision
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    // Return the policy to API Gateway
    cb(null, policy);
  } catch (e) {
    // Handle any errors (malformed credentials, missing header, etc.)
    cb(`Unauthorized: ${e.message}`);
  }
};

/**
 * Generate IAM Policy Document
 *
 * Creates an IAM policy document that API Gateway uses to allow or deny access
 * to the requested resource. The policy follows AWS IAM policy syntax.
 *
 * @param {string} principalId - Identifier for the principal (user), typically the encoded credentials
 * @param {string} resource - The ARN of the method being invoked (from event.methodArn)
 * @param {string} effect - Either 'Allow' or 'Deny' to permit or block access
 * @returns {Object} IAM policy document with principalId and policyDocument
 */
const generatePolicy = (principalId, resource, effect = "Allow") => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17", // IAM policy version
      Statement: [
        {
          Action: "execute-api:Invoke", // Permission to invoke API Gateway endpoint
          Effect: effect, // Allow or Deny
          Resource: resource, // Specific API Gateway method ARN
        },
      ],
    },
  };
};
