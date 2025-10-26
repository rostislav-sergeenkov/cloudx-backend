# CloudX: Backend

A serverless e-commerce platform built on AWS infrastructure using Lambda, DynamoDB, S3, SQS, and SNS.

## 📖 Documentation

For comprehensive information about the system architecture, components, and functionality, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## 🚀 Quick Overview

CloudX Backend is a microservices-based system consisting of three independent services:

- **Product Service** - Manages product catalog and inventory
- **Import Service** - Handles CSV file uploads and batch processing
- **Authorization Service** - Provides API authentication

## 🌐 Live API URLs 

- [Products List](https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev/products)
- [Specific Product](https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev/products/2)
- [Product Not Found Example](https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev/products/20)

## 📚 API Documentation

1. Navigate to https://editor.swagger.io/
2. Select **File → Import URL** from the top menu
3. Paste the [Swagger file URL](https://ta6mjyl089.execute-api.eu-west-1.amazonaws.com/dev/openapi)
4. Explore the API specification

## 🛠️ Technology Stack

- **Runtime**: Node.js 16.x
- **Framework**: Serverless Framework v3
- **Cloud Provider**: AWS (eu-west-1)
- **Database**: DynamoDB
- **Storage**: S3
- **Messaging**: SQS, SNS

## 📦 Services

### Product Service
- REST API for product management
- DynamoDB storage for products and inventory
- Batch processing via SQS
- SNS notifications for product events

### Import Service
- CSV file upload via pre-signed S3 URLs
- Automated file parsing and processing
- Integration with product service via SQS

### Authorization Service
- Basic authentication for protected endpoints
- Lambda authorizer for API Gateway
- Token-based access control

## 🚢 Deployment

Each service can be deployed independently:

```bash
# Deploy product service
cd product-service
serverless deploy

# Deploy import service
cd import-service
serverless deploy

# Deploy authorization service
cd authorization-service
serverless deploy
```

## 📝 License

ISC
