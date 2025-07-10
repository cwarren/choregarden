// Example service template for reference when creating new services
// This file serves as a template and should not be used in actual application code
// Copy this pattern when creating new domain-specific services

// ### Step 1: Create the Service File (you can copy this template as a starting point)
// 1. **Create the service file** in `src/services/`
//    - Name: `{domain}Service.js` (e.g., `choreService.js`, `gardenService.js`)
//    - Use camelCase for multi-word domains


// Step 2: Import Dependencies
// Import authService if your service needs authentication
import { authService } from './authService';
// Import any utilities your service might need

// Step 3: Define Service Object
// Create the service object with all your methods
export const exampleService = {
  // Step 4: Implement Service Methods
  // Follow the established pattern for each method:
  // - Accept apiBaseUrl as the first parameter
  // - Use try/catch blocks for error handling
  // - Include meaningful error messages
  // - Return the response data, not the full response object
  // - Use authService.createAuthHeaders() for authenticated requests

  /**
   * Example method showing the standard pattern for service methods
   * @param {string} apiBaseUrl - The base URL for API requests
   * @param {string} param1 - First parameter (customize as needed)
   * @param {Object} param2 - Second parameter (customize as needed)
   * @returns {Promise<Object>} - The response data from the API
   * @throws {Error} When the request fails or user is not authenticated
   */
  async exampleMethod(apiBaseUrl, param1, param2) {
    try {
      // Use authService.createAuthHeaders() for authenticated requests
      const response = await fetch(`${apiBaseUrl}/api/example-endpoint`, {
        method: 'GET', // or POST, PUT, DELETE
        headers: authService.createAuthHeaders(),
        // body: JSON.stringify(data) // for POST/PUT requests
      });

      // Check if response is successful
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Operation failed: ${response.status} - ${errorText}`);
      }

      // Return the response data, not the full response object
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error in exampleMethod:', error);
      // Include meaningful error messages
      throw error;
    }
  },

  /**
   * Example of a POST method with request body
   * @param {string} apiBaseUrl - The base URL for API requests
   * @param {Object} data - Data to send in the request body
   * @returns {Promise<Object>} - The response data from the API
   * @throws {Error} When the request fails or user is not authenticated
   */
  async createExample(apiBaseUrl, data) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/example`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers for authenticated requests
          ...authService.createAuthHeaders()
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create example: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating example:', error);
      throw error;
    }
  },

  /**
   * Example of a method that doesn't require authentication
   * @param {string} apiBaseUrl - The base URL for API requests
   * @returns {Promise<Object>} - The response data from the API
   * @throws {Error} When the request fails
   */
  async getPublicData(apiBaseUrl) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/public/example`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // No authentication headers needed for public endpoints
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch public data: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching public data:', error);
      throw error;
    }
  }

  // Step 5: Add to Services Index
  // Export your service from src/services/index.js:
  // export { exampleService } from './exampleService';

  // Step 6: Update Components
  // Import the service in components that need it:
  // import { exampleService } from '../services';

  // Step 7: Handle Loading and Error States
  // Add state management in components using the service:
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  // const [data, setData] = useState(null);

  // Step 8: Test the Integration
  // Test the service methods manually through the UI
  // Verify error handling by simulating network failures
  // Check authentication flow if applicable

  // Step 9: Document the Service
  // Add JSDoc comments to service methods (done above)
  // Update documentation if the service introduces new patterns
  // Document any new environment variables or configuration needed
};
