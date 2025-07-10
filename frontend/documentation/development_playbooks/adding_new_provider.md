# Adding a New Provider

## What
This playbook covers how to add a new provider component for app-level initialization, setup, or side effects that need to wrap the entire application or large sections of it.

## Why
You need to add a new provider when:
- Setting up app-wide initialization logic (analytics, error tracking, etc.)
- Handling global side effects that need to run once on app startup
- Configuring third-party libraries that need to wrap the app
- Managing app-level subscriptions or event listeners

## How

**Example Provider** - See `src/providers/exampleProvider.js` for a complete template with common patterns and illustrations of these steps.

### Step 1: Create the Provider File
**Create the provider file** in `src/providers/`
- Name: `{Purpose}Handler.js` or `{Purpose}Provider.js`
- Use descriptive names that indicate the setup purpose

### Step 2: Import Dependencies
**Import React hooks and third-party libraries** your provider needs

### Step 3: Define Provider Component
**Create a wrapper component** that performs setup work

### Step 4: Implement Provider Logic
**Follow the established pattern** for provider implementation:
- Use `useEffect` for initialization and side effects
- Run setup logic once on app startup
- Handle configuration changes properly
- Always include cleanup functions
- Don't render UI - just return children

### Step 5: Add to App.js
**Import and wrap** the provider around your app components

### Step 6: Test the Provider
**Verify the provider works correctly**:
- Initialization happens on app startup
- Error handling for failed setup
- No performance impact on app rendering
- Cleanup functions work properly

### Step 7: Handle Provider Ordering
**Consider the order** when multiple providers are used - dependencies should wrap dependents

## Provider Template

See `src/providers/exampleProvider.js` for a complete template that includes:

### Standard Patterns
- Consistent component structure
- Proper useEffect usage
- Configuration handling
- Cleanup functions

### Common Use Cases
- Analytics initialization
- Error tracking setup
- Third-party service configuration
- Global event listener management

### Best Practices
- Lightweight initialization
- Async setup for heavy operations
- Proper cleanup functions
- Error boundary considerations

## Best Practices

### Provider Design
- Keep initialization lightweight and fast
- Use async initialization for heavy setup operations
- Always include cleanup functions in useEffect
- Don't render UI - providers are for setup only

### Error Handling
- Don't let provider failures crash the app
- Log initialization errors for debugging
- Provide fallback behavior for failed setup
- Test error scenarios and recovery

### Performance
- Avoid blocking the main thread during initialization
- Use proper dependency arrays in useEffect
- Consider provider ordering for optimal loading
- Test initialization time impact

### Provider Ordering
- Place providers in order of dependency
- Configuration providers should be outermost
- Authentication providers should wrap protected features
- Analytics/tracking providers can be middle layer

## Common Provider Patterns

### Configuration Loading
```javascript
// Provider that loads app configuration
export default function ConfigProvider({ children }) {
  // Implementation in exampleProvider.js
}
```

### Third-Party Service Setup
```javascript
// Provider that initializes external services
export default function ServiceProvider({ children, config }) {
  // Implementation in exampleProvider.js
}
```

### Global Event Management
```javascript
// Provider that manages app-wide event listeners
export default function EventProvider({ children }) {
  // Implementation in exampleProvider.js
}
```
