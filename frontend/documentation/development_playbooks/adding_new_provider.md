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

### Step 1: Create the Provider File
1. **Create the provider file** in `src/providers/`
   - Name: `{Purpose}Handler.js` or `{Purpose}Provider.js`
   - Use descriptive names that indicate the setup purpose

### Step 2: Implement Provider Logic
1. **Create a wrapper component** that performs setup work:
   ```javascript
   import { useEffect } from 'react';
   
   export default function SetupHandler({ children, config }) {
     useEffect(() => {
       // Initialization logic here
       console.log('Setting up with config:', config);
       
       // Example: Initialize analytics
       // analytics.init(config.analyticsKey);
       
       // Example: Set up error tracking
       // errorTracker.configure(config.errorConfig);
       
       // Cleanup function if needed
       return () => {
         // Cleanup logic
       };
     }, [config]);
     
     // Provider just returns children - no UI
     return children;
   }
   ```

### Step 3: Add to App.js
1. **Import and wrap** the provider around your app:
   ```javascript
   import SetupHandler from './providers/SetupHandler';
   
   function App() {
     const config = {
       // Configuration for the provider
     };
     
     return (
       <SetupHandler config={config}>
         {/* Rest of app components */}
         <Router>
           <Routes>
             {/* Your routes */}
           </Routes>
         </Router>
       </SetupHandler>
     );
   }
   ```

### Step 4: Test the Provider
1. **Verify initialization** happens on app startup
   - Check console logs or network requests
   - Verify third-party services are configured correctly
   
2. **Test error handling** for failed setup
   - Simulate configuration errors
   - Ensure app still loads if provider setup fails
   
3. **Ensure no performance impact** on app rendering
   - Provider should not block initial render
   - Heavy initialization should be async

## Examples

### Analytics Provider
```javascript
// src/providers/AnalyticsHandler.js
import { useEffect } from 'react';

export default function AnalyticsHandler({ children, analyticsConfig }) {
  useEffect(() => {
    if (analyticsConfig.enabled) {
      // Initialize analytics
      window.gtag('config', analyticsConfig.trackingId);
    }
  }, [analyticsConfig]);
  
  return children;
}
```

### Error Tracking Provider
```javascript
// src/providers/ErrorTrackingHandler.js
import { useEffect } from 'react';
import * as Sentry from '@sentry/react';

export default function ErrorTrackingHandler({ children, sentryConfig }) {
  useEffect(() => {
    if (sentryConfig.dsn) {
      Sentry.init({
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment
      });
    }
  }, [sentryConfig]);
  
  return children;
}
```

## Best Practices

### Provider Ordering
- Place providers in order of dependency
- Authentication providers should wrap protected features
- Analytics/tracking providers can be outermost

### Error Handling
- Always include error boundaries around providers
- Don't let provider failures crash the app
- Log provider initialization errors

### Performance
- Keep provider initialization lightweight
- Use async initialization for heavy setup
- Avoid blocking the main thread

### Testing
- Test provider initialization with various configurations
- Test error scenarios and recovery
- Verify cleanup functions work correctly

## Common Patterns

### Configuration Provider
```javascript
export default function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  
  useEffect(() => {
    fetch('/config.json')
      .then(response => response.json())
      .then(setConfig);
  }, []);
  
  if (!config) {
    return <div>Loading configuration...</div>;
  }
  
  return children;
}
```

### Feature Flag Provider
```javascript
export default function FeatureFlagHandler({ children, features }) {
  useEffect(() => {
    // Initialize feature flag service
    featureFlags.init(features);
  }, [features]);
  
  return children;
}
```
