# Infrastructure

Terraform-managed AWS infrastructure for Chore Garden.

## Infrastructure as Code

All AWS infrastructure is defined in Terraform modules supporting development and production environments.

### Environments
- **dev/**: Development environment configuration
- **prod/**: Production environment configuration

### Modules
Reusable Terraform modules in `modules/` for VPC, database, backend services, and more.

## Documentation

- [Infrastructure Overview](./documentation/README.md) - Architecture, modules, and deployment details
- [Design Decisions](./documentation/design_decisions.md) - Context and rationale for infrastructure-specific decisions
- [Future Considerations](./documentation/future_considerations.md) - Planned infrastructure enhancements and evolution
