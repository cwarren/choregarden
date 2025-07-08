-- Migration: Grant application user access to Flyway metadata
-- Allows the app to check migration status for health checks and debugging

GRANT SELECT ON TABLE flyway_schema_history TO choregarden;
