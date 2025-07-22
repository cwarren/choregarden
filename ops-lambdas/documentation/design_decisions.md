# Ops-Lambdas Design Decisions

This document captures the context and rationale behind key decisions for the operational Lambda functions.

## Docker-Based Build Strategy

### Decision
Use Docker containers for all Lambda function builds instead of requiring local toolchain installations.

### Context
- Multiple Lambda functions using different runtimes (Java, Node.js)
- Need consistent builds across development and CI/CD environments
- Want to avoid local toolchain dependency management
- Solo development environment with varying local machine setups

### Rationale
1. **Dependency Isolation**: No need for local Java, Gradle, Node.js installations
2. **Consistency**: Identical build environment regardless of local machine
3. **Reproducibility**: Same build results across development, CI/CD, and team members
4. **Toolchain Versioning**: Docker images provide specific, controlled tool versions
5. **Developer Experience**: Simple `docker build` command works everywhere


## Java Runtime for Database Operations

### Decision
Use Java 21 with Gradle for database migration Lambda functions.

### Context
- Need robust database migration capabilities
- Flyway provides excellent Java integration
- Complex database operations require mature tooling
- AWS Lambda supports Java runtime efficiently

### Rationale
1. **Flyway Integration**: Best-in-class database migration tool with Java API
2. **AWS SDK**: Comprehensive Java SDK for AWS services integration
3. **Error Handling**: Java's exception handling suitable for complex operations
4. **Performance**: JVM performance acceptable for infrequent operational tasks
5. **Tooling**: Rich ecosystem for testing, debugging, and dependencies

### Libraries and Dependencies
```java
dependencies {
    implementation 'com.amazonaws:aws-lambda-java-core:1.2.3'
    implementation 'com.amazonaws:aws-lambda-java-events:3.11.4'
    implementation 'org.flywaydb:flyway-database-postgresql:10.22.0'
    implementation 'org.postgresql:postgresql:42.7.3'
    implementation 'com.amazonaws:aws-java-sdk-secretsmanager:1.12.698'
}
```

### Cold Start Considerations
- **Acceptable Trade-off**: Migration operations are infrequent, cold start delay acceptable
- **Optimization**: Future ARM64 runtime migration for better price/performance
- **Provisioned Concurrency**: Not needed for operational tasks

## Container Image Deployment

### Decision
Deploy Lambda functions as container images rather than ZIP packages.

### Context
- Java applications with multiple dependencies
- Docker-based build process already in place
- Need flexibility for future runtime requirements
- Want consistent deployment artifact format

### Rationale
1. **Size Flexibility**: Container images support up to 10GB vs 250MB ZIP limit
2. **Build Integration**: Natural fit with Docker-based build process
3. **Runtime Control**: More control over runtime environment and dependencies
4. **Future Flexibility**: Easier to add system dependencies or tools
5. **Consistency**: Same artifact format across all environments

### Deployment Process
```powershell
# Build and push to ECR
docker build -t migration-lambda .
docker tag migration-lambda:latest $ECR_URI/migration-lambda:latest
docker push $ECR_URI/migration-lambda:latest

# Update Lambda function
aws lambda update-function-code \
  --function-name migration-lambda \
  --image-uri $ECR_URI/migration-lambda:latest
```

### Trade-offs
- **Deployment Time**: Container image deployment slower than ZIP
- **Storage Cost**: ECR storage costs for container images
- **Complexity**: More moving parts than simple ZIP deployment

## Container Tagging Strategy: 'latest' Tag

### Decision
Use 'latest' tag for container images instead of semantic versioning or commit-based tags.

### Context
- Solo development with frequent iterations
- Simple deployment pipeline without complex release management
- Need for straightforward container image management
- Operational Lambda functions with infrequent but critical updates

### Rationale
1. **Simplicity**: Single tag to manage, no version coordination complexity
2. **Development Velocity**: Fast iteration without tag management overhead
3. **Operational Focus**: Lambda functions are operational tools, not versioned products
4. **Deployment Simplicity**: Always deploy the most recent build without tag decisions
5. **Solo Development**: No need for parallel version support or rollback complexity

### Implementation
```powershell
# Simple tagging and deployment
docker build -t migration-lambda .
docker tag migration-lambda:latest $ECR_URI/migration-lambda:latest
docker push $ECR_URI/migration-lambda:latest

# Lambda always uses latest
aws lambda update-function-code \
  --function-name migration-lambda \
  --image-uri $ECR_URI/migration-lambda:latest
```

### Trade-offs
- **Rollback Complexity**: Cannot easily rollback to specific previous versions
- **Deployment Coordination**: All environments use same 'latest' image
- **Audit Trail**: Less precise tracking of what version is deployed where
- **Parallel Development**: Would complicate multi-developer workflows

