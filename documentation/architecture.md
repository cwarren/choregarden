# System Architecture

Chore Garden follows a modern three-tier architecture deployed on AWS with Infrastructure as Code.

## High-Level Architecture

```
[Frontend (React)] ↔ [API Gateway] ↔ [Backend (Node.js)] ↔ [Database (PostgreSQL)]
                                           ↕
                                    [Cognito (Auth)]
                                           ↕
                                   [Lambda (Operations)]
```

## Component Overview

### Frontend
- **Technology**: React with Tailwind CSS
- **Hosting**: AWS S3 + CloudFront
- **Features**: Progressive Web App (PWA) capabilities, mobile-responsive

### Backend API
- **Technology**: Node.js with Express and TypeScript
- **Hosting**: AWS ECS/Fargate
- **Features**: RESTful API, JWT authentication, comprehensive error handling

### Database
- **Technology**: PostgreSQL
- **Hosting**: AWS RDS
- **Features**: Automated backups, encryption at rest, connection pooling

### Authentication
- **Technology**: AWS Cognito
- **Features**: User pools, JWT tokens, social login ready

### Job Processing (TBD)
- **Technology**: BullMQ
- **Hosting**: AWS ECS tasks
- **Features**: Background job processing, retry logic

### Operations (Ops-Lambdas)
- **Technology**: AWS Lambda functions
- **Purpose**: Operational and administrative tasks
- **Features**: Database migrations, deployment automation, maintenance tasks
- **Benefits**: Serverless execution, event-driven triggers, cost-effective for infrequent operations

### Infrastructure
- **Technology**: Terraform
- **Features**: Infrastructure as Code, environment isolation, cost optimization

## Security Architecture

### Authentication Flow
1. User authenticates with Cognito
2. Cognito returns JWT token
3. Frontend includes token in API requests
4. API Gateway validates token (production) or Backend validates token (development)
5. Backend processes authenticated requests

### Data Protection
- Encryption in transit (HTTPS/TLS)
- Encryption at rest (RDS, S3)
- Secrets managed via AWS Secrets Manager and GitHub secrets
- IAM roles with least-privilege access

### Network Security
- VPC with private subnets for backend/database
- - bastion spin up for direct access as needed, and shut down when not in use
- Security groups with minimal required access
- WAF protection for public-facing resources

## Deployment Architecture

### Environments
- **Local**: Docker, npm
- **Development / Integration**: AWS dev environment
- **Production**: Full AWS deployment

### CI/CD Pipeline
- **Source**: GitHub repository
- **Build**: GitHub Actions
- **Deploy**: Terraform + ECS deployment
- **Monitoring**: CloudWatch, application logs

## Data Architecture

### User Data Flow
1. User registration in Cognito
2. User profile creation in application database
3. Task/chore data stored in PostgreSQL
4. Background processing via BullMQ

### Database
- AWS RDS, PostgreSQL
see the [/database/documentation/](/database/documentation/README.md) for details on schema et al

## Scalability Considerations

### Current Scale
- Designed for household/small group usage
- Single-region deployment
- Auto-scaling enabled for web tier

### Future Scale Options
- Multi-region deployment
- Caching layers
- Database read replicas
- CDN optimization
- Microservices architecture

## Cost Optimization

### Current Approach
- Serverless-first and on-demand where possible
- Auto-scaling with appropriate limits
- Reserved instances for predictable workloads
- Regular cost monitoring and optimization
- start and stop scripts for development, to turn of thing that have a passive, on-going cost

### Cost Controls
- Lambda for operational tasks
- S3 for static content
- CloudFront for global content delivery
- RDS with appropriate instance sizing
