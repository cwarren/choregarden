-- Migration: Update display_name field length to match email field
-- Increase display_name from VARCHAR(100) to VARCHAR(255) to accommodate email defaults

ALTER TABLE users 
ALTER COLUMN display_name TYPE VARCHAR(255);
