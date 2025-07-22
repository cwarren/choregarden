# Infrastructure Documentation

Terraform-managed AWS infrastructure for Chore Garden, supporting development and production environments.

## Overview

- **Infrastructure as Code**: Complete AWS infrastructure managed via Terraform
- **Multi-Environment**: Separate dev and prod environments with shared modules
- **Cost-Optimized**: Resource sizing and configuration optimized for cost efficiency
- **Security-First**: VPC isolation, least-privilege IAM, encryption at rest and in transit

## Architecture Components

### Core Infrastructure Modules

**VPC & Networking** (`modules/vpc/`)
- Private/public subnet architecture
- NAT Gateway for outbound connectivity
- Security groups with minimal required access
- DNS resolution and hostnames enabled

**Application Backend** (`modules/app_backend/`)
- ECS Fargate cluster for containerized backend
- Application Load Balancer with health checks
- Auto-scaling based on CPU and memory utilization
- CloudWatch logging and monitoring

**Database** (`modules/rds_postgres/`)
- PostgreSQL on AWS RDS with automated backups
- Multi-AZ deployment for high availability (production)
- Encryption at rest and in transit
- Connection pooling and performance insights

**Authentication** (`modules/cognito/`)
- AWS Cognito User Pool for user management
- JWT token configuration and validation
- Password policies and MFA support
- Social login provider configuration (ready)

**API Gateway** (`modules/api_gateway/`)
- REST API gateway for backend services
- Request/response transformation
- JWT authorization integration
- Rate limiting and throttling

**Frontend Hosting** (`modules/frontend_static_site/`)
- S3 bucket for static site hosting
- CloudFront CDN for global content delivery
- SSL/TLS certificates via AWS Certificate Manager
- Custom domain configuration

**Container Registry** (`modules/ecr_repository/`)
- Private Docker image repositories
- Image lifecycle policies for cost optimization
- Cross-region replication support
- Vulnerability scanning enabled

**Security & Access** (`modules/security/`, `modules/iam_github_oidc/`)
- IAM roles with least-privilege permissions
- GitHub OIDC for CI/CD authentication
- AWS Secrets Manager for sensitive configuration
- Security group rules for network isolation

**Operational Tools** (`modules/bastion/`)
- Bastion host for secure database access
- Session Manager integration for SSH-free access
- Temporary access patterns for development

### Environment Structure

**Development** (`envs/dev/`)
- Cost-optimized resource sizing
- Single-AZ deployment for cost savings
- Relaxed security policies for development ease
- Shared NAT Gateway to minimize costs

**Production** (`envs/prod/`)
- High-availability Multi-AZ deployment
- Production-grade security configurations
- Reserved instances for predictable workloads
- Enhanced monitoring and alerting

## Deployment Process

NOTE: this outlines the manual process, but this should be driven by CI/CD (especially for production)

### Initial Setup

1. **Configure AWS Credentials**
   ```powershell
   aws configure --profile choregarden-dev
   # Configure access key, secret key, region
   ```

2. **Initialize Terraform**
   ```powershell
   cd infrastructure/envs/dev
   cp sample-terraform-tfvars terraform.tfvars
   # Edit terraform.tfvars with your configuration
   terraform init
   ```

3. **Plan and Apply**
   ```powershell
   terraform plan
   terraform apply
   ```

### Environment Management

**Development Environment:**
```powershell
cd infrastructure/envs/dev
terraform plan    # Review changes
terraform apply   # Apply changes
terraform destroy # Clean up (when needed)
```

**Production Environment:**

TBD

### State Management
- **Backend**: S3 bucket with DynamoDB locking
- **State Files**: Separate per environment
- **Versioning**: S3 versioning enabled for rollback
- **Encryption**: State files encrypted at rest

## Configuration Management

### Variable Structure
```hcl
# Environment-specific variables in terraform.tfvars
aws_region = "us-east-1"
aws_profile = "choregarden-dev"
environment = "dev"
create_nat_gateway = false  # Cost optimization for dev

# Module-specific configuration
database_instance_class = "db.t3.micro"  # Dev sizing
backend_cpu = 256    # Fargate CPU units
backend_memory = 512 # Fargate memory MB
```

### Secrets Management
- **Development**: Local environment files and Terraform variables
- **Production**: AWS Secrets Manager integration
- **CI/CD**: GitHub Actions secrets and OIDC roles
- **Database**: Auto-generated passwords stored in Secrets Manager

