# Backend Design Decisions

This document captures backend-specific architectural decisions and their rationale.

## Authentication Architecture: Dual-Mode JWT Validation

### Decision
Support both API Gateway-validated and direct backend JWT validation.

### Context
- Need to support local development (direct backend access)
- Production deployment uses API Gateway for JWT validation
- Want to minimize performance overhead in production
- Must maintain security in both modes

### Implementation
**API Gateway Mode (Production)**:
- API Gateway validates JWT and extracts user info
- Backend trusts pre-validated tokens
- Faster request processing
- Used when `API_GATEWAY_MODE=true`

**Direct Backend Mode (Development)**:
- Backend validates JWT against Cognito JWKS
- Full token signature verification
- Slower but more secure for untrusted environments
- Used for local development and testing

### Rationale
1. **Performance**: Production mode avoids duplicate JWT validation
2. **Development**: Local mode enables easy testing without API Gateway
3. **Security**: Both modes maintain appropriate security levels
4. **Flexibility**: Easy to switch between modes via configuration

### Trade-offs
- **Complexity**: Two authentication paths to maintain
- **Testing**: Must test both authentication modes
- **Configuration**: Environment-specific settings required

## Database Connection: Connection Pooling Strategy

### Decision
Use connection pooling with retry logic and graceful degradation.

### Implementation
```typescript
// Database configuration with retry logic
const pool = new Pool({
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10, // Maximum pool size
});
```

### Rationale
1. **Performance**: Reuse connections, avoid connection overhead
2. **Reliability**: Retry logic handles temporary database issues
3. **Resource Management**: Prevents connection leaks
4. **Scalability**: Pool size limits database connection usage

### Configuration Considerations
- **Local Development**: Smaller pool size (5-10 connections)
- **Production**: Larger pool based on expected concurrent users
- **AWS RDS**: Consider connection limits of chosen instance type

## Error Handling: Centralized Error Responses

### Decision
Centralized error handling in controllers with consistent response format.

### Implementation
```typescript
// Consistent error response format
{
  error: string,
  message: string,
  statusCode: number,
  timestamp: string
}
```

### Rationale
1. **Consistency**: All API errors follow same format
2. **Client Integration**: Frontend can reliably parse errors
3. **Debugging**: Structured error information
4. **Security**: Controlled error message exposure

### Error Categories
- **400 Bad Request**: Client input validation errors
- **401 Unauthorized**: Authentication failures
- **403 Forbidden**: Authorization failures
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Unexpected server errors

## Type Safety: Express Request Extensions

### Decision
Extend Express Request interface to include authenticated user data.

### Implementation
```typescript
// src/types/express.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        username: string;
        email: string;
      };
    }
  }
}
```

### Rationale
1. **Type Safety**: Compile-time checking for user data access
2. **IDE Support**: Better autocomplete and error detection
3. **Documentation**: Clear contract for authenticated requests
4. **Maintainability**: Easier refactoring with type safety

## Service Layer: Dependency Injection Pattern

### Decision
Use factory functions for service instantiation and dependency injection.

### Implementation
```typescript
// Service factory
export const createUserService = (pool: Pool) => {
  return new UserService(pool);
};

// Controller factory
export const createUserController = (userService: UserService) => {
  return {
    getUserProfile: (req: Request, res: Response) => { /* ... */ },
    updateUserProfile: (req: Request, res: Response) => { /* ... */ }
  };
};
```

### Rationale
1. **Testability**: Easy to inject mock dependencies for testing
2. **Flexibility**: Services can be reconfigured without changing consumers
3. **Single Responsibility**: Clear separation of concerns
4. **Initialization**: Controlled service startup and dependency resolution

### Benefits
- Easy unit testing with mocked dependencies
- Clear dependency relationships
- Simplified service configuration
- Better code organization

## Container Tagging Strategy: 'latest' Tag

### Decision
Use 'latest' tag for backend container images instead of semantic versioning or commit-based tags.

### Context
- Solo development with frequent backend iterations
- Continuous deployment pipeline for development environment
- Need for simple container image management
- Backend service with frequent feature updates and bug fixes

### Rationale
1. **Development Velocity**: Fast deployment cycles without version management overhead
2. **Simplicity**: Single tag strategy reduces CI/CD pipeline complexity
3. **Immediate Deployment**: Latest code changes immediately available for deployment
4. **Solo Development**: No parallel version requirements or team coordination needs
5. **Development Focus**: Emphasis on rapid iteration over formal release management

### Implementation
```yaml
# GitHub Actions deployment
- name: Build and push backend image
  run: |
    docker build -t choregarden-backend .
    docker tag choregarden-backend:latest $ECR_URI/choregarden-backend:latest
    docker push $ECR_URI/choregarden-backend:latest

# ECS service always uses latest
- name: Update ECS service
  run: |
    aws ecs update-service \
      --cluster choregarden-dev \
      --service backend \
      --force-new-deployment
```

### Trade-offs
- **Rollback Limitations**: Cannot rollback to specific previous versions easily
- **Production Risk**: Same image tag across environments increases deployment risk
- **Change Tracking**: Less granular tracking of what code version is deployed
- **Deployment Coordination**: All environments pull from same 'latest' image

### Current Mitigation Strategies
- **Health Checks**: Robust health checks ensure bad deployments are caught quickly
- **Monitoring**: Comprehensive monitoring detects issues immediately
- **Fast Recovery**: Quick revert by pushing previous commit and redeploying
- **Development Testing**: Thorough testing in development before production deployment

