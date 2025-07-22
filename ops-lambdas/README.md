# Ops-Lambdas

Operational AWS Lambda functions for Chore Garden system administration and automation.

## Lambda Functions

Serverless operational capabilities for infrequent but critical tasks like database migrations and system maintenance.

### Available Functions
- **migration-lambda/**: Database schema migrations using Flyway
- **hello-lambda/**: Example/template Lambda function
- **minimal-node/**: Minimal Node.js Lambda template

### Build System
All Lambda functions use Docker-based builds to eliminate local toolchain dependencies.

## Documentation

- [Ops-Lambdas Overview](./documentation/README.md) - Functions, build system, and deployment details  
- [Design Decisions](./documentation/design_decisions.md) - Context and rationale for ops-lambda-specific decisions
- [Future Considerations](./documentation/future_considerations.md) - Planned ops-lambda enhancements and evolution
