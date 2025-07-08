# ChoreGarden Backend API

This is the Node.js/TypeScript backend for the ChoreGarden application, providing REST API endpoints for user management and application functionality.

## API Documentation

The API specification is documented in OpenAPI 3.0 format in `openapi.yaml`. This file serves as the source of truth for API documentation and can be used with tools like Swagger UI or Postman for interactive exploration.

### Viewing the API Documentation

You can view the API documentation by:

1. **Using Swagger UI locally:**
   ```bash
   npx swagger-ui-serve openapi.yaml
   ```

2. **Using online tools:**
   - Copy the contents of `openapi.yaml` to [Swagger Editor](https://editor.swagger.io/)
   - Use [Redoc](https://redocly.github.io/redoc/) for a clean documentation view

## API Overview

### Authentication

The API uses AWS Cognito JWT tokens for authentication. Protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

### Endpoints

#### Health Check Endpoints
- `GET /api/ping` - Basic health check
- `GET /api/pingdeep` - Health check with database connectivity test
- `GET /api/pingprotected` - Protected health check (requires authentication)

#### User Management
- `POST /api/user/register` - Register/update user in app database (protected)
- `GET /api/user/profile` - Get current user's profile (protected)
- `PUT /api/user/profile` - Update current user's profile (protected)

### CORS Support

The API includes comprehensive CORS support for cross-origin requests from the frontend application.

## Development

### Environment Setup

1. Copy `sample.env` to `.env` and configure your environment variables
2. Ensure PostgreSQL database is running and accessible
3. Run database migrations if needed

### Server

The server will start on port 5000 by default.

### Database

The backend connects to a PostgreSQL database and uses a `users` table for application user data, separate from AWS Cognito authentication data.

User records are created automatically when users authenticate through Cognito and call the `/api/user/register` endpoint.
