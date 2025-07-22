# Design Decisions

This document captures the context and rationale behind key architectural and implementation decisions in Chore Garden.

## CI/CD Strategy: Dev → Prod (No Staging)

### Decision
Use a simplified two-environment approach: development → production, skipping a traditional staging environment.

### Context
- Solo development project
- Cost-conscious approach required
- MVP scope with limited complexity
- Household/small group usage (higher tolerance for brief downtime)

### Rationale
**Why skip staging:**
1. **Cost efficiency**: Staging would double AWS infrastructure costs
2. **Development velocity**: Fewer environments = faster iteration
3. **Complexity reduction**: Less CI/CD complexity and maintenance
4. **Risk tolerance**: Non-critical application can tolerate occasional production issues

**Safety measures instead:**
- Comprehensive dev environment that mirrors production
- Robust automated testing suite
- Safe deployment practices (health checks, rollback procedures)
- Deployment during low-usage periods

### Future Evolution
**Add staging when:**
- Multiple developers join the project
- User base becomes business-critical
- Complex features require production-like testing
- Revenue generation makes downtime costly

**How to add:**
- Create staging AWS environment via Terraform
- Update CI/CD pipeline: `dev → staging → prod`
- Add staging-specific configuration
- Implement automated promotion rules

## Authentication: Cognito + Application Database

### Decision
Use AWS Cognito for authentication combined with a separate application user database.

### Context
- Need secure, scalable authentication
- Require user profile data beyond basic auth
- Want to minimize custom authentication code
- Must integrate with AWS ecosystem

### Rationale
**Why Cognito:**
1. **Security**: Industry-standard JWT implementation
2. **Features**: Built-in password policies, MFA ready, social login
3. **Scalability**: Managed service handles scaling
4. **Integration**: Native AWS service integration

**Why separate app database:**
1. **Data ownership**: Full control over user profile data
2. **Flexibility**: Custom user attributes and relationships
3. **Performance**: Optimized queries for application needs
4. **Migration**: Easier to migrate auth providers if needed

### Trade-offs
- **Complexity**: Two user stores to manage
- **Consistency**: Potential sync issues between Cognito and app DB
- **Cost**: Additional database storage and operations

## Cloud Services Provider: AWS

see `/infrastructure/documentation/design_decisions/`

## Tech Stack: Node.js + React + PostgreSQL

### Decision
Modern JavaScript/TypeScript stack with relational database.

### Context
- Solo developer with strong JavaScript experience
- Need rapid development and iteration
- Require strong typing and maintainability
- Want mature ecosystem and tooling

### Rationale
**Node.js Backend:**
- Consistent language across frontend/backend
- Rich ecosystem (npm packages)
- Excellent TypeScript support
- Good AWS Lambda compatibility

**React Frontend:**
- Component-based architecture
- Large ecosystem and community
- PWA capabilities
- Mobile-responsive out of box

**PostgreSQL:**
- ACID compliance for data integrity
- Rich feature set (JSON, arrays, etc.)
- Excellent performance characteristics
- Strong AWS RDS support

**Ops-Lambdas:**
- Serverless functions for operational tasks
- Database migrations via Lambda (cost-effective, event-driven)
- Administrative operations without persistent infrastructure
- AWS-native integration for CI/CD triggers

## Monorepo Structure

### Decision
Single repository with multiple section and folders.

### Context
- Solo development simplifies coordination
- Shared types and utilities between services
- Simplified CI/CD deployment

### Rationale
**Benefits:**
1. **Coordination**: Easier cross-service changes
2. **Sharing**: Common types, utilities, documentation
3. **CI/CD**: Single pipeline for entire system
4. **Versioning**: Atomic changes across services

**Drawbacks:**
- Larger repository size
- Some coupling between services
- More complex CI/CD logic

### Future Evolution
**Consider splitting when:**
- Multiple developers need independent work
- Services have very different deployment cycles
- Repository becomes unwieldy large

## Infrastructure as Code: Terraform

see `/infrastructure/documentation/design_decisions/`


## Cost Optimization Strategy

### Decision
Prioritize cost-conscious architecture decisions throughout.

### Context
- Side project with limited budget
- Need to demonstrate cost-effective scaling
- Want to avoid surprise AWS bills
- Must balance cost with functionality

### Current Approach
1. **Serverless first**: Lambda for operations, S3 for static content
2. **Right-sizing**: Appropriate instance sizes, not over-provisioned
3. **Auto-scaling**: Scale down during low usage
4. **Reserved instances**: For predictable workloads
5. **Monitoring**: Cost alerts and regular reviews

### Specific Decisions
- **S3 + CloudFront** instead of EC2 for frontend hosting
- **Lambda** for database migrations and operations
- **ECS Fargate** instead of EC2 for backend (pay per use)
- **RDS** with appropriate instance sizing
- **No staging environment** to reduce costs

### Future Optimization
- Implement more aggressive auto-scaling
- Consider spot instances for non-critical workloads
- Optimize data storage and transfer costs
- Implement cost allocation tags
