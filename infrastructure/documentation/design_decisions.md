# Infrastructure Design Decisions

This document captures infrastructure-specific architectural decisions and their rationale.

## AWS as Cloud Provider

### Decision
Use Amazon Web Services (AWS) as the primary cloud provider for all infrastructure components.

### Context
- Need reliable, scalable cloud infrastructure
- Require comprehensive service ecosystem
- Want mature tooling and extensive documentation
- Must integrate with modern DevOps practices

### Rationale
1. **Service Breadth**: Complete ecosystem from compute to databases to AI/ML services
2. **Reliability**: Industry-leading SLA and uptime track record
3. **Security**: Comprehensive security services and compliance certifications
4. **Cost Management**: Sophisticated cost optimization tools and pricing models
5. **Community**: Large ecosystem of tools, documentation, and expertise
6. **Integration**: Excellent service integration (Cognito, API Gateway, ECS, RDS, etc.)
7. **Familiarity**: Knowledge and experience working in this particular ecosystem

### Alternatives Considered
- **Azure**: Good Microsoft tooling integration, but less familiar ecosystem
- **Google Cloud Platform**: Competitive pricing and good AI/ML services, but smaller overall service ecosystem
- **Multi-Cloud**: Added complexity and management overhead without clear benefits at current scale

### Trade-offs
- **Vendor Lock-in**: Deep integration with AWS services creates switching costs; terraform is theoretically general, but in practice has a lot of AWS-specific stuff
- **Complexity**: Rich service ecosystem can lead to over-engineering
- **Cost**: Premium pricing compared to some alternatives, but offset by operational efficiency

### Future Evolution
- Currently all-in on AWS for simplicity and integration benefits
- Multi-cloud consideration only if specific compliance or risk requirements emerge
- Cloud-agnostic architecture patterns where feasible without sacrificing AWS-native benefits

### Future Evolution
- Currently the app is using the Cognito Hosted UI: replace the hosted UI with a fully customized one built into the app (though still driven by Cognito under the hood)

## Terraform for Infrastructure as Code

### Decision
Use Terraform for all AWS infrastructure management.

### Context
- Need reproducible infrastructure
- Want version control for infrastructure changes
- Require multiple environment support
- Cost control and monitoring requirements

**Why not alternatives:**
- **CloudFormation**: Terraform more flexible and readable
- **CDK**: Adds complexity for simple infrastructure needs
- **Manual**: Not reproducible or version controlled

### Implementation Notes
- State stored in S3 with DynamoDB locking
- Separate state files per environment
- Modular structure for reusability

### Implementation
```hcl
# Modular structure
infrastructure/
├── modules/          # Reusable infrastructure components
├── envs/dev/        # Development environment configuration
├── envs/prod/       # Production environment configuration
└── shared/          # Shared resources across environments
```

### Rationale
1. **Declarative**: Infrastructure state clearly defined and version controlled
2. **Modularity**: Reusable components across environments
3. **Provider Support**: Excellent AWS provider with comprehensive resource support
4. **State Management**: Robust state management with S3 backend and locking
5. **Team Collaboration**: Plan/apply workflow enables safe team collaboration

### Trade-offs
- **Learning Curve**: Terraform-specific syntax and concepts
- **State Complexity**: State file management requires careful attention
- **Provider Lag**: Some AWS features take time to appear in Terraform provider


## Multi-Environment Strategy: Dev/Prod Only

### Decision
Implement only development and production environments, skipping traditional staging.

### Structure
```
environments/
├── dev/     # Development environment (cost-optimized)
└── prod/    # Production environment (high-availability)
```

### Rationale
1. **Cost Efficiency**: Staging would triple infrastructure costs
2. **Simplicity**: Fewer environments reduce operational overhead
3. **Development Speed**: Faster iteration without staging bottleneck
4. **Resource Focus**: Investment in better dev environment and testing

### Risk Mitigation
- **Comprehensive Dev Environment**: Production-like configuration in dev
- **Infrastructure Testing**: Terraform validate and plan in CI/CD
- **Blue/Green Deployment**: Zero-downtime deployment strategy
- **Rollback Procedures**: Quick rollback capabilities for production issues

### Future Reconsideration
Add staging when:
- Team size grows beyond solo development
- Revenue-critical usage requires additional safety
- Complex infrastructure changes need production-like testing
- Customer SLA requirements demand higher reliability

## VPC Architecture: Public/Private Subnet Design

### Decision
Use traditional public/private subnet architecture with NAT Gateway.

### Implementation
```hcl
# Network architecture
VPC (10.0.0.0/16)
├── Public Subnets (10.0.101.0/24, 10.0.102.0/24)
│   ├── ALB (Application Load Balancer)
│   ├── NAT Gateway
│   └── Bastion Host (when needed)
└── Private Subnets (10.0.1.0/24, 10.0.2.0/24)
    ├── ECS Tasks (Backend)
    ├── RDS Database
    └── Lambda Functions
```

### Rationale
1. **Security**: Backend and database isolated from direct internet access
2. **Scalability**: Standard pattern that scales well with AWS services
3. **Flexibility**: Supports various deployment patterns (containers, serverless, etc.)
4. **Best Practices**: Aligns with AWS Well-Architected Framework