### Future Evolution
**Consider versioned tagging when:**
- Multiple developers requiring branch-based deployments
- Production stability requires rollback to specific versions
- Staging environment needs independent version management
- Compliance requirements for deployment tracking

**Migration Path:**
- Git commit SHA tagging for development environments
- Semantic versioning for production releases
- Blue-green deployment strategy for zero-downtime updates

## Database Access Layer: SQL vs ORM (Pending Decision)

### Decision
**PENDING** - Currently using raw SQL with pg library, evaluating ORM adoption.

### Context
- Current implementation uses direct SQL queries via node-postgres (pg)
- Simple application with basic CRUD operations on users table
- Anticipating growth in data models and query complexity
- Need to balance development velocity with maintainability

### Direct SQL Approach (Current)

**Pros:**
- **Performance**: Direct control over queries and optimization
- **Transparency**: Clear understanding of exact database operations
- **Flexibility**: Can use PostgreSQL-specific features and advanced queries
- **Simplicity**: No additional abstraction layer or learning curve
- **Debugging**: Easy to debug SQL queries and performance issues

**Cons:**
- **Boilerplate**: Manual query building and parameter binding
- **Type Safety**: No compile-time validation of queries against schema
- **Migration Management**: Manual schema changes without migration tooling
- **Maintainability**: Query logic scattered across service files

### ORM Approach (Under Consideration)

**Options:** Prisma, TypeORM, Sequelize, Drizzle ORM

**Pros:**
- **Type Safety**: Compile-time validation and autocomplete for queries
- **Migration Management**: Automated schema migrations and versioning
- **Developer Experience**: Intuitive query building and relationship handling
- **Consistency**: Standardized patterns for data access across the application
- **Code Generation**: Automatic type generation from database schema

**Cons:**
- **Performance Overhead**: Additional abstraction layer and query generation
- **Learning Curve**: Team must learn ORM-specific patterns and limitations
- **Flexibility Constraints**: May limit access to PostgreSQL-specific features
- **Bundle Size**: Additional dependencies and runtime overhead
- **Debugging Complexity**: Generated queries harder to debug and optimize

### Recommendation

**Stick with direct SQL for now** while preparing for future ORM adoption.

**Rationale:**
1. **Current Simplicity**: Application is still small with straightforward data patterns
2. **Performance Priority**: Direct SQL ensures optimal query performance during growth phase
3. **PostgreSQL Features**: Want to leverage PostgreSQL-specific capabilities (JSON, full-text search, etc.)
4. **Migration Path**: Can refactor to ORM later when complexity justifies the investment

**Interim Improvements:**
- Centralize SQL queries in dedicated query modules
- Add TypeScript interfaces for query parameters and results
- Implement query builder helpers for common patterns
- Add database schema documentation and validation

### Future Decision Triggers

**Consider ORM adoption when:**
- Database schema grows beyond 10-15 tables
- Complex relationships require frequent JOIN operations
- Team size grows and needs standardized data access patterns
- Time spent on manual migration management becomes significant
- Type safety for database operations becomes critical for maintainability

## API Design: RESTful with OpenAPI Documentation

### Decision
Follow REST principles with comprehensive OpenAPI specification.

### Structure
- `/api/ping` - Health checks
- `/api/user/*` - User management endpoints
- Clear HTTP methods and status codes
- Consistent response formats

### Documentation Strategy
- OpenAPI 3.0 specification in `openapi.yaml`
- Single source of truth for API contract
- Support for code generation and testing tools
- Interactive documentation via Swagger UI

### Rationale
1. **Standards**: REST is well-understood and widely supported
2. **Documentation**: OpenAPI provides machine-readable API specs
3. **Tooling**: Rich ecosystem for testing, mocking, code generation
4. **Integration**: Easy frontend and third-party integration

## Configuration Management: Environment-Based Config

### Decision
Use environment variables with validation and defaults.

TODO: review the use of defaults here (might not actually be using them; shouldn't be). Intended decision is to avoid hard-coding default values for config settings. Primary rationale is to fail fast and clearly when config values or system are invalid.

### Implementation
```typescript
// src/config/environment.ts
export const config = {
  port: parseInt(process.env.PORT || '5000'),
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    // ... other config
  },
  // Validation on startup
};
```

### Rationale
1. **Security**: Sensitive values not in source code
2. **Flexibility**: Easy configuration per environment
3. **Validation**: Startup-time validation prevents runtime errors
4. **Defaults**: Sensible defaults for development

### Configuration Categories
- **Database**: Connection settings, pool configuration
- **Authentication**: Cognito settings, JWT configuration
- **Application**: Port, CORS settings, API Gateway mode
- **Logging**: Log levels, output formats

## Future Backend Considerations

### Performance Optimization
- **Caching**: Redis/ElastiCache for session and data caching
- **Database**: Query optimization and indexing strategies
- **API**: Response caching and compression

### Scalability Preparation
- **Horizontal Scaling**: Stateless design for load balancer compatibility
- **Background Jobs**: BullMQ integration for async processing
- **Database**: Connection pooling optimization for higher concurrency

### Monitoring Integration
- **APM**: Application Performance Monitoring integration
- **Logging**: Structured logging with correlation IDs
- **Metrics**: Custom business metrics and alerts
