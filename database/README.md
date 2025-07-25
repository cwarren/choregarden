# Database

PostgreSQL database for Chore Garden with Flyway-managed migrations.

## Database Management

The database uses PostgreSQL with Flyway for version-controlled migrations.

### Local Development
Database runs in Docker via docker-compose.

### Migrations
SQL migration files are in `migrations/`. Flyway handles versioning and execution.

Local migrations can be run using `/scripts/run-migrations-local.ps1`

## Documentation

- [Database Overview](./documentation/README.md) - Schema, migrations, and operational details
- TBD [Design Decisions](./documentation/design_decisions.md) - Context and rationale for database-specific decisions  
- TBD [Future Considerations](./documentation/future_considerations.md) - Planned database enhancements and evolution
