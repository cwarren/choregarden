# Adding a New Service

## What
This playbook covers how to add a service to a component.

## Why
You need to add a service to a componeent when:
- You've created a new service
- You're adding an existing service to a new or existing component

## How

### Step 1: Update Components
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

### Step 2: Handle Loading and Error States
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

### Step 3: Test the Integration
1. **Test the service methods** manually through the UI
2. **Verify error handling** by simulating network failures
3. **Check authentication flow** if applicable
4. **Test different response scenarios** (success, error, empty data)
