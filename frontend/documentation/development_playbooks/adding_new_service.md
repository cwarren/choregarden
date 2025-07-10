# Adding a New Service

## What
This playbook covers how to add a new service to handle a specific business domain (e.g., chores, gardens, notifications).

## Why
You need to add a new service when:
- Adding a new feature that requires backend API communication
- Creating a new business domain that doesn't fit into existing services
- The current services are becoming too large and need to be split
- You need to integrate with a new external service or API

## How

**Example Service** - See `src/services/exampleService.js` for a complete template with common patterns and illustrations of these steps.

### Step 1: Create the Service File
**Create the service file** in `src/services/`

### Step 2: Import Dependencies

### Step 3: Define Service Object

### Step 4: Implement Service Methods
**Follow the established pattern** for each method:
   - Accept `apiBaseUrl` as the first parameter
   - Use try/catch blocks for error handling
   - Include meaningful error messages
   - Return the response data, not the full response object
   - Use `authService.createAuthHeaders()` for authenticated requests

### Step 5: Add to Services Index
1. **Export your service** from `src/services/index.js` (see that file for an example)

### Step 6 - 8: Add the service to a component to validate it
1. See- **[Adding Service to a Component](adding_service_to_component.md)** - step-by-step for adding a service to a component

### Step 9: Document the Service
1. **Add or update JSDoc comments** to service methods
2. **Update this README** if the service introduces new patterns
3. **Document any new environment variables** or configuration needed

## Service Template

See `src/services/exampleService.js` for a complete template that includes:

### Standard Patterns
- Consistent method signatures
- Proper error handling
- Authentication integration
- Documentation examples

### Common Methods
- GET operations (fetch data)
- POST operations (create data)
- PUT operations (update data)
- DELETE operations (remove data)

### Error Handling
- Network error handling
- HTTP status error handling
- Authentication error handling
- Meaningful error messages

## Best Practices

### Method Design
- Always accept `apiBaseUrl` as first parameter
- Use descriptive parameter names
- Include JSDoc documentation
- Return data objects, not response objects

### Error Handling
- Provide specific error messages
- Include HTTP status codes in errors
- Don't expose internal implementation details
- Handle authentication errors gracefully

### Authentication
- Use `authService.createAuthHeaders()` for authenticated requests
- Handle authentication failures appropriately
- Don't hardcode authentication logic

### Testing
- Test with various response scenarios
- Test error conditions
- Test authentication requirements
- Verify proper error message formatting


