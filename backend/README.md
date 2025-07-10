# ChoreGarden Backend API

This is the Node.js/TypeScript backend for the ChoreGarden application, providing REST API endpoints for user management and application functionality.

## Backend Code Organization

The backend follows a modular, layered architecture with clear separation of concerns. 

This architecture provides:
- **Maintainability**: Clear separation of concerns
- **Testability**: Modular design with dependency injection
- **Scalability**: Easy to add new features and endpoints
- **Type Safety**: Full TypeScript integration
- **Flexibility**: Support for multiple deployment scenarios

Here's how the code is organized:

### Directory Structure

```
src/
├── config/           # Configuration and environment setup
├── controllers/      # Request handlers and business logic coordination
├── middleware/       # Express middleware for auth, validation, etc.
├── routes/          # API route definitions and middleware composition
├── services/        # Business logic and external service integration
└── types/           # TypeScript type definitions and extensions
```

### Layer Architecture

#### **1. Entry Point (`index.ts`)**
- Application bootstrap and server startup
- Imports and initializes the Express app
- Handles graceful shutdown

#### **2. Application Setup (`src/app.ts`)**
- Express app configuration
- Middleware registration
- Route mounting
- Database connection initialization

#### **3. Configuration (`src/config/`)**
- **`environment.ts`** - Environment variable loading and validation
- **`database.ts`** - Database connection configuration and retry logic

**WARNING: this has a potential divergence between local and deployed behavior since local env settings may differ from the deployed ones! If things are working locally but not when deployed, this is a possible culprit area! Consider NODE_ENV values, and possible differences between local env.json and the app secrets used when deployed.**

#### **4. Routes (`src/routes/`)**
- **`index.ts`** - Main router that mounts all sub-routes
- **`health.ts`** - Health check endpoints
- **`users.ts`** - User management endpoints
- Routes define the API structure and apply appropriate middleware

#### **5. Middleware (`src/middleware/`)**
- **`auth.ts`** - Authentication middleware using JWT/Cognito
- **`user.ts`** - User data loading and validation middleware
- **`index.ts`** - Middleware exports

#### **6. Controllers (`src/controllers/`)**
- **`healthController.ts`** - Health check handlers
- **`userController.ts`** - User management request handlers
- Controllers handle HTTP requests/responses and coordinate with services

#### **7. Services (`src/services/`)**
- **`AuthService.ts`** - JWT validation and Cognito integration
- **`UserService.ts`** - User data operations and database interactions
- Services contain business logic and external service integration

#### **8. Types (`src/types/`)**
- **`express.ts`** - Express.js type extensions (adds `user` property to Request)

### Authentication Flow

**WARNING: this has a divergence between local and deployed behavior! If things are working locally but not when deployed, this is a possible culprit area! Consider the specifics unique to API Gateway.**

The backend supports two authentication modes:

1. **API Gateway Mode**: When requests come through AWS API Gateway
   - API Gateway validates JWT tokens
   - Backend extracts user info from pre-validated tokens
   - Faster processing, no JWKS validation needed
   - *This is used when the application is deployed*

2. **Direct Backend Mode**: When requests come directly to the backend
   - Backend validates JWT tokens against Cognito JWKS
   - Full token validation including signature verification
   - *Supports local development and testing*



### Key Design Patterns

#### **Dependency Injection**
Services are instantiated once and passed to middleware/controllers:
```typescript
const userService = new UserService(pool);
const { requireAuth } = createAuthMiddleware(userService);
```

#### **Factory Pattern**
Controllers and middleware are created via factory functions:
```typescript
export const createUserController = (userService: UserService) => {
  return { getUserProfile, updateUserProfile, registerUser };
};
```

#### **Middleware Composition**
Authentication and authorization are handled through composable middleware:
```typescript
router.get('/profile', requireAuth, requireUser, userController.getUserProfile);
```

### Data Flow

1. **Request** → Route → Auth Middleware → User Middleware → Controller
2. **Controller** → Service → Database
3. **Database** → Service → Controller → Response

### Type Safety

The backend uses TypeScript extensively for type safety:
- Interface definitions for all data structures
- Type extensions for Express.js Request objects
- Strongly typed service methods and database operations
- Compile-time error checking

### Error Handling

- Centralized error responses in controllers
- Graceful error handling in middleware
- Database connection retry logic
- Proper HTTP status codes and error messages

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
