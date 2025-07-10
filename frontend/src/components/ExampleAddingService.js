// Example component showing how to integrate services into React components
// This file serves as a template and should not be used in actual application code
// Copy this pattern when adding services to new or existing components. This example
// assumes you have a service named `exampleService` that you want to use in this existing
// component, but the process is the same for a new component.

// Step 1: Import Dependencies
// Import React hooks for component state management
import React, { useState, useEffect } from 'react';
// Import the service you want to use in this component
import { exampleService } from '../services';
// Import any other services your component needs
// import { userService, authService } from '../services';

// Step 2: Define Component with Service Integration
export default function ExampleAddingService({ userId, apiBaseUrl }) {
  // Step 3: Set Up Component State
  // Add state management for service data and UI states
  // Always include: data, loading, error states for better UX
  
  const [data, setData] = useState(null);           // Service response data
  const [loading, setLoading] = useState(false);    // Loading indicator
  const [error, setError] = useState(null);         // Error messages
  const [success, setSuccess] = useState(false);    // Success feedback
  
  // Additional state for form data if needed
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Step 4: Implement Data Fetching
  // Use useEffect to fetch data when component mounts or dependencies change
  useEffect(() => {
    async function fetchData() {
      // Always set loading to true when starting async operations
      setLoading(true);
      setError(null); // Clear previous errors
      
      try {
        // Call the service method with required parameters
        // Remember: apiBaseUrl is always the first parameter
        const result = await exampleService.exampleMethod(apiBaseUrl, userId, {});
        
        // Update state with the response data
        setData(result);
      } catch (err) {
        // Handle errors by setting error state
        // Service errors are already formatted with meaningful messages
        setError(err.message);
        console.error('Failed to fetch data:', err);
      } finally {
        // Always set loading to false when operation completes
        setLoading(false);
      }
    }
    
    // Only fetch if we have required parameters
    if (userId && apiBaseUrl) {
      fetchData();
    }
  }, [userId, apiBaseUrl]); // Re-fetch when dependencies change

  // Step 5: Implement User Actions (POST/PUT/DELETE)
  // Handle form submissions and user interactions that call service methods
  const handleCreateItem = async (event) => {
    event.preventDefault(); // Prevent form submission reload
    
    // Set loading state for the action
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Call service method for creating/updating data
      const newItem = await exampleService.createExample(apiBaseUrl, formData);
      
      // Update UI state based on successful operation
      setSuccess(true);
      
      // Option 1: Add new item to existing data
      setData(prevData => [...(prevData || []), newItem]);
      
      // Option 2: Re-fetch all data (simpler but less efficient)
      // const refreshedData = await exampleService.exampleMethod(apiBaseUrl, userId, {});
      // setData(refreshedData);
      
      // Clear form after successful submission
      setFormData({ name: '', description: '' });
      
    } catch (err) {
      // Handle creation errors
      setError(err.message);
      console.error('Failed to create item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Handle Form Input Changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Step 7: Implement Loading States
  // Show loading indicator while async operations are in progress
  if (loading && !data) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Step 8: Implement Error States
  // Show error messages when service calls fail
  if (error && !data) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <button 
          onClick={() => window.location.reload()} 
          className="ml-4 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Step 9: Render Component with Data
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Example Service Integration</h2>
      
      {/* Success feedback */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Operation completed successfully!
        </div>
      )}
      
      {/* Error feedback for actions (not blocking) */}
      {error && data && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Form for creating new items */}
      <form onSubmit={handleCreateItem} className="mb-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows="3"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Item'}
        </button>
      </form>
      
      {/* Display fetched data */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Data from Service:</h3>
        {data ? (
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
}

// Step 10: Usage in Parent Components
// Import and use this component in your app:
// 
// import ExampleAddingService from './components/ExampleAddingService';
// 
// function App() {
//   const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
//   const userId = 'user-123';
//   
//   return (
//     <ExampleAddingService 
//       userId={userId} 
//       apiBaseUrl={apiBaseUrl} 
//     />
//   );
// }

// Best Practices Demonstrated:
// 1. Proper state management (data, loading, error, success)
// 2. Error handling with user-friendly messages
// 3. Loading states for better UX
// 4. Form handling with controlled inputs
// 5. Dependency arrays in useEffect
// 6. Conditional rendering based on state
// 7. Accessibility considerations (labels, semantic HTML)
// 8. Responsive design with Tailwind CSS
