-- V1__init.sql: Initial migration for Flyway validation
CREATE TABLE migration_test (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
