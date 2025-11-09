#!/bin/bash

# Deployment script for AWS Log Service
set -e

echo "=================================="
echo "AWS Log Service - Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install Lambda dependencies
echo -e "${YELLOW}Step 1: Installing Lambda dependencies...${NC}"
cd lambdas/ingest
npm install --production
cd ../read-recent
npm install --production
cd ../..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Initialize Terraform
echo -e "${YELLOW}Step 2: Initializing Terraform...${NC}"
cd infrastructure/terraform
terraform init
echo -e "${GREEN}✓ Terraform initialized${NC}"
echo ""

# Step 3: Plan Terraform changes
echo -e "${YELLOW}Step 3: Planning Terraform deployment...${NC}"
terraform plan
echo ""

# Step 4: Apply Terraform
echo -e "${YELLOW}Step 4: Deploying infrastructure...${NC}"
read -p "Do you want to proceed with deployment? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
    terraform apply -auto-approve
    echo -e "${GREEN}✓ Deployment complete!${NC}"
    echo ""

    # Display outputs
    echo -e "${YELLOW}Deployment Information:${NC}"
    echo "=================================="
    terraform output
    echo "=================================="
else
    echo "Deployment cancelled."
    exit 1
fi

cd ../..
echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Test the Ingest function with the URL shown above"
echo "2. Test the ReadRecent function to retrieve logs"
echo "3. Check the DEPLOYMENT.md file for testing examples"
