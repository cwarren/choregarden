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
1. **Export your service** from `src/services/index.js`:
   ```javascript
   export { authService } from './authService';
   export { userService } from './userService';
   export { choreService } from './choreService'; // Add new service
   ```

### Step 6: Update Components
1. **Import the service** in components that need it:
   ```javascript
   import { choreService } from '../services';
   ```
2. **Use the service methods** in your component logic:
   ```javascript
   const [chores, setChores] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   
   useEffect(() => {
     async function fetchChores() {
       setLoading(true);
       try {
         const choreData = await choreService.getChores(apiBaseUrl, userId);
         setChores(choreData);
       } catch (err) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     }
     
     fetchChores();
   }, [userId]);
   ```

### Step 7: Handle Loading and Error States
1. **Add state management** in components using the service:
   ```javascript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);
   
   const handleCreateChore = async (choreData) => {
     setLoading(true);
     setError(null);
     setSuccess(false);
     
     try {
       await choreService.createChore(apiBaseUrl, userId, choreData);
       setSuccess(true);
       // Refresh data or update state
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Implement proper error handling** and user feedback:
   ```javascript
   if (loading) return <div>Loading...</div>;
   if (error) return <div className="text-red-500">Error: {error}</div>;
   if (success) return <div className="text-green-500">Success!</div>;
   ```

### Step 8: Test the Integration
1. **Test the service methods** manually through the UI
2. **Verify error handling** by simulating network failures
3. **Check authentication flow** if applicable
4. **Test different response scenarios** (success, error, empty data)

### Step 9: Document the Service
1. **Add JSDoc comments** to service methods:
   ```javascript
   /**
    * Fetches all chores for a specific user
    * @param {string} apiBaseUrl - The base URL for the API
    * @param {string} userId - The ID of the user
    * @returns {Promise<Array>} Array of chore objects
    * @throws {Error} When the request fails or user is not authenticated
    */
   async getChores(apiBaseUrl, userId) {
     // Implementation
   }
   ```

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

## Common Service Patterns

### CRUD Operations
```javascript
export const itemService = {
  // Create
  async createItem(apiBaseUrl, data) { /* implementation */ },
  
  // Read
  async getItems(apiBaseUrl) { /* implementation */ },
  async getItem(apiBaseUrl, id) { /* implementation */ },
  
  // Update
  async updateItem(apiBaseUrl, id, data) { /* implementation */ },
  
  // Delete
  async deleteItem(apiBaseUrl, id) { /* implementation */ }
};
```

### Search and Filter
```javascript
export const searchService = {
  async searchItems(apiBaseUrl, query, filters) { /* implementation */ },
  async getFilterOptions(apiBaseUrl) { /* implementation */ }
};
```

### File Upload
```javascript
export const fileService = {
  async uploadFile(apiBaseUrl, file, metadata) { /* implementation */ },
  async getFileUrl(apiBaseUrl, fileId) { /* implementation */ }
};
```
