# CloudX Backend - Architecture Documentation

## Overview

CloudX Backend is a **serverless e-commerce platform** built on AWS infrastructure. The system implements a microservices architecture using AWS Lambda functions, designed to manage product catalogs, handle file imports, and provide secure API access through token-based authorization.

## Main Functionality

The repository provides a complete backend solution for an online store that sells Toyota vehicles. The system enables:

1. **Product Management** - CRUD operations for products with inventory tracking
2. **Bulk Import** - CSV file upload and processing for batch product creation
3. **API Security** - Token-based authentication and authorization
4. **Real-time Notifications** - SNS-based alerts for product updates
5. **Asynchronous Processing** - SQS-based queue system for scalable batch operations

## System Architecture

The application consists of three independent microservices, each deployed as a separate AWS Lambda function suite:

```
cloudx-backend/
├── product-service/          # Core product and catalog management
├── import-service/           # CSV file import and processing
└── authorization-service/    # API authentication and authorization
```

## Key Components

### 1. Product Service (`product-service/`)

**Purpose**: Core service managing product catalog and inventory operations.

**AWS Resources**:
- **DynamoDB Tables**:
  - `cloudx_be_products` - Stores product information (id, title, description, price)
  - `cloudx_be_stocks` - Stores inventory counts (product_id, count)
- **SQS Queue**: `cloudx_products_simple_queue` - Receives product data from import service
- **SNS Topic**: `cloudx_products_sns_topic` - Publishes notifications when products are created

**Lambda Functions**:

1. **getProductsList** (GET /products)
   - Retrieves all products with their stock counts
   - Joins data from products and stocks tables
   - Returns combined product information with inventory

2. **getProductById** (GET /products/{id})
   - Fetches a specific product by ID
   - Returns product details with stock information

3. **createProduct** (POST /products)
   - Creates new product entries
   - Validates input data
   - Inserts into both products and stocks tables
   - Returns the created product ID

4. **catalogBatchProcess** (SQS Trigger)
   - Processes batches of products from SQS queue
   - Creates multiple products in parallel
   - Publishes SNS notification with created products
   - Triggered automatically when messages arrive in the queue

5. **getApiDocs** (GET /openapi)
   - Serves OpenAPI/Swagger documentation
   - Provides API specification for all endpoints

**Key Files**:
- `handler.js` - Exports all Lambda function handlers
- `dal.js` - Data Access Layer for DynamoDB operations
- `validation.js` - Input validation logic
- `serverless.yml` - Infrastructure as Code configuration
- `api-docs/swagger.json` - OpenAPI specification

### 2. Import Service (`import-service/`)

**Purpose**: Handles CSV file uploads and parses them into individual product records.

**AWS Resources**:
- **S3 Bucket**: `import-product-service-bucket`
  - `uploaded/` - Stores newly uploaded CSV files
  - `parsed/` - Archives processed CSV files
- **SQS Queue**: Sends parsed product records to product service

**Lambda Functions**:

1. **importProductsFile** (GET /import?name={filename})
   - Protected by authorization service
   - Validates filename format (alphanumeric and dots only)
   - Generates pre-signed S3 URL for file upload
   - Returns URL valid for 1 hour
   - Allows clients to upload CSV files directly to S3

