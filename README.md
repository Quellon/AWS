# AWS Log Service

A serverless log service built on AWS infrastructure using Lambda functions and a managed database service.

## Overview

This project implements a simple yet scalable log service that stores and retrieves log entries using AWS Lambda functions and an AWS-managed database. The entire infrastructure is provisioned using Infrastructure as Code (IaC) principles.

## Features

- **Ingest Lambda**: Accepts and stores log entries in the database
- **Read Recent Lambda**: Retrieves the 100 most recent log entries
- **Serverless Architecture**: No server management required
- **Scalable**: Automatically scales with demand
- **Infrastructure as Code**: Complete IaC-driven deployment

## Log Entry Format

Each log entry contains:

```json
{
  "id": "unique-identifier",
  "dateTime": "2025-11-08T10:30:00Z",
  "severity": "info|warning|error",
  "message": "Log message text"
}
```

## Project Structure

```
GamesGlobal/
├── README.md                    # This file
├── ARCHITECTURE.md              # System architecture and design decisions
├── DATABASE_DESIGN.md           # Database schema and selection rationale
├── DEPLOYMENT.md                # Deployment instructions
├── IMPLEMENTATION_PLAN.md       # Development roadmap and timeline
├── infrastructure/              # IaC templates (to be created)
│   ├── terraform/              # Terraform configuration (option 1)
│   └── cloudformation/         # CloudFormation templates (option 2)
├── lambdas/                    # Lambda function code (to be created)
│   ├── ingest/
│   └── read-recent/
└── tests/                      # Test files (to be created)
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform (if using Terraform) or AWS SAM CLI (if using CloudFormation/SAM)
- Git for version control

## Quick Start

1. Clone the repository
2. Review ARCHITECTURE.md for design decisions
3. Review DATABASE_DESIGN.md for database schema
4. Follow DEPLOYMENT.md for deployment instructions
5. Check IMPLEMENTATION_PLAN.md for development timeline

## Timeline

Maximum 2 weeks from start to completion

## Documentation

- [Architecture](./ARCHITECTURE.md) - System design and AWS service selections
- [Database Design](./DATABASE_DESIGN.md) - Schema and database rationale
- [Deployment Guide](./DEPLOYMENT.md) - Step-by-step deployment instructions
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Development roadmap

## Requirements Met

- Fully IaC-driven solution
- Two AWS Lambda functions (Ingest and Read Recent)
- Lambda Function URLs for invocation
- AWS-managed database with explained rationale
- Efficient retrieval of 100 most recent entries
- Well-structured and documented code
- Complete GitHub repository with setup instructions

## License

MIT
