# Authorization Service

## Overview

The Authorization Service provides authentication and authorization functionality for the CloudX backend services. It implements a custom AWS API Gateway authorizer using HTTP Basic Authentication to secure API endpoints.

## Purpose

This service acts as a centralized authentication layer that:

- Validates user credentials before requests reach protected API endpoints
- Generates IAM policies to control access to AWS API Gateway resources
- Provides reusable authorization logic across multiple backend services
- Enables secure access control without implementing authentication in each service

## Architecture

### basicAuthorizer Function

Located in `functions/basicAuthorizer.js`, this Lambda function serves as a TOKEN-based custom authorizer for AWS API Gateway.

**Key Features:**

- HTTP Basic Authentication implementation
- Base64 credential decoding
- Environment-based credential storage
- Dynamic IAM policy generation
- Policy caching support (configurable TTL)

### How It Works

```
1. Client Request
   ↓
   [Authorization: Basic <base64(username:password)>]
   ↓
2. API Gateway
   ↓
   [Invokes basicAuthorizer Lambda]
   ↓
3. basicAuthorizer Function
   ↓
   - Decodes credentials
   - Validates against environment variables
   - Generates IAM policy (Allow/Deny)
   ↓
4. API Gateway
   ↓
   - Caches policy (if TTL > 0)
   - Enforces authorization decision
   ↓
5. Target Lambda Function (if authorized)
   OR
   403 Forbidden (if denied)
```

## Configuration

### Environment Variables

The authorizer requires environment variables for each authorized user:

- **Variable Name**: Username
- **Variable Value**: Password

**Example:**

```bash
# .env file
testUser=testPassword123
adminUser=adminPass456
```

### Serverless Configuration

The function is defined in `serverless.yml`:

```yaml
functions:
  basicAuthorizer:
    handler: handler.basicAuthorizer
```

### Usage in Other Services

To protect an endpoint with this authorizer, reference it in the target service's `serverless.yml`:

```yaml
functions:
  myProtectedFunction:
    handler: handler.myFunction
    events:
      - http:
          path: /protected-endpoint
          method: get
          authorizer:
            name: basicAuthorizer
            arn: "arn:aws:lambda:${aws:region}:${aws:accountId}:function:backend-authorization-service-dev-basicAuthorizer"
            resultTtlInSeconds: 0
            identitySource: method.request.header.Authorization
            type: token
```

**Example**: The `import-service` uses this authorizer to protect the `/import` endpoint (see `import-service/serverless.yml`).

## Authentication Flow

### Request Format

Clients must include an Authorization header with HTTP Basic credentials:

```
Authorization: Basic <base64(username:password)>
```

**Example:**

```bash
# For username "testUser" and password "testPass"
# Base64 encode "testUser:testPass" → "dGVzdFVzZXI6dGVzdFBhc3M="
curl -H "Authorization: Basic dGVzdFVzZXI6dGVzdFBhc3M=" \
  https://api.example.com/import
```

### Authorization Process

1. **Token Extraction**: Authorizer extracts credentials from the `Authorization` header
2. **Decoding**: Base64-encoded credentials are decoded to plaintext
3. **Parsing**: Username and password are separated (format: `username:password`)
4. **Validation**: Password is compared against the environment variable for that username
5. **Policy Generation**:
   - **Allow**: If username exists and password matches
   - **Deny**: If username not found or password doesn't match
6. **Response**: IAM policy document is returned to API Gateway

### IAM Policy Structure

The authorizer returns an IAM policy document:

```json
{
  "principalId": "<base64-encoded-credentials>",
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Allow", // or "Deny"
        "Resource": "<method-arn>"
      }
    ]
  }
}
```

## Security Considerations

### Current Implementation

⚠️ **This is a basic implementation suitable for development/testing:**

- Credentials stored as environment variables (not secure for production)
- Passwords logged to CloudWatch (security risk)
- Basic Auth over HTTPS required (credentials in every request)

### Production Recommendations

For production environments, consider these improvements:

1. **Credential Storage**
   - Use AWS Secrets Manager or AWS Systems Manager Parameter Store
   - Implement credential rotation
   - Use encrypted storage

2. **Logging**
   - Remove password logging from CloudWatch
   - Log only authentication attempts (success/failure)
   - Implement audit trails

3. **Enhanced Security**
   - Implement rate limiting to prevent brute force attacks
   - Use JWT tokens instead of Basic Auth
   - Implement OAuth 2.0 or AWS Cognito
   - Add MFA support

4. **Policy Caching**
   - Configure `resultTtlInSeconds` appropriately
   - Balance between performance and security
   - Set to 0 for maximum security (no caching)

5. **HTTPS Only**
   - Ensure all API endpoints use HTTPS
   - Never transmit credentials over HTTP

## Development

### Local Testing

To test the authorizer locally:

```bash
# Install dependencies
npm install

# Set environment variables
export testUser=testPassword

# Deploy to AWS
serverless deploy

# Test with curl
curl -H "Authorization: Basic dGVzdFVzZXI6dGVzdFBhc3N3b3Jk" \
  https://your-api-url/import
```

### Testing Credentials

For development, set test credentials in `.env` file:

```bash
# .env
testUser=testPassword
```

**Note**: Never commit `.env` files with real credentials to version control.

## Troubleshooting

### Common Issues

**1. "Unauthorized" Error**

- Check that the Authorization header is present
- Verify Base64 encoding is correct
- Ensure environment variable exists for the username
- Confirm password matches exactly

**2. "Malformed Token" Error**

- Verify header format: `Authorization: Basic <base64-token>`
- Check that credentials are Base64 encoded
- Ensure no extra spaces or characters

**3. Policy Cache Issues**

- Set `resultTtlInSeconds: 0` to disable caching during development
- Clear API Gateway cache if credentials change
- Redeploy authorizer after changing environment variables

### Debug Logging

The authorizer logs the following to CloudWatch:

- Full event object (includes method ARN and token)
- Decoded username and password (⚠️ remove in production)
- Environment variable lookup results

Check CloudWatch Logs for the `backend-authorization-service-dev-basicAuthorizer` function.

## Related Services

- **import-service**: Uses this authorizer to protect the `/import` endpoint
- **product-service**: Currently unprotected (consider adding authorization)

## Deployment

Deploy the authorization service:

```bash
cd authorization-service
serverless deploy
```

The Lambda ARN will be output, which can be referenced by other services.

## References

- [AWS API Gateway Custom Authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)
- [IAM Policy Language](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_grammar.html)
- [HTTP Basic Authentication](https://tools.ietf.org/html/rfc7617)