### Cost Optimization
- **Development**: Single NAT Gateway to reduce costs
- **Production**: Multi-AZ NAT Gateway for high availability
- **VPC Endpoints**: For AWS service access without NAT Gateway costs (future)

## ECS Fargate for Container Orchestration

### Decision
Use AWS ECS with Fargate for backend application hosting.

### Context
- Need containerized application deployment
- Want managed container orchestration
- Require auto-scaling capabilities
- Must minimize operational overhead

### Rationale
1. **Serverless Containers**: No EC2 instance management required
2. **Cost Efficiency**: Pay only for running tasks, automatic scaling
3. **AWS Integration**: Native integration with ALB, CloudWatch, IAM
4. **Simplicity**: Less complex than Kubernetes for single application


### Alternatives Considered
- **EKS**: More complex and expensive for single application
- **EC2 Direct**: Requires instance management and scaling logic
- **Lambda**: Cold start issues and runtime limitations for Express app
- **App Runner**: Newer service, less control over infrastructure

## RDS PostgreSQL Database Strategy

### Decision
Use AWS RDS PostgreSQL with automated backups and Multi-AZ for production.

### Rationale
1. **Managed Service**: Automated patching, backups, and maintenance
2. **Performance**: Performance Insights and query optimization tools
3. **Security**: Encryption at rest/transit, VPC isolation
4. **Reliability**: Multi-AZ deployment for production availability
5. **Scaling**: Easy vertical scaling and read replica options

### Cost Considerations
- **Development**: Single-AZ, smaller instances, shorter backup retention
- **Production**: Multi-AZ, appropriate sizing, longer backup retention
- **Future**: Read replicas for analytics workloads when needed

## S3 + CloudFront for Frontend Hosting

### Decision
Use S3 for static site hosting with CloudFront CDN for global distribution.

### Architecture
```
User Request → CloudFront → S3 Bucket (Origin)
              ↓
         Edge Caching
```

### Rationale
1. **Cost Efficiency**: S3 storage costs are minimal for static assets
2. **Global Performance**: CloudFront edge locations worldwide
3. **Scalability**: Handles traffic spikes automatically
4. **Security**: Origin Access Control (OAC) prevents direct S3 access
5. **SSL/TLS**: Free SSL certificates via AWS Certificate Manager

## GitHub Actions OIDC for CI/CD Authentication

### Decision
Use GitHub Actions with OIDC provider for AWS authentication instead of long-lived access keys.


### Rationale
1. **Security**: No long-lived AWS access keys in GitHub secrets
2. **Least Privilege**: Temporary credentials with specific permissions
3. **Audit Trail**: Clear attribution of actions to specific GitHub workflows
4. **Key Rotation**: No manual key rotation required
5. **Best Practice**: Recommended approach by both AWS and GitHub

### Benefits
- **Zero Secrets**: No AWS credentials stored in GitHub
- **Time-Limited**: Temporary credentials expire automatically
- **Repository-Scoped**: Permissions limited to specific repository
- **Branch-Aware**: Can restrict access to specific branches

## Secrets Management: AWS Secrets Manager

### Decision
Use AWS Secrets Manager for application secrets and database credentials.

### Rationale
1. **Security**: Encrypted storage with automatic rotation
2. **Integration**: Native ECS and Lambda integration
3. **Auditing**: Access logs and CloudTrail integration
4. **Compliance**: Meets security compliance requirements
5. **Automation**: Automatic credential rotation capabilities

### Cost Considerations
- **Per Secret Pricing**: $0.40/month per secret
- **API Calls**: $0.05 per 10,000 API calls
- **Cost vs Security**: Justified for production security requirements

## Cost Optimization Philosophy

### Decision
Prioritize cost optimization throughout infrastructure design while maintaining security and reliability.

### Cost Control Mechanisms
1. **Resource Tagging**: Comprehensive cost allocation tags
2. **Budget Alerts**: Automated alerts for spend thresholds
3. **Reserved Instances**: For predictable workloads
4. **Auto-scaling**: Scale down during low usage
5. **Lifecycle Policies**: Automatic cleanup of old resources

### Monitoring Approach
- **Cost Explorer**: Regular cost analysis and optimization
- **Right-sizing**: Ongoing resource utilization review
- **Usage Patterns**: Analysis to optimize resource allocation

## Future Infrastructure Considerations

### Multi-Region Architecture
**Triggers for Implementation:**
- Global user base requiring low latency
- Disaster recovery requirements
- Compliance with data residency laws

**Implementation Approach:**
- Primary/secondary region setup
- Cross-region replication for critical data
- DNS failover and traffic routing

### Microservices Readiness
**Current State:** Monolithic backend with modular infrastructure
**Future Evolution:**
- Service-specific ECS services
- API Gateway for service routing
- Service mesh for inter-service communication
- Separate databases per service (where appropriate)

### Serverless Migration Opportunities
**Candidates for Serverless:**
- Database migration operations (currently Lambda)
- Background job processing (BullMQ → SQS/Lambda)
- Authentication flows (custom authorizers)
- Data analytics and reporting

### Advanced Security Implementation
**Enhanced Security Measures:**
- WAF for application protection
- GuardDuty for threat detection
- Config for compliance monitoring
- Systems Manager for patch management