2. **importFileParser** (S3 Trigger on uploaded/*)
   - Automatically triggered when file uploaded to S3
   - Reads CSV file using streaming parser
   - Sends each CSV row as individual SQS message
   - Moves processed file from `uploaded/` to `parsed/`
   - Deletes original file from `uploaded/` folder

**Workflow**:
```
Client → GET /import?name=products.csv → Pre-signed URL
Client → PUT to S3 URL → File uploaded to uploaded/
S3 Event → importFileParser → Parse CSV
Each Row → SQS Message → catalogBatchProcess
File → Moved to parsed/ → Cleanup uploaded/
```

**Key Files**:
- `handler.js` - Exports Lambda function handlers
- `serverless.yml` - Infrastructure and S3 event configuration

### 3. Authorization Service (`authorization-service/`)

**Purpose**: Provides token-based authentication for protected API endpoints.

**Lambda Functions**:

1. **basicAuthorizer** (Lambda Authorizer)
   - Implements AWS Lambda Token Authorizer
   - Validates Basic Authentication headers
   - Decodes base64-encoded credentials
   - Checks username/password against environment variables
   - Returns IAM policy (Allow/Deny) for API Gateway
   - Credentials stored in `.env` file (not in repository)

**Authentication Flow**:
```
Client Request → Authorization Header (Basic base64(user:pass))
API Gateway → Invoke basicAuthorizer
basicAuthorizer → Validate credentials → Generate IAM Policy
API Gateway → Allow/Deny request based on policy
```

**Key Files**:
- `handler.js` - Exports authorizer function
- `serverless.yml` - Lambda configuration
- `.env` - Stores user credentials (gitignored)
- `package.json` - Includes serverless-dotenv-plugin

## Technology Stack

**Runtime**: Node.js 16.x

**Framework**: Serverless Framework v3

**AWS Services**:
- **Lambda** - Serverless compute for all business logic
- **API Gateway** - RESTful API endpoints
- **DynamoDB** - NoSQL database for products and stocks
- **S3** - Object storage for CSV files
- **SQS** - Message queue for asynchronous processing
- **SNS** - Pub/sub notifications
- **IAM** - Access control and permissions

**NPM Dependencies**:
- `@aws-sdk/client-s3` - S3 operations
- `@aws-sdk/s3-request-presigner` - Generate pre-signed URLs
- `csv-parser` - Stream-based CSV parsing
- `aws-sdk` - AWS service clients (DynamoDB, SQS, SNS)
- `serverless-dotenv-plugin` - Environment variable management

## Data Model

### Product Schema
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "price": "number"
}
```

### Stock Schema
```json
{
  "product_id": "number",
  "count": "number"
}
```

### CSV Import Format
```csv
title,description,price,count
Toyota Yaris Cross,The Toyota Yaris Cross is a subcompact crossover SUV,100,5
```

## API Endpoints

**Product Service**:
- `GET /products` - List all products
- `GET /products/{id}` - Get specific product
- `POST /products` - Create new product
- `GET /openapi` - API documentation

**Import Service**:
- `GET /import?name={filename}` - Get pre-signed upload URL (requires auth)

**Deployed URLs**:
- Base URL: `https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev`

## Security Features

1. **API Authorization** - Basic Auth for import endpoints
2. **Pre-signed URLs** - Temporary, scoped S3 access
3. **Filename Validation** - Prevents path traversal attacks
4. **CORS Configuration** - Cross-origin resource sharing enabled
5. **IAM Roles** - Principle of least privilege for Lambda functions
6. **Environment Variables** - Sensitive data not hardcoded

## Event-Driven Architecture

The system uses an event-driven pattern for scalability:

1. **S3 Events** → Trigger file parsing when CSV uploaded
2. **SQS Messages** → Decouple import from product creation
3. **SNS Notifications** → Notify subscribers of new products
4. **Batch Processing** → Process up to 5 products per invocation

This design ensures:
- **Scalability** - Services scale independently
- **Reliability** - SQS provides guaranteed message delivery
- **Decoupling** - Services don't directly depend on each other
- **Asynchronous Processing** - Non-blocking operations

## Deployment

Each service is independently deployable using Serverless Framework:

```bash
cd product-service && serverless deploy
cd import-service && serverless deploy
cd authorization-service && serverless deploy
```

AWS Region: `eu-west-1` (Ireland)
Stage: `dev`

## Development Workflow

1. **Local Development** - Modify Lambda functions
2. **Validation** - Input validation ensures data integrity
3. **Testing** - No test suite currently (test script returns error)
4. **Deployment** - Serverless Framework handles infrastructure
5. **Monitoring** - CloudWatch Logs for Lambda execution

## Current Limitations

1. No automated test suite
2. Product ID generation uses simple counter (race conditions possible)
3. No pagination for product lists
4. Email notifications hardcoded to developer email
5. No error handling for failed SQS message processing
6. Basic authentication only (no OAuth/JWT)

## Future Enhancements

Based on the code comments and structure:
- Refactor `createProduct` to use DAL consistently
- Implement comprehensive error handling
- Add unit and integration tests
- Implement pagination for large product catalogs
- Enhanced security with JWT tokens
- Advanced filename validation library
- Database migration scripts
- API rate limiting

## Conclusion

CloudX Backend demonstrates a modern serverless architecture using AWS managed services. The microservices design allows independent scaling and deployment, while the event-driven pattern ensures loose coupling and reliability. The system is production-ready for small to medium-scale e-commerce operations with room for enhancement and optimization.
