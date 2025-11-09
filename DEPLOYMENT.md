# Deployment Guide

This guide provides step-by-step instructions for deploying the AWS Log Service using Infrastructure as Code (IaC).

## Prerequisites

### 1. AWS Account Setup
- Active AWS account with billing enabled
- IAM user with administrator access (or specific permissions listed below)
- AWS CLI installed and configured

### 2. Development Tools
- Git
- Terraform >= 1.5.0
- Node.js >= 18.x (for Lambda functions)
- Text editor or IDE

### 3. Required AWS Permissions

Your IAM user/role needs:
- `dynamodb:*`
- `lambda:*`
- `iam:CreateRole`, `iam:PutRolePolicy`, `iam:AttachRolePolicy`
- `logs:CreateLogGroup`, `logs:CreateLogStream`
- `s3:*` (for Terraform state)

## Project Structure

```
GamesGlobal/
├── infrastructure/
│   └── terraform/
│       ├── main.tf              # Main Terraform configuration
│       ├── variables.tf         # Input variables
│       ├── outputs.tf           # Output values
│       ├── iam.tf              # IAM roles and policies
│       ├── dynamodb.tf         # DynamoDB table
│       ├── lambda.tf           # Lambda functions
│       └── terraform.tfvars    # Variable values (gitignored)
├── lambdas/
│   ├── ingest/
│   │   ├── index.js            # Ingest Lambda handler
│   │   ├── package.json
│   │   └── package-lock.json
│   └── read-recent/
│       ├── index.js            # ReadRecent Lambda handler
│       ├── package.json
│       └── package-lock.json
└── tests/
    ├── ingest.test.js
    └── read-recent.test.js
```

## Setup Instructions

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd GamesGlobal
```

### Step 2: Configure AWS CLI

```bash
aws configure

# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)

# Verify configuration
aws sts get-caller-identity
```

### Step 3: Set Up Terraform Backend (Optional but Recommended)

Create an S3 bucket for Terraform state:

```bash
# Replace with your unique bucket name
BUCKET_NAME="log-service-terraform-state-$(aws sts get-caller-identity --query Account --output text)"
REGION="us-east-1"

