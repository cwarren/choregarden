# Ops-Lambdas Documentation

Operational AWS Lambda functions for Chore Garden system administration and automation tasks.

## Overview

The ops-lambdas provide serverless operational capabilities for the Chore Garden system, handling tasks that are infrequent but critical, such as database migrations, system maintenance, and deployment automation.

- **Serverless**: Event-driven execution with no persistent infrastructure costs
- **Docker-Based Builds**: All builds use Docker containers, eliminating local toolchain dependencies
- **Multi-Language Support**: Java (Gradle), Node.js, and potentially other runtimes
- **Cost-Effective**: Pay-per-execution model for infrequent operational tasks

## Lambda Functions

### Migration Lambda (`migration-lambda/`)
- **Purpose**: Database schema migrations using Flyway
- **Runtime**: Java 21 with AWS Lambda Java runtime
- **Build System**: Gradle via Docker container
- **Key Features**:
  - Flyway integration for PostgreSQL migrations
  - AWS Secrets Manager integration for database credentials
  - S3 integration for migration artifacts and logging
  - Error handling and rollback capabilities


## Docker-Based Build System

### Philosophy
All ops-lambdas use Docker for builds to ensure:
- **Consistency**: Same build environment regardless of local machine setup
- **Dependency Isolation**: No need for local Java/Gradle/Node installations
- **Reproducibility**: Identical builds across development and CI/CD environments
- **Toolchain Management**: Docker containers provide specific versions of build tools

### Build Process

**Java Lambdas (Gradle):**
```dockerfile
# Multi-stage Docker build
FROM gradle:8.7.0-jdk21 AS build
WORKDIR /workspace
COPY . .
RUN gradle clean build --no-daemon

FROM public.ecr.aws/lambda/java:21
COPY --from=build /workspace/build/distributions/*.zip /tmp/
RUN unzip /tmp/*.zip -d ${LAMBDA_TASK_ROOT}
```

**Node.js Lambdas:**
```dockerfile
# Single-stage build for Node.js
FROM public.ecr.aws/lambda/nodejs:20
COPY package*.json ./
RUN npm ci --only=production
COPY . .
```

### Development Workflow

1. **Local Development**
   ```powershell
   # Build using Docker (no local Java/Gradle required)
   cd ops-lambdas/migration-lambda
   docker build -t migration-lambda .
   ```

2. **Testing**
   ```powershell
   # Run container locally for testing
   docker run --rm migration-lambda
   ```

3. **Deployment**
   - Docker images pushed to ECR
   - Lambda functions updated with new container images
   - Terraform manages Lambda function configuration

## Configuration Management

### Environment Variables
- **Database Configuration**: Connection strings, credentials references
- **AWS Configuration**: Region, service endpoints, resource names
- **Application Configuration**: Feature flags, operational parameters

### Secrets Management
- **AWS Secrets Manager**: Database credentials, API keys
- **Parameter Store**: Non-sensitive configuration values
- **Environment-Specific**: Separate configurations for dev/prod

### IAM Permissions
- **Least Privilege**: Each Lambda has minimal required permissions
- **Resource-Specific**: Permissions scoped to specific S3 buckets, RDS instances
- **Execution Role**: Separate IAM roles per Lambda function

## Operational Patterns

### Database Migrations
```java
// Migration Lambda execution flow
1. Retrieve database credentials from Secrets Manager
2. Download migration files from S3 or embedded resources
3. Execute Flyway migration against target database
4. Log results to CloudWatch and S3
5. Return success/failure status for CI/CD pipeline
```

### Error Handling
- **Retry Logic**: Built-in retry for transient failures
- **Logging**: Comprehensive CloudWatch logging
- **Notifications**: SNS/SES integration for critical failures
- **Rollback**: Automated rollback procedures for failed migrations

### Monitoring
- **CloudWatch Metrics**: Execution duration, success/failure rates
- **CloudWatch Logs**: Detailed execution logs and error traces


## Deployment Integration

TBD

### CI/CD Pipeline
```yaml
# GitHub Actions workflow example
- name: Build Migration Lambda
  run: |
    cd ops-lambdas/migration-lambda
    docker build -t $ECR_REGISTRY/migration-lambda:$GITHUB_SHA .
    docker push $ECR_REGISTRY/migration-lambda:$GITHUB_SHA

- name: Update Lambda Function
  run: |
    aws lambda update-function-code \
      --function-name migration-lambda \
      --image-uri $ECR_REGISTRY/migration-lambda:$GITHUB_SHA
```

### Terraform Integration
```hcl
# Lambda function managed via Terraform
resource "aws_lambda_function" "migration_lambda" {
  function_name = "choregarden-migration-lambda"
  role         = aws_iam_role.migration_lambda_role.arn
  
  package_type = "Image"
  image_uri    = "${aws_ecr_repository.migration_lambda.repository_url}:latest"
  
  timeout = 300
  memory_size = 512
}
```

## Local Development Setup

### Prerequisites
- Docker and Docker Compose
- AWS CLI configured with appropriate permissions
- Access to development environment secrets

### Development Workflow

1. **Clone and Setup**
   ```powershell
   cd ops-lambdas/migration-lambda
   cp sample.env .env
   # Configure .env with development settings
   ```

2. **Build and Test Locally**
   ```powershell
   # Build using Docker
   docker build -t migration-lambda-local .
   
   # Test locally with sample event
   docker run --rm --env-file .env migration-lambda-local
   ```

3. **Deploy to Development Environment**
   ```powershell
   # Push to ECR and update Lambda function
   # (Typically handled by CI/CD pipeline)
   ```

## Troubleshooting

### Common Issues

**Build Failures:**
- Verify Docker is running and accessible
- Check Dockerfile syntax and base image availability
- Ensure all dependencies are properly declared

**Runtime Errors:**
- Check CloudWatch logs for detailed error traces
- Verify IAM permissions for AWS service access
- Validate environment variable configuration

**Deployment Issues:**
- Ensure ECR repository exists and is accessible
- Check Lambda function configuration matches container requirements
- Verify Terraform state and resource configuration

## Future Enhancements

### Near-Term
- Enhanced error handling and retry logic
- Integration with SNS for operational notifications
- Automated testing framework for Lambda functions
- Performance optimization and cold start reduction

### Medium-Term
- Additional operational Lambdas (backup, cleanup, monitoring)
- Integration with AWS Step Functions for complex workflows
- Enhanced logging and monitoring capabilities
- Security scanning and vulnerability management

### Long-Term
- Migration to ARM-based Lambda runtime for cost optimization
- Integration with AWS Lambda Extensions for enhanced capabilities
- Advanced deployment strategies (blue-green, canary)
- Multi-region deployment and disaster recovery automation
