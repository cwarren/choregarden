# Authentication Flow

The ChoreGarden frontend uses AWS Cognito for authentication with a dual-mode backend integration that provides seamless user experience across different environments.

## Dual-Mode Backend Integration

The application operates in two complementary modes:

### **Cognito Mode (Primary Authentication)**
- **Purpose**: Handles user authentication and JWT token generation
- **Flow**: User authenticates through AWS Cognito hosted UI
- **Tokens**: Issues ID tokens and access tokens for API authorization
- **Scope**: Authentication only - no user profile storage

### **Application Database Mode (User Data)**
- **Purpose**: Stores and manages user profile data and application-specific information
- **Integration**: Automatically registers users after Cognito authentication
- **Data**: User profiles, preferences, chore data, garden (context) associations
- **Synchronization**: User data is linked via Cognito user ID (sub claim)

### **Seamless Integration**
The two modes work together transparently:
1. **First Login**: User authenticates with Cognito → automatic registration in app database
2. **Subsequent Logins**: Cognito provides authentication → app database provides user data
3. **Single Sign-On**: One login provides access to both authentication and user data
4. **Consistency**: Cognito user ID ensures data consistency across systems

## Authentication Process

The complete authentication flow integrates both Cognito and application database:

### **Step 1: Initial Login**
- User clicks login button
- Redirected to Cognito hosted UI
- User enters credentials (email/password or social login)
- Cognito validates credentials and issues authorization code

### **Step 2: Token Exchange**
- Frontend receives authorization code from Cognito callback
- `AuthHandler` provider exchanges authorization code for JWT tokens
- ID token and access token are stored in localStorage
- ID token contains user identity information (sub, email, name)

### **Step 3: Automatic Registration**
- `AuthHandler` extracts user information from ID token
- Calls `userService.registerUser()` with Cognito user data
- Backend creates user profile in application database (if not exists)
- User profile linked to Cognito user via `sub` (subject) claim

### **Step 4: Protected API Access**
- All subsequent API requests include ID token in Authorization header
- Backend validates JWT token with Cognito
- User data retrieved from application database using token's `sub` claim
- Seamless access to both authentication and user data

### **Step 5: Session Management**
- Tokens stored in localStorage for persistence
- Automatic token expiration checking
- Logout clears tokens and redirects to Cognito logout URL

## Token Management

### Token Types

- **ID Token**: 
  - **Purpose**: User authentication and identity for API requests
  - **Contents**: User identity claims (sub, email, name, token expiration)
  - **Usage**: Sent in Authorization header for all authenticated API calls
  - **Validation**: Backend validates with Cognito for each request
  
- **Access Token**: 
  - **Purpose**: Potential future use with other AWS services
  - **Storage**: Stored in localStorage but not currently used for API calls
  - **Scope**: AWS service access (future expansion)
  
- **User Data Integration**:
  - **Linking**: Cognito `sub` claim links to application database user records
  - **Storage**: Application-specific data stored in local database, not in tokens
  - **Synchronization**: User profile automatically synced on first login

### Token Lifecycle

The `authService` handles all aspects of token management:

#### Token Validation
```javascript
// Check if user is authenticated
const isAuthenticated = authService.isAuthenticated();

// Extract user information from token
const userInfo = authService.getUserInfoFromToken();
```

#### Authentication Headers
```javascript
// Create headers for authenticated API requests
const headers = authService.createAuthHeaders();
```

#### Login/Logout Flow
```javascript
// Redirect to Cognito login
authService.login();

// Clear tokens and redirect to logout
authService.logout();
```

## Protected Routes

### Implementation Pattern

Protected routes check authentication status before rendering:

```javascript
function ProtectedComponent() {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <div>Please log in to access this page.</div>;
  }
  
  return <div>Protected content here</div>;
}
```

### Automatic Redirects

The authentication system automatically handles:
- **Unauthenticated Access**: Redirecting users to Cognito login
- **Post-Login Processing**: Processing authorization codes after successful login
- **User Registration**: Automatic registration in application database on first login
- **Data Synchronization**: Ensuring Cognito user data matches application database

## Dual-Mode Architecture Benefits

### **Separation of Concerns**
- **Authentication**: Handled by AWS Cognito (secure, managed service)
- **User Data**: Handled by application database (flexible, application-specific)
- **Token Management**: Handled by frontend services (localStorage, expiration)

### **Scalability**
- **Cognito**: Scales automatically for authentication workloads
- **Database**: Application database optimized for user data queries
- **Caching**: User data can be cached without affecting authentication

### **Security**
- **Token Validation**: Every request validated against Cognito
- **Data Isolation**: Sensitive authentication separate from application data
- **Revocation**: Cognito logout immediately invalidates all tokens

### **Development Flexibility**
- **Local Testing**: Full authentication flow works with local database
- **Data Migration**: User data independent of authentication provider
- **Feature Development**: New user features don't require Cognito changes

## Security Considerations

### Token Storage
- Tokens are stored in localStorage for persistence across sessions
- Tokens are automatically checked for expiration
- Expired tokens trigger automatic logout

### API Integration
- All authenticated API requests include ID token in Authorization header
- Services automatically handle token attachment through `authService`
- Failed authentication results in automatic logout and redirect

## Error Handling

### Common Authentication Errors

1. **Expired Tokens**: Automatically handled with logout
2. **Invalid Tokens**: User redirected to login
3. **Network Errors**: Graceful fallback with error messages
4. **Registration Failures**: User notified, can retry

### Error Recovery

The authentication system provides automatic recovery for:
- Temporary network issues
- Token refresh scenarios
- Database connection problems

## Testing Authentication

### Local Development
- **Cognito Integration**: Cognito login works seamlessly with local development server
- **Database Mode**: User profile data comes from local database instance
- **Full Flow Testing**: Complete authentication and registration flow testable locally
- **Environment Isolation**: Local development uses separate Cognito user pool
- **Data Persistence**: Local database retains user data between development sessions

### **Environment Configuration**
Different environments use different configurations:
- **Development**: Local database + development Cognito user pool
- **Staging**: Staging database + staging Cognito user pool  
- **Production**: Production database + production Cognito user pool

### **Dual-Mode Testing Scenarios**
Test the integration between authentication and user data:
- **New User Flow**: Cognito signup → automatic database registration
- **Returning User Flow**: Cognito login → existing database profile retrieval
- **Data Consistency**: Verify Cognito user ID matches database user records
- **Error Scenarios**: Handle database unavailable, Cognito unavailable, token mismatch

### Authentication States
Test different authentication states:
- Logged out user
- Logged in user
- Expired token
- Invalid token
- Registration flow
