# Database Documentation

PostgreSQL database for Chore Garden with Flyway-managed migrations.

## Overview

- **Database**: PostgreSQL 15
- **Migration Tool**: Flyway
- **Hosting**: AWS RDS (production), Docker (development)
- **Schema Management**: Version-controlled SQL migrations

TODO: split this up a bit (notably, schema doc, development workflow & migration)

## Database Structure

### Current Tables

**`migration_test`** - Flyway validation table
- Basic table for migration system validation

**`users`** - Application user profiles
- Links to Cognito authentication system
- Stores user profile and preferences data
- UUID primary keys with Cognito sub mapping

### Planned Schema Evolution
- **Households**: Group/household management
- **Tasks**: Task definitions and templates
- **Assignments**: Task assignments to users  
- **Completions**: Task completion history
- **Notifications**: System notifications and alerts

## Migration Flow

### Development Workflow

1. **Create Migration File**
   ```powershell
   # Create new migration in /database/migrations/
   # Naming: V{version}__{description}.sql
   # Example: V5__create_households_table.sql
   ```

2. **Test Migration Locally**
   ```powershell
   # Run local migration script
   .\scripts\run-migrations-local.ps1
   ```

3. **Commit and Deploy**
   ```powershell
   # Migration runs automatically via ops-lambda during deployment
   # CI/CD pipeline triggers migration on environment deployment
   ```

### Migration Naming Convention
- `V{version}__{description}.sql`
- Version numbers are sequential integers
- Descriptions use snake_case
- Examples:
  - `V5__create_households_table.sql`
  - `V6__add_task_scheduling_columns.sql`
  - `V7__create_indexes_for_performance.sql`

### Migration Best Practices

**DO:**
- Always test migrations on development environment first
- Include rollback instructions in migration comments
- Add appropriate indexes for new columns
- Grant necessary permissions to application user
- Use transactions for multi-statement migrations

**DON'T:**
- Modify existing migration files after deployment
- Drop columns without coordination (may break running applications)
- Create migrations without proper testing
- Skip version numbers in sequence

## Connection Configuration

### Development (Local)
- **Host**: localhost (Docker container)
- **Database**: choregarden_dev
- **User**: choregarden
- **SSL**: Required (self-signed certificate)
- **Connection Pool**: 5-10 connections

### Production (AWS RDS)
- **Host**: RDS endpoint (managed by Terraform)
- **Database**: choregarden_prod
- **User**: choregarden (managed via AWS Secrets Manager)
- **SSL**: Required (AWS RDS certificate)
- **Connection Pool**: 10-20 connections
- **Backups**: Automated daily backups with point-in-time recovery

## Security Configuration

### Authentication
- Database user `choregarden` with limited privileges
- Passwords managed via AWS Secrets Manager (production)
- Local development uses certificates for SSL

### Permissions
- Application user has CRUD access to application tables
- No DDL permissions (migrations run with admin user)
- Connection encryption enforced
- Network access restricted via security groups

### Certificate Management
- Development: Self-signed certificates in `/database/certs/`
- Production: AWS-managed RDS certificates
- Certificate rotation handled automatically

## Monitoring & Maintenance

### Performance Monitoring
- **Development**: Basic connection monitoring
- **Production**: AWS RDS CloudWatch metrics
  - Connection count and utilization
  - Query performance insights
  - Storage and CPU utilization
  - Backup and maintenance windows

### Backup Strategy
- **Development**: Docker volume persistence
- **Production**: 
  - Automated daily backups (7-day retention)
  - Point-in-time recovery capability
  - Cross-region backup replication (planned)

### Maintenance Windows
- **Development**: No scheduled maintenance
- **Production**: Weekly maintenance window during low usage
- Minor version updates: Automatic
- Major version updates: Planned with testing

## Troubleshooting

### Common Issues

**Connection Problems:**
- Verify Docker containers are running (development)
- Check security group configuration (production)
- Validate certificate configuration
- Confirm database user permissions

**Migration Failures:**
- Check migration syntax and dependencies
- Verify database permissions for migration user
- Review Flyway logs for detailed error information
- Ensure migration version numbers are sequential

**Performance Issues:**
- Monitor connection pool utilization
- Analyze slow query logs
- Check index usage for common queries
- Review connection timeout settings

### Development Setup
```powershell
# Start local database
docker-compose up -d postgres

# Run migrations
.\scripts\run-migrations-local.ps1

# Connect to database
# Use connection details from backend/.env
# Recommended tools: DBeaver, pgAdmin, psql
```

## Future Considerations

### Schema Evolution
- **Households and Teams**: Multi-user household management
- **Task Templates**: Reusable task definitions
- **Scheduling System**: Recurring task management
- **Analytics Tables**: Performance and usage metrics
- **Audit Logging**: Change history for compliance

### Performance Optimization
- **Read Replicas**: For reporting and analytics queries
- **Connection Pooling**: PgBouncer for connection management
- **Partitioning**: For large historical data tables
- **Indexing Strategy**: Query-specific index optimization

### Backup and Recovery
- **Point-in-Time Recovery**: Enhanced backup strategy
- **Cross-Region Replication**: Disaster recovery capability
- **Migration Rollback**: Automated rollback procedures
- **Data Archival**: Historical data management strategy

## Documentation Extensions Needed

*[Placeholders for future detailed documentation]*

- **Schema Reference**: Complete table and column documentation
- **Query Patterns**: Common query examples and optimization
- **Performance Tuning**: Database-specific optimization guide
- **Backup and Recovery**: Detailed procedures and testing
- **Migration Cookbook**: Advanced migration patterns and examples
- **Monitoring Playbook**: Alert configuration and response procedures