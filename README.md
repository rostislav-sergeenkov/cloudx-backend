# CloudX: backend

## BE API URLs 

 - [Products](https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev/products)
 - [Specific Product](https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev/products/2)
 - [Product not found](https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev/products/20)

## API Docs

1. Navigate to https://editor.swagger.io/.
2. Select File -> Import URL on the top menu.
3. Paste [Swagger file URL](https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev/openapi).
4. Check API response.

## Recent Improvements

A comprehensive code analysis and improvement initiative has been completed. See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for detailed information about:

- **Security fixes**: Resolved 3 dependency vulnerabilities and removed sensitive data from logs
- **Critical bug fixes**: Fixed runtime errors in Lambda functions
- **Error handling**: Enhanced error handling across all services
- **Code quality**: Improved validation, logging, and response formats
- **Recommendations**: Future improvement suggestions organized by priority

All services now have:
- ✅ Zero security vulnerabilities
- ✅ Improved error handling with structured responses
- ✅ Better input validation
- ✅ Consistent CORS configuration
- ✅ No sensitive data in logs

