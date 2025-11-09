# System Architecture

## Overview

This log service uses a serverless architecture built entirely on AWS managed services, ensuring scalability, reliability, and minimal operational overhead.

## Architecture Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ HTTPS
       │
       ├────────────────────────────────┐
       │                                │
       ▼                                ▼
┌──────────────┐              ┌──────────────┐
│ Ingest       │              │ ReadRecent   │
│ Lambda       │              │ Lambda       │
│ (Function    │              │ (Function    │
│  URL)        │              │  URL)        │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │ Write                       │ Read
       │                             │
       └──────────┬──────────────────┘
                  │
                  ▼
          ┌───────────────┐
          │   DynamoDB    │
          │   Table       │
          │   (LogEntries)│
          └───────────────┘
```

## Components

### 1. Lambda Functions

#### Ingest Lambda
- **Purpose**: Accept and store log entries
- **Runtime**: Node.js 20.x (recommended) or Python 3.12
- **Memory**: 256 MB (adjust based on testing)
- **Timeout**: 10 seconds
- **Trigger**: Lambda Function URL (HTTPS endpoint)
- **IAM Permissions**:
  - `dynamodb:PutItem` on the LogEntries table
  - CloudWatch Logs write permissions

**Input**:
```json
{
  "severity": "info",
  "message": "Application started successfully"
}
```

**Output**:
```json
{
  "success": true,
  "id": "generated-uuid",
  "dateTime": "2025-11-08T10:30:00.000Z"
}
```

#### Read Recent Lambda
- **Purpose**: Retrieve 100 most recent log entries
- **Runtime**: Node.js 20.x or Python 3.12
- **Memory**: 512 MB (for potential sorting operations)
- **Timeout**: 15 seconds
- **Trigger**: Lambda Function URL (HTTPS endpoint)
- **IAM Permissions**:
  - `dynamodb:Query` or `dynamodb:Scan` on the LogEntries table
  - CloudWatch Logs write permissions

**Input**: None (or optional query parameters for filtering)

**Output**:
```json
{
  "count": 100,
  "logs": [
    {
      "id": "uuid",
      "dateTime": "2025-11-08T10:30:00.000Z",
      "severity": "error",
      "message": "Database connection failed"
    }
  ]
}
```

### 2. Database

**Selected: Amazon DynamoDB**

See DATABASE_DESIGN.md for detailed rationale and schema.

### 3. IAM Roles and Policies

#### Ingest Lambda Role
```
Policy: LogIngestPolicy
- dynamodb:PutItem on LogEntries table
- logs:CreateLogGroup
- logs:CreateLogStream
- logs:PutLogEvents
```

#### ReadRecent Lambda Role
```
Policy: LogReadPolicy
- dynamodb:Query on LogEntries table
- logs:CreateLogGroup
- logs:CreateLogStream
- logs:PutLogEvents
```

## Infrastructure as Code (IaC)

### IaC Tool Options

#### Option 1: Terraform (Recommended)
**Pros**:
- Cloud-agnostic (easier to migrate if needed)
- Strong state management
- Large community and module ecosystem
- Better for complex infrastructure

**Cons**:
- Requires separate state management (S3 + DynamoDB)
- Steeper learning curve

#### Option 2: AWS SAM (Serverless Application Model)
**Pros**:
- AWS-native, optimized for serverless
- Built-in local testing capabilities
- Simpler for Lambda-focused projects
- Automatic packaging and deployment

**Cons**:
- AWS-specific (vendor lock-in)
- Less flexible for non-serverless resources

#### Option 3: AWS CDK (Cloud Development Kit)
**Pros**:
- Use familiar programming languages
- Type safety and IDE support
- Reusable constructs

**Cons**:
- More complex setup
- Longer build times

**Recommendation**: Use **Terraform** for this project due to:
- Industry standard for IaC
- Better for portfolio/demonstration purposes
- Flexibility for future enhancements
- Strong community support

## Security Considerations

### 1. Lambda Function URLs
- Enable IAM authentication if needed
- Consider AWS_IAM auth type for production
- Use CORS configuration appropriately

### 2. Data Encryption
- DynamoDB encryption at rest (enabled by default)
- TLS 1.2+ for data in transit
- Secure environment variable storage

### 3. IAM Least Privilege
- Each Lambda has minimum required permissions
- No wildcard permissions
- Resource-specific access only

### 4. Network Security
- Lambda functions run in AWS-managed VPC
- No direct internet exposure (only through Function URLs)
- VPC configuration optional for enhanced isolation

### 5. Input Validation
- Validate severity field (info/warning/error only)
- Message length limits
- Rate limiting considerations

## Scalability

### DynamoDB
- On-demand capacity mode: Scales automatically
- Provisioned capacity mode: Configure based on expected load
- Can handle thousands of requests per second

### Lambda
- Concurrent execution limit: 1000 (default, can be increased)
- Auto-scales based on incoming requests
- Each function instance handles one request at a time

### Cost Optimization
- Use reserved capacity for DynamoDB if predictable load
- Optimize Lambda memory allocation
- Implement CloudWatch alarms for cost monitoring

## Monitoring and Observability

### CloudWatch Metrics
- Lambda invocations, duration, errors, throttles
- DynamoDB read/write capacity utilization
- Custom metrics for business logic

### CloudWatch Logs
- All Lambda execution logs
- Structured logging for better querying
- Log retention period: 30 days (configurable)

### Alarms
- Lambda error rate > 5%
- DynamoDB throttling events
- Function URL 5xx errors

### X-Ray Tracing (Optional)
- End-to-end request tracing
- Performance bottleneck identification
- Dependency mapping

## Error Handling

### Ingest Lambda
- Validate input format
- Handle DynamoDB write failures
- Return appropriate HTTP status codes
- Implement retry logic with exponential backoff

### ReadRecent Lambda
- Handle empty result sets
- Timeout handling for large scans
- Graceful degradation if < 100 entries exist

## Future Enhancements

1. **Authentication**: Add API Gateway with Cognito or API keys
2. **Filtering**: Add query parameters for severity, date range
3. **Pagination**: Support for retrieving logs beyond 100
4. **Search**: Add ElasticSearch/OpenSearch for full-text search
5. **Aggregation**: Add Lambda for log analytics and dashboards
6. **Multi-region**: Replicate for disaster recovery
7. **Dead Letter Queue**: For failed ingestion attempts
8. **Rate Limiting**: Implement throttling at API Gateway level
