// Example provider template for reference when creating new providers
// This file serves as a template and should not be used in actual application code
// Copy this pattern when creating new app-level initialization providers

// Step 1: Create the Provider File (you can copy this template as a starting point)
// - Name: `{Purpose}Handler.js` or `{Purpose}Provider.js`
// - Use descriptive names that indicate the setup purpose

// Step 2: Import Dependencies
// Import React hooks for provider logic
import { useEffect } from 'react';
// Import any third-party libraries your provider needs
// import * as Analytics from 'analytics-library';
// import * as ErrorTracker from 'error-tracking-service';

// Step 3: Define Provider Component
// Create a wrapper component that performs setup work
export default function ExampleProvider({ children, config }) {
  // Step 4: Implement Provider Logic
  // Use useEffect for app-level initialization and side effects
  // - Run initialization logic once on app startup
  // - Handle configuration changes
  // - Set up third-party services
  // - Manage app-level subscriptions or event listeners

  useEffect(() => {
    // Initialization logic here
    console.log('Initializing provider with config:', config);
    
    // Example: Initialize analytics service
    if (config.analytics?.enabled) {
      // Analytics.init({
      //   trackingId: config.analytics.trackingId,
      //   userId: config.userId
      // });
      console.log('Analytics initialized');
    }
    
    // Example: Set up error tracking
    if (config.errorTracking?.dsn) {
      // ErrorTracker.init({
      //   dsn: config.errorTracking.dsn,
      //   environment: config.environment
      // });
      console.log('Error tracking configured');
    }
    
    // Example: Set up global event listeners
    const handleGlobalEvent = (event) => {
      console.log('Global event received:', event);
    };
    
    window.addEventListener('customEvent', handleGlobalEvent);
    
    // Cleanup function - IMPORTANT: Always clean up resources
    return () => {
      console.log('Cleaning up provider resources');
      
      // Remove event listeners
      window.removeEventListener('customEvent', handleGlobalEvent);
      
      // Clean up third-party services
      // Analytics.cleanup?.();
      // ErrorTracker.cleanup?.();
    };
  }, [config]); // Re-run when config changes
  
  // Provider just returns children - no UI rendering
  // This is the key difference from contexts - providers handle setup, not state
  return children;
}

// Step 5: Add to App.js
// Import and wrap the provider around your app:
// import ExampleProvider from './providers/ExampleProvider';
// 
// function App() {
//   const config = {
//     analytics: { enabled: true, trackingId: 'GA-123' },
//     errorTracking: { dsn: 'https://sentry.io/123' },
//     environment: 'development'
//   };
//   
//   return (
//     <ExampleProvider config={config}>
//       {/* Rest of app components */}
//       <Router>
//         <Routes>
//           {/* Your routes */}
//         </Routes>
//       </Router>
//     </ExampleProvider>
//   );
// }

// Step 6: Test the Provider
// - Verify initialization happens on app startup (check console logs)
// - Test error handling for failed setup (simulate bad config)
// - Ensure no performance impact on app rendering
// - Test cleanup when component unmounts

// Step 7: Handle Provider Ordering
// Consider the order when multiple providers are used:
// 
// <ConfigProvider>           // Loads configuration first
//   <ErrorTrackingProvider>  // Error tracking ready for other providers
//     <AnalyticsProvider>    // Analytics can track errors
//       <AuthHandler>        // Authentication setup
//         <App />            // Main application
//       </AuthHandler>
//     </AnalyticsProvider>
//   </ErrorTrackingProvider>
// </ConfigProvider>

// Best Practices:
// 1. Keep provider initialization lightweight
// 2. Use async initialization for heavy setup
// 3. Always include cleanup functions
// 4. Don't let provider failures crash the app
// 5. Log provider initialization for debugging
// 6. Test provider with various configurations