### Resource Tagging
```hcl
# Consistent tagging across all resources
tags = {
  Environment = var.environment
  Project     = "choregarden"
  ManagedBy   = "terraform"
  Owner       = "infrastructure-team"
  CostCenter  = "development"
}
```

## Cost Optimization Strategies

### Current Optimizations
- **Development Environment**:
  - Single NAT Gateway instead of one per AZ
  - Smaller instance sizes (t3.micro, t3.small)
  - Single-AZ RDS deployment
  - Spot instances where appropriate

- **Production Environment**:
TBD, but likely covers
  - Reserved instances for predictable workloads
  - Auto-scaling with appropriate limits
  - CloudFront caching to reduce origin load
  - S3 lifecycle policies for log retention

### Monitoring and Alerts
TBD, but likely covers
- **Cost Alerts**: Budget alerts for monthly spend limits
- **Resource Utilization**: CloudWatch metrics for right-sizing
- **Usage Patterns**: Regular review of resource utilization
- **Scheduled Scaling**: Auto-scaling schedules for predictable patterns

## Security Architecture

### Network Security
- **VPC Isolation**: Private subnets for backend and database
- **Security Groups**: Minimal required access between components
- **NACLs**: Additional network-level access controls
- **VPC Flow Logs**: Network traffic monitoring and analysis

### Access Control
- **IAM Roles**: Service-specific roles with minimal permissions
- **OIDC Integration**: GitHub Actions authentication without long-lived keys
- **MFA Requirements**: Multi-factor authentication for administrative access
- **Audit Logging**: CloudTrail for all API activity

### Data Protection
- **Encryption at Rest**: All storage encrypted (RDS, S3, EBS)
- **Encryption in Transit**: TLS/SSL for all communication
- **Key Management**: AWS KMS for encryption key management
- **Secret Rotation**: Automatic rotation for database credentials

## Monitoring and Observability

### CloudWatch Integration
partly TBD, but will cover at least
- **Application Logs**: Centralized logging from all services
- **Infrastructure Metrics**: CPU, memory, disk, network utilization
- **Custom Metrics**: Application-specific performance indicators
- **Alarms and Alerts**: Automated alerting for critical issues

### Performance Monitoring
TBD, but likely covers
- **Database Performance**: RDS Performance Insights
- **Application Performance**: ECS service metrics
- **CDN Performance**: CloudFront analytics and caching metrics
- **API Performance**: API Gateway request and latency metrics

## Troubleshooting

### Common Issues

**Local environment variable not set:**
```powershell
$env:AWS_PROFILE="choregarden-dev"
```

**Terraform State Lock:**
```powershell
# If terraform apply fails with state lock
terraform force-unlock <LOCK_ID>
```

**Resource Dependency Issues:**
- Review terraform plan output for dependency cycles
- Use explicit depends_on when necessary
- Check for circular references in module definitions

**Permission Issues:**
- Verify AWS profile has required permissions
- Check IAM role policies for service permissions
- Validate OIDC role configuration for CI/CD

**Network Connectivity:**
- Verify security group rules allow required traffic
- Check route table configuration
- Validate NAT Gateway/Internet Gateway setup

### Environment Recovery
```powershell
# Import existing resources if state is lost
terraform import aws_s3_bucket.example bucket-name

# Refresh state to match actual infrastructure  
terraform refresh

# Plan and apply to restore desired state
terraform plan
terraform apply
```

## Future Considerations

*[Placeholders for detailed future planning]*

### Multi-Region Deployment
- Cross-region replication for disaster recovery
- Global load balancing and traffic routing
- Regional compliance and data residency

### Advanced Monitoring
- Application Performance Monitoring (APM) integration
- Distributed tracing for microservices
- Enhanced security monitoring and threat detection

### Automation Enhancements
- GitOps workflow for infrastructure changes
- Automated testing of Terraform configurations
- Policy-as-code for security and compliance

### Cost Optimization Evolution
- Serverless migration for appropriate workloads
- Advanced auto-scaling and predictive scaling

## Documentation Extensions Needed

*[Placeholders for future detailed documentation]*

- **Module Reference**: Detailed documentation for each Terraform module
- **Runbooks**: Step-by-step operational procedures
- **Disaster Recovery**: Backup and recovery procedures
- **Security Compliance**: Security audit and compliance procedures
- **Cost Analysis**: Detailed cost breakdown and optimization recommendations
- **Performance Tuning**: Infrastructure performance optimization guide
