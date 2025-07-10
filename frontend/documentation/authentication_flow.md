# Authentication Flow

The ChoreGarden frontend uses AWS Cognito for authentication with a dual-mode backend integration.

## Authentication Process

1. **Login**: User is redirected to Cognito hosted UI
2. **Token Exchange**: Authorization code is exchanged for JWT tokens
3. **Registration**: User is automatically registered in the application database
4. **Protected Routes**: JWT tokens are sent with API requests

## Token Management

### Token Types

- **ID Token**: Used for API authentication and user identity
- **Access Token**: Stored for potential future use with other AWS services
- **Storage**: Tokens are stored in localStorage with expiration checking

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
- Redirecting unauthenticated users to login
- Processing authorization codes after login
- User registration in the application database

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
- Cognito login works with local development server
- User data comes from local database
- Full authentication flow is testable locally

### Authentication States
Test different authentication states:
- Logged out user
- Logged in user
- Expired token
- Invalid token
- Registration flow