# Create S3 bucket
aws s3api create-bucket \
  --bucket $BUCKET_NAME \
  --region $REGION

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION
```

Update `infrastructure/terraform/main.tf` with backend configuration:

```hcl
terraform {
  backend "s3" {
    bucket         = "log-service-terraform-state-<account-id>"
    key            = "log-service/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

### Step 4: Install Lambda Dependencies

```bash
# Ingest Lambda
cd lambdas/ingest
npm install

# ReadRecent Lambda
cd ../read-recent
npm install

cd ../..
```

### Step 5: Configure Terraform Variables

Create `infrastructure/terraform/terraform.tfvars`:

```hcl
aws_region = "us-east-1"
environment = "dev"
project_name = "log-service"

# Optional: Override defaults
dynamodb_billing_mode = "PAY_PER_REQUEST"
lambda_runtime = "nodejs20.x"
```

### Step 6: Initialize Terraform

```bash
cd infrastructure/terraform

terraform init
```

Expected output:
```
Initializing the backend...
Initializing provider plugins...
Terraform has been successfully initialized!
```

### Step 7: Plan Deployment

Review what will be created:

```bash
terraform plan
```

Review the output carefully. You should see:
- 1 DynamoDB table
- 2 Lambda functions
- 2 IAM roles
- 2 IAM policies
- 2 Lambda function URLs
- CloudWatch log groups

### Step 8: Deploy Infrastructure

```bash
terraform apply

# Review the plan
# Type 'yes' to confirm
```

Expected output:
```
Apply complete! Resources: 10 added, 0 changed, 0 destroyed.

Outputs:
ingest_function_url = "https://abc123.lambda-url.us-east-1.on.aws/"
read_recent_function_url = "https://def456.lambda-url.us-east-1.on.aws/"
dynamodb_table_name = "log-service-dev-LogEntries"
```

### Step 9: Save Function URLs

```bash
# Save outputs to a file
terraform output -json > ../../deployment-outputs.json

# Or export as environment variables
export INGEST_URL=$(terraform output -raw ingest_function_url)
export READ_URL=$(terraform output -raw read_recent_function_url)
```

## Testing the Deployment

### Test Ingest Lambda

```bash
curl -X POST $INGEST_URL \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "info",
    "message": "Test log entry"
  }'
```

Expected response:
```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "dateTime": "2025-11-08T10:30:45.123Z"
}
```

### Test ReadRecent Lambda

```bash
curl $READ_URL
```

Expected response:
```json
{
  "count": 1,
  "logs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "dateTime": "2025-11-08T10:30:45.123Z",
      "severity": "info",
      "message": "Test log entry"
    }
  ]
}
```

### Bulk Testing

```bash
# Create 10 test logs
for i in {1..10}; do
  curl -X POST $INGEST_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"severity\": \"info\",
      \"message\": \"Test log entry $i\"
    }"
  sleep 0.1
done

# Retrieve recent logs
curl $READ_URL | jq .
```

## Monitoring

### View Lambda Logs

```bash
# Ingest Lambda logs
aws logs tail /aws/lambda/log-service-dev-ingest --follow

# ReadRecent Lambda logs
aws logs tail /aws/lambda/log-service-dev-read-recent --follow
```

### CloudWatch Metrics

View in AWS Console:
1. Navigate to CloudWatch → Metrics
2. Select Lambda namespace
3. View metrics: Invocations, Duration, Errors, Throttles

### DynamoDB Metrics

```bash
# Get table description
aws dynamodb describe-table --table-name log-service-dev-LogEntries

# View metrics in CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=log-service-dev-LogEntries \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

## Updating the Deployment

### Update Lambda Code

```bash
# Make changes to Lambda code
# Then re-apply Terraform
cd infrastructure/terraform
terraform apply
```

Terraform will detect changes and update only the modified resources.

### Update Infrastructure

```bash
# Modify Terraform files
# Plan changes
terraform plan

# Apply changes
terraform apply
```

## Teardown (Cleanup)

### Option 1: Destroy All Resources

```bash
cd infrastructure/terraform
terraform destroy

# Review what will be deleted
# Type 'yes' to confirm
```

### Option 2: Delete Specific Resources

```bash
# Remove specific resource
terraform destroy -target=aws_lambda_function.ingest
```

### Option 3: Manual Cleanup

If Terraform fails:

```bash
# Delete Lambda functions
aws lambda delete-function --function-name log-service-dev-ingest
aws lambda delete-function --function-name log-service-dev-read-recent

# Delete DynamoDB table
aws dynamodb delete-table --table-name log-service-dev-LogEntries

# Delete IAM roles (after detaching policies)
aws iam delete-role --role-name log-service-dev-ingest-role
aws iam delete-role --role-name log-service-dev-read-recent-role

# Delete CloudWatch log groups
aws logs delete-log-group --log-group-name /aws/lambda/log-service-dev-ingest
aws logs delete-log-group --log-group-name /aws/lambda/log-service-dev-read-recent
```

## Troubleshooting

### Issue: Terraform Init Fails

**Error**: "Error configuring the backend"

**Solution**:
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify S3 bucket exists
aws s3 ls s3://<bucket-name>

# Remove backend and reinitialize
rm -rf .terraform
terraform init
```

### Issue: Lambda Function URL Returns 403

**Error**: "Forbidden"

**Solution**:
```bash
# Check Lambda function URL auth type
aws lambda get-function-url-config --function-name log-service-dev-ingest

# Should be AuthType: NONE for public access
# If AWS_IAM, requests must be signed
```

### Issue: DynamoDB Write Errors

**Error**: "ProvisionedThroughputExceededException"

**Solution**:
```bash
# Switch to on-demand billing mode
# Update terraform.tfvars:
# dynamodb_billing_mode = "PAY_PER_REQUEST"

terraform apply
```

### Issue: Lambda Timeout

**Error**: "Task timed out after 10.00 seconds"

**Solution**:
```bash
# Increase timeout in Terraform
# lambda.tf:
# timeout = 30

terraform apply
```

## Security Hardening

### 1. Enable AWS_IAM Authentication

Update `lambda.tf`:

```hcl
resource "aws_lambda_function_url" "ingest" {
  function_name      = aws_lambda_function.ingest.function_name
  authorization_type = "AWS_IAM"  # Changed from NONE
}
```

Sign requests with AWS SigV4:

```javascript
const AWS = require('aws-sdk');
const fetch = require('node-fetch');

const signer = new AWS.Signers.V4(request, 'lambda');
signer.addAuthorization(credentials, new Date());
```

### 2. Enable CORS

```hcl
resource "aws_lambda_function_url" "ingest" {
  function_name      = aws_lambda_function.ingest.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["https://yourdomain.com"]
    allow_methods = ["POST"]
    allow_headers = ["content-type"]
    max_age       = 86400
  }
}
```

### 3. Enable Encryption

DynamoDB encryption (already enabled by default):

```hcl
resource "aws_dynamodb_table" "log_entries" {
  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb.arn  # Optional: use CMK
  }
}
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Log Service

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Terraform Init
        run: terraform init
        working-directory: infrastructure/terraform

      - name: Terraform Plan
        run: terraform plan
        working-directory: infrastructure/terraform

      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: infrastructure/terraform
```

## Cost Estimation

### Monthly Cost Breakdown (Low Traffic)

Assumptions:
- 10,000 log writes/day = 300,000/month
- 1,000 reads/day = 30,000/month

**DynamoDB** (On-Demand):
- Writes: 300,000 × $1.25/million = $0.38
- Reads: 30,000 × $0.25/million = $0.01
- Storage: 1GB × $0.25/GB = $0.25
- **Subtotal: $0.64/month**

**Lambda**:
- Invocations: 330,000 × $0.20/million = $0.07
- Compute: 330,000 × 100ms × 256MB = minimal
- **Subtotal: $0.10/month**

**CloudWatch Logs**:
- Ingestion: 100MB × $0.50/GB = $0.05
- Storage: 1GB × $0.03/GB = $0.03
- **Subtotal: $0.08/month**

**Total: ~$0.82/month** (for low traffic)

### Medium Traffic (100x)

- 1M writes/day, 100K reads/day
- **Estimated: $60-80/month**

Consider switching to provisioned capacity at this scale.

## Next Steps

1. Review IMPLEMENTATION_PLAN.md for development timeline
2. Implement Lambda functions (see `/lambdas` directory)
3. Write Terraform configuration (see `/infrastructure/terraform`)
4. Add automated tests
5. Set up CI/CD pipeline
6. Monitor and optimize costs

## Support

For issues or questions:
- Check CloudWatch Logs for error details
- Review AWS service quotas
- Consult AWS documentation
- Open GitHub issue in this repository
