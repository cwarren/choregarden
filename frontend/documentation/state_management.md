# State Management

The ChoreGarden frontend uses a layered approach to state management, with different patterns for different types of state.

## State Management Layers

### 1. Local State
Component-specific state using React's `useState` hook.

#### When to Use
- Form state (input values, validation errors)
- UI state (modal open/closed, loading indicators)
- Component-specific data that doesn't need to be shared

#### Implementation Pattern
```javascript
function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Component logic here
}
```

### 2. Context State
Application-wide state using React Context for data that needs to be shared across components.

#### When to Use
- Authentication status and user information
- Global application settings
- State that multiple components need to access

#### Current Contexts

##### **AuthContext (`src/contexts/AuthContext.js`)**
- **Purpose**: User authentication status and basic user information
- **Provides**: 
  - `isAuthenticated` - Boolean authentication status
  - `userInfo` - Basic user information from JWT token
  - Context provider for the entire app

#### Implementation Pattern
```javascript
// Creating a context
const MyContext = createContext();

export function MyProvider({ children }) {
  const [state, setState] = useState(initialState);
  
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}

// Using a context
function MyComponent() {
  const { state, setState } = useContext(MyContext);
  // Component logic here
}
```

### 3. Server State
Data fetched from APIs, currently managed at the component level.

#### Current Implementation
- Each component fetches data as needed
- No client-side caching of API responses
- Loading and error states managed locally

#### Component Pattern
```javascript
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await myService.getData(apiBaseUrl);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;
  
  return <div>{/* Render data */}</div>;
}
```

## Context Design Principles

### 1. Domain-Focused Contexts
Keep contexts focused on specific domains rather than creating one massive global context:

```javascript
// Good - focused contexts
AuthContext    // Authentication state
ThemeContext   // UI theme and preferences
SettingsContext // App configuration

// Avoid - massive global context
AppContext     // Everything mixed together
```

### 2. Minimal Context State
Only put state in context that truly needs to be shared:

```javascript
// AuthContext - minimal shared state
{
  isAuthenticated: boolean,
  userInfo: { email, name, sub }
}

// Don't put everything in context
{
  isAuthenticated: boolean,
  userProfile: { /* detailed profile */ },
  userPreferences: { /* preferences */ },
  userActivity: { /* activity data */ }
}
```

### 3. Context + Services Pattern
Combine contexts with services for clean separation:

```javascript
// Context provides the state
const AuthContext = createContext();

// Service provides the operations
const authService = {
  login() { /* implementation */ },
  logout() { /* implementation */ }
};

// Components use both
function LoginButton() {
  const { isAuthenticated } = useContext(AuthContext);
  
  const handleLogin = () => {
    authService.login();
  };
  
  // Component JSX
}
```

## Future State Management Considerations

### Server State Management
Maybe use React Query or SWR for better server state management:

#### Benefits
- Automatic caching of API responses
- Background refetching
- Optimistic updates
- Better loading and error states

#### Implementation Consideration
```javascript
// With React Query (future consideration)
function DataComponent() {
  const { data, isLoading, error } = useQuery(
    ['userData', userId],
    () => userService.getUserProfile(apiBaseUrl, userId)
  );
  
  // Simplified component logic
}
```

### State Persistence
Consider state persistence for:
- User preferences
- Form data (draft states)
- Authentication state (already implemented)

## Best Practices

### Context Performance
- Use context sparingly to avoid unnecessary re-renders
- Split contexts by update frequency
- Use `useMemo` and `useCallback` in context providers

### State Colocation
- Keep state as close to where it's used as possible
- Only lift state up when necessary
- Use local state before reaching for context

### Error Boundaries
- Implement error boundaries for context providers
- Handle context initialization errors gracefully
- Provide fallback UI for state errors

## Testing State Management

### Testing Contexts
```javascript
// Test context providers
function renderWithContext(component, contextValue) {
  return render(
    <MyContext.Provider value={contextValue}>
      {component}
    </MyContext.Provider>
  );
}
```

### Testing State Updates
- Test state changes trigger re-renders
- Test error states and error boundaries
- Test context value propagation
