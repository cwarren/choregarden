# Service Architecture

The frontend uses a service-based architecture that mirrors the backend structure, providing clean separation between business logic and UI components.

## Core Services

### **AuthService (`src/services/authService.js`)**
- **Responsibility**: Authentication state and token management
- **Methods**: 
  - `isAuthenticated()` - Check if user is logged in
  - `getUserInfoFromToken()` - Extract user data from JWT token
  - `login()` - Redirect to Cognito login
  - `logout()` - Clear tokens and redirect to logout
  - `createAuthHeaders()` - Generate authenticated request headers for API calls

### **UserService (`src/services/userService.js`)**
- **Responsibility**: User profile and account management
- **Methods**:
  - `registerUser()` - Register user in application database
  - `getUserProfile()` - Fetch user profile data
  - `updateUserProfile()` - Update user profile information

## Service Design Principles

### 1. Domain Separation
Each service handles one business domain:
- **AuthService**: Authentication and tokens
- **UserService**: User profiles and accounts
- **Future services**: Chores, gardens, notifications (one domain per service)

### 2. Error Handling
Services throw meaningful errors that UI components can handle:
```javascript
export const exampleService = {
  async fetchData(apiBaseUrl, id) {
    try {
      const response = await fetch(`${apiBaseUrl}/data/${id}`, {
        headers: authService.createAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Data fetch failed: ${error.message}`);
    }
  }
};
```

### 3. Authentication Integration
Services automatically handle token attachment:
```javascript
// Services use authService for authenticated requests
const headers = authService.createAuthHeaders();
const response = await fetch(url, { headers });
```

### 4. Reusability
Services can be used by multiple components:
- Import services where needed
- No component-specific logic in services
- Clear, documented interfaces

## Service Implementation Patterns

### Method Signature Pattern
All service methods follow a consistent pattern:
```javascript
async methodName(apiBaseUrl, ...specificParams) {
  // Implementation
}
```

### Error Handling Pattern
```javascript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
} catch (error) {
  throw new Error(`Operation failed: ${error.message}`);
}
```

### Authentication Pattern
```javascript
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...authService.createAuthHeaders()
  },
  body: JSON.stringify(data)
};
```

## Service Organization

### File Structure
```
src/services/
├── authService.js      # Authentication and token management
├── userService.js      # User profile operations
├── exampleService.js   # Template for new services
└── index.js           # Export all services
```

### Export Pattern
Services are exported individually and re-exported from index:
```javascript
// In individual service files
export const serviceName = { /* methods */ };

// In src/services/index.js
export { authService } from './authService';
export { userService } from './userService';
```

### Import Pattern
Components import services from the services directory:
```javascript
import { authService, userService } from '../services';
```

## API Integration

### Base URL Management
- Services accept `apiBaseUrl` as first parameter
- Environment-specific API URLs handled at component level
- No hardcoded URLs in services

### Request Headers
- Authentication headers added automatically
- Content-Type headers specified per request
- Custom headers supported for specific endpoints

### Response Handling
- Services return response data, not full response objects
- Error responses converted to meaningful error messages
- Consistent data format across all services

## Testing Services

### Unit Testing
Test service methods in isolation:
- Mock fetch calls
- Test error conditions
- Verify authentication header inclusion

### Integration Testing
Test service integration with components:
- Real API endpoints (in test environment)
- Authentication flows
- Error handling in UI

## Adding New Services

For step-by-step instructions on adding new services, see the [Adding a New Service](development_playbooks/adding_service.md) playbook.

### Service Template
See `src/services/exampleService.js` for a complete template with:
- Standard method patterns
- Error handling
- Authentication integration
- Documentation examples