### Future Evolution
**Consider semantic versioning when:**
- Multiple developers require parallel development
- Need for production rollback to specific versions
- Complex deployment pipelines with staging requirements
- Compliance requirements for version tracking

**Migration Strategy:**
- Implement Git commit SHA tagging first
- Add semantic versioning for production releases
- Maintain 'latest' for development convenience

## Multi-Language Support Strategy

### Decision
Support multiple programming languages (Java, Node.js, Python) based on use case requirements.

### Context
- Different operational tasks have different optimal languages
- Java excellent for database operations (Flyway)
- Node.js optimal for lightweight API integrations
- Python has great data analysic tooling
- Want to use best tool for each job

### Language Selection Criteria
**Java for:**
- Database migrations and schema operations
- Complex business logic requiring strong typing
- Integration with enterprise-grade libraries (Flyway)
- Operations requiring robust error handling

**Node.js for:**
- Simple API integrations and webhooks
- Quick operational scripts and utilities
- JSON processing and transformation
- Lightweight monitoring and alerting functions

**Python for:**
- Rich data analysis

### Template Approach
```
ops-lambdas/
└── migration-lambda/    # Java - Complex database operations
```

### Consistency Considerations
- **Build Process**: Consistent Docker-based builds across languages
- **Configuration**: Standardized environment variable patterns
- **Monitoring**: Common CloudWatch logging and metrics approaches
- **IAM Roles**: Similar permission patterns adapted per language needs

## Secrets Management Integration

### Decision
Use AWS Secrets Manager for sensitive operational data (database credentials, API keys).

### Context
- Lambda functions need database access credentials
- Security best practices require encrypted secret storage
- Need automatic secret rotation capabilities
- Must integrate with existing AWS infrastructure

### Implementation Pattern
```java
// Java example for database credentials
private DatabaseConfig getDatabaseConfig() {
    SecretsManagerClient client = SecretsManagerClient.create();
    GetSecretValueRequest request = GetSecretValueRequest.builder()
        .secretId("choregarden-db-credentials")
        .build();
    
    String secretString = client.getSecretValue(request).secretString();
    return parseSecrets(secretString);
}
```

### Rationale
1. **Security**: Encrypted at rest and in transit
2. **Rotation**: Automatic credential rotation support
3. **Access Control**: IAM-based access control per Lambda
4. **Audit Trail**: CloudTrail logging of secret access
5. **Integration**: Native AWS service integration

### Cost Considerations
- **Per Secret Cost**: $0.40/month per secret acceptable for operational use
- **API Calls**: Minimal API call volume for infrequent operations
- **Security Value**: Cost justified by security benefits

## Error Handling and Monitoring Strategy

### Decision
Implement comprehensive error handling with CloudWatch integration for all Lambda functions.

### Approach
```java
// Java error handling pattern
try {
    executeMigration();
    return successResponse();
} catch (FlywayException e) {
    logger.error("Migration failed", e);
    publishMetric("MigrationFailure", 1);
    return errorResponse(e);
} catch (Exception e) {
    logger.error("Unexpected error", e);
    publishMetric("UnexpectedError", 1);
    throw new RuntimeException(e);
}
```

### Monitoring Components
1. **CloudWatch Logs**: Detailed execution logging with structured formats
2. **CloudWatch Metrics**: Success/failure rates, execution duration
3. **CloudWatch Alarms**: Automated alerting for critical failures
4. **X-Ray Tracing**: Distributed tracing for complex operations (future)

### Rationale
- **Operational Visibility**: Clear insight into Lambda execution status
- **Debugging**: Detailed logs for troubleshooting failures
- **Alerting**: Proactive notification of operational issues
- **Metrics**: Performance tracking and optimization guidance

## Future Architectural Considerations

### ARM64 Runtime Migration
**Current**: x86_64 Lambda runtime  
**Future Consideration**: ARM64 (Graviton2) for improved price/performance
- **Triggers**: Cost optimization requirements, performance improvements
- **Implementation**: Update base images to ARM64 variants
- **Testing**: Validate functionality on ARM64 architecture

### Step Functions Integration
**Current**: Individual Lambda function executions  
**Future**: AWS Step Functions for complex operational workflows
- **Use Cases**: Multi-step migrations, orchestrated deployments
- **Benefits**: Visual workflow management, error handling, retry logic
- **Implementation**: Define state machines for complex operations

### Lambda Extensions
**Current**: Basic Lambda runtime  
**Future**: Lambda Extensions for enhanced capabilities
- **Use Cases**: Enhanced monitoring, caching, secret prefetching
- **Benefits**: Improved performance, reduced cold starts
- **Implementation**: Custom extensions for specific operational needs
