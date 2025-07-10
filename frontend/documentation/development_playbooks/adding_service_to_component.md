# Adding a Service to a Component

## What
This playbook covers how to integrate a service into a React component for data fetching, form submissions, and user interactions.

## Why
You need to add a service to a component when:
- You've created a new service and want to use it in the UI
- You're adding an existing service to a new or existing component
- You need to fetch data, submit forms, or perform user actions

## How

**Example Component** - See `src/components/ExampleAddingService.js` for a complete template with common patterns and illustrations of these steps.

### Step 1: Import Dependencies
**Import React hooks and the service** you want to use in the component

### Step 2: Define Component with Service Integration
**Create the component** that will use the service methods

### Step 3: Set Up Component State
**Add state management** for service data and UI states:
- Data state (service response)
- Loading state (async operation feedback)
- Error state (error messages)
- Success state (operation feedback)

### Step 4: Implement Data Fetching
**Use useEffect** to fetch data when component mounts or dependencies change

### Step 5: Implement User Actions
**Handle form submissions and user interactions** that call service methods (POST/PUT/DELETE)

### Step 6: Handle Form Input Changes
**Manage form state** for user input and controlled components

### Step 7: Implement Loading States
**Show loading indicators** while async operations are in progress

### Step 8: Implement Error States
**Display error messages** when service calls fail with user-friendly feedback

### Step 9: Render Component with Data
**Display the fetched data** and provide user interface for interactions

### Step 10: Test the Integration
**Verify the component works correctly**:
- Data fetching on component mount
- Form submissions and user actions
- Error handling and user feedback
- Loading states and user experience

## Component Template

See `src/components/ExampleAddingService.js` for a complete template that includes:

### Standard Patterns
- Proper state management (data, loading, error, success)
- useEffect for data fetching
- Form handling with controlled inputs
- Error handling and user feedback

### Service Integration Patterns
- Data fetching on component mount
- User action handling (create, update, delete)
- Loading states for better UX
- Error recovery and retry mechanisms

### UI/UX Best Practices
- Accessible form labels and semantic HTML
- Responsive design with Tailwind CSS
- User feedback for all operations
- Graceful error handling

## Best Practices

### State Management
- Always include data, loading, error, and success states
- Clear previous errors before new operations
- Use meaningful state variable names
- Handle edge cases (no data, empty arrays)

### Service Integration
- Pass apiBaseUrl as first parameter to all service methods
- Use try/catch blocks for all async operations
- Handle both network errors and business logic errors
- Log errors for debugging while showing user-friendly messages

### User Experience
- Show loading indicators for async operations
- Provide clear error messages with actionable feedback
- Implement success feedback for user actions
- Allow users to retry failed operations

### Performance
- Use proper dependency arrays in useEffect
- Avoid unnecessary re-renders with careful state updates
- Consider data refresh strategies (full reload vs. incremental updates)
- Implement debouncing for search inputs if needed

## Common Integration Patterns

### Data Fetching Component
```javascript
// Component that fetches and displays data
export default function DataDisplayComponent({ userId, apiBaseUrl }) {
  // Implementation in ExampleAddingService.js
}
```

### Form Submission Component
```javascript
// Component that handles form submissions
export default function FormComponent({ onSubmit, apiBaseUrl }) {
  // Implementation in ExampleAddingService.js
}
```

### CRUD Operations Component
```javascript
// Component that handles create, read, update, delete operations
export default function CrudComponent({ itemId, apiBaseUrl }) {
  // Implementation in ExampleAddingService.js
}
```
