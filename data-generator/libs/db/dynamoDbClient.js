import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
const REGION = 'eu-west-1'
const dynamoDbClient = new DynamoDBClient({ region: REGION })
export { dynamoDbClient }
