-- Migration: Create users table
-- This stores application-specific user data while Cognito handles authentication

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cognito_user_id VARCHAR(128) NOT NULL UNIQUE, -- The 'sub' claim from Cognito JWT
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for common queries
CREATE INDEX idx_users_cognito_user_id ON users(cognito_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Grant permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO choregarden;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO choregarden;
