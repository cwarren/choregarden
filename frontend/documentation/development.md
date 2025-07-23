# Development Guide

This guide covers development patterns, environment configuration, and workflow for the ChoreGarden frontend.

## Development Workflow

### Code Organization

#### **File Structure**
- One component per file
- Named exports for services, default exports for components
- Clear import organization

#### **Import Organization**
```javascript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// 2. Internal modules (services, contexts)
import { authService } from '../services';
import { AuthContext } from '../contexts/AuthContext';

// 3. Relative imports (components, utils)
import HeaderNavBar from './HeaderNavBar';
import './Component.css';
```

#### **Naming Conventions**
- **Components**: PascalCase (`UserProfile.js`)
- **Services**: camelCase (`userService.js`)
- **Utilities**: camelCase (`formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.js`)

### Development Commands

#### **Local Development**
```bash
# From /frontend folder
npm start          # Start development server (port 3000)
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run linting (if configured)
```

#### **Full Application**
```bash
# From project root
docker-compose build   # Build latest version
docker-compose up      # Start frontend, backend, and database
docker-compose down    # Stop all services
```

### Testing Strategy

#### **Component Testing**
- Test component rendering
- Test user interactions
- Test props and state changes

#### **Service Testing**
- Test API integration
- Test error handling
- Test authentication integration

#### **Integration Testing**
- Test authentication flow
- Test API data flow
- Test error scenarios

### Debugging

#### **Development Tools**
- React Developer Tools for component inspection
- Network tab for API request debugging
- Console for service error logging

#### **Common Issues**
- **CORS errors**: Ensure backend CORS configuration
- **Authentication issues**: Check token validity and headers
- **Styling issues**: Verify Tailwind class names and responsive breakpoints

## Best Practices

### Performance
- Use `React.memo` for expensive components
- Implement proper dependency arrays in `useEffect`
- Avoid unnecessary re-renders through proper state management

### Security
- Never store sensitive data in localStorage beyond tokens
- Validate all user inputs on both client and server
- Use HTTPS in production

### Maintainability
- Keep components small and focused
- Use descriptive names for functions and variables
- Document complex business logic
- Follow consistent code formatting

## Development Patterns

### Component Patterns

#### **Functional Components**
All components use React hooks instead of class components:

```javascript
// Preferred pattern
function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
}

export default MyComponent;
```

#### **Props Interface**
Define clear prop interfaces with defaults when appropriate:

```javascript
function Button({ 
  children, 
  variant = 'primary', 
  disabled = false, 
  onClick 
}) {
  return (
    <button 
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

#### **Error Boundaries**
Handle component errors gracefully with error boundaries:

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### API Integration Patterns

#### **Service Layer**
All API calls go through service layers:

```javascript
// In component
import { userService } from '../services';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const userData = await userService.getUserProfile(apiBaseUrl, userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [userId]);
  
  // Render logic with loading and error states
}
```

#### **Error Handling**
Services throw errors, components handle them:

```javascript
// Service method
async getUserProfile(apiBaseUrl, userId) {
  try {
    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      headers: authService.createAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`User fetch failed: ${error.message}`);
  }
}

// Component usage
try {
  const user = await userService.getUserProfile(apiBaseUrl, userId);
  setUser(user);
} catch (error) {
  setError(error.message);
  // Show user-friendly error message
}
```

#### **Loading States**
Components manage loading states for better UX:

```javascript
function DataComponent() {
  const [loading, setLoading] = useState(false);
  
  const handleAction = async () => {
    setLoading(true);
    try {
      await someService.doSomething();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleAction} disabled={loading}>
      {loading ? 'Loading...' : 'Click Me'}
    </button>
  );
}
```

### Styling Patterns

#### **Tailwind CSS**
Use utility-first approach for consistent styling:

```javascript
function Card({ children, highlighted = false }) {
  return (
    <div className={`
      bg-white rounded-lg shadow-md p-6
      ${highlighted ? 'border-2 border-blue-500' : 'border border-gray-200'}
    `}>
      {children}
    </div>
  );
}
```

#### **Responsive Design**
Use mobile-first responsive approach:

```javascript
function ResponsiveGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
```

#### **Accessibility**
Include ARIA labels and semantic HTML:

```javascript
function SearchInput({ onSearch, placeholder }) {
  return (
    <div className="relative">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        type="search"
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg"
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Search input"
      />
    </div>
  );
}
```

## Environment Configuration

### Environment Variables

The application uses environment variables for configuration (but NOT anything with sensitive info - just things like the API base URL - see [public/config.json](/frontend/public/config.json)):

#### **Frontend Environment Variables**
- `REACT_APP_API_BASE_URL` - Backend API URL
- Additional `REACT_APP_*` variables as needed

#### **Configuration Files**
- Cognito configuration served through `config.json` from backend
- Environment-specific settings loaded at runtime

#### **Local Development Setup**
```bash
# Create .env.local file
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Configuration Loading

This is done in App.js, loaded from the service at runtime.


