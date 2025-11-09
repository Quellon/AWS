# Quick Start Guide

This guide will get you up and running with the AWS Log Service in 5 minutes.

## Prerequisites

✅ You should already have:
- AWS account with credentials configured (`aws configure`)
- Node.js v18+ installed
- Terraform v1.0+ installed

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

Run the deployment script:

```bash
./deploy.sh
```

This will:
1. Install npm dependencies for both Lambda functions
2. Initialize Terraform
3. Show you what will be created
4. Deploy everything to AWS
5. Display the Function URLs

### Option 2: Manual Deployment

#### Step 1: Install Dependencies

```bash
# Install Ingest Lambda dependencies
cd lambdas/ingest
npm install --production
cd ../..

# Install ReadRecent Lambda dependencies
cd lambdas/read-recent
npm install --production
cd ../..
```

#### Step 2: Deploy with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy
terraform apply
```

#### Step 3: Get Function URLs

After deployment:

```bash
terraform output
```

You'll see:
```
ingest_function_url = "https://xxxxxx.lambda-url.eu-north-1.on.aws/"
read_recent_function_url = "https://yyyyyy.lambda-url.eu-north-1.on.aws/"
```

## Testing

### Test Ingest Function

```bash
curl -X POST https://YOUR-INGEST-URL \
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
  "dateTime": "2025-11-09T14:30:00.123Z"
}
```

### Test ReadRecent Function

```bash
curl https://YOUR-READ-RECENT-URL
```

Expected response:
```json
{
  "count": 1,
  "logs": [
    {
      "logPartition": "LOGS",
      "dateTime": "2025-11-09T14:30:00.123Z",
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "severity": "info",
      "message": "Test log entry"
    }
  ]
}
```

## Project Structure

```
GamesGlobal/
├── lambdas/
│   ├── ingest/           # Ingest Lambda function
│   │   ├── index.js      # Handler code
│   │   └── package.json  # Dependencies
│   └── read-recent/      # ReadRecent Lambda function
│       ├── index.js      # Handler code
│       └── package.json  # Dependencies
├── infrastructure/
│   └── terraform/        # IaC configuration
│       ├── provider.tf   # AWS provider setup
│       ├── variables.tf  # Input variables
│       ├── dynamodb.tf   # DynamoDB table
│       ├── iam.tf        # IAM roles and policies
│       ├── lambda.tf     # Lambda functions
│       └── outputs.tf    # Output values
└── deploy.sh            # Automated deployment script
```

## Clean Up

To destroy all resources and avoid AWS charges:

```bash
cd infrastructure/terraform
terraform destroy
```

Type `yes` when prompted.

## Troubleshooting

### "Command not found: terraform"
- Run: `brew install hashicorp/tap/terraform`

### "Command not found: aws"
- Run: `brew install awscli`
- Then: `aws configure`

### "Error: No valid credential sources"
- Run: `aws configure`
- Enter your AWS Access Key ID and Secret Access Key

### Lambda errors
- Check CloudWatch Logs in AWS Console
- Or run: `aws logs tail /aws/lambda/log-service-dev-ingest --follow`

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
- Read [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) for schema explanation
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide
- Add tests (see tests/ folder structure)
- Set up CI/CD pipeline
- Add authentication to Function URLs

## Cost Estimate

With AWS Free Tier:
- **First year**: ~$0-5/month for light usage
- **After free tier**: ~$10-20/month for moderate usage

See [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) for detailed cost breakdown.

## Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review AWS CloudWatch logs
3. Verify IAM permissions
