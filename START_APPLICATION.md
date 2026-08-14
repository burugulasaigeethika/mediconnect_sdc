# How to Start the MediConnect Application

## Current Setup Status

The application has been configured and both servers are now running:

- **Backend Server**: http://localhost:5000
- **Frontend Server**: http://localhost:3000

## Accessing the Application

1. Open your web browser
2. Navigate to: http://localhost:3000
3. You should see the MediConnect homepage

## Services Running in Background

Two terminal processes are currently running:

1. **Backend Terminal** (PID stored in terminal #2):
   - Running Node.js/Express server
   - Connected to MongoDB
   - Serving API endpoints

2. **Frontend Terminal** (PID stored in terminal #4):
   - Running Vite development server
   - Using port 3000
   - Proxying API requests to backend

## Verification

You can verify that both services are running correctly:

1. **Backend Health Check**:
   - Visit: http://localhost:5000/api/health
   - Should return: `{"status":"ok","message":"MediConnect API is running",...}`

2. **Frontend Access**:
   - Visit: http://localhost:3000
   - Should display the MediConnect homepage

## Stopping the Application

To stop the application, you'll need to terminate both background processes:

1. Press `Ctrl+C` in each terminal window
2. Or use Task Manager to end the Node.js processes

## Troubleshooting

If you encounter issues:

1. **Check MongoDB**: Ensure MongoDB is running on your system
2. **Verify Ports**: Make sure ports 5000 and 3000 are not blocked by firewall
3. **Restart Servers**: Stop both servers and restart them in order (backend first, then frontend)
4. **Check Console**: Look at browser developer tools for any error messages

## Restarting the Application

If you need to restart the application later:

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```
   cd frontend
   npm run dev
   ```

3. The application should now be accessible at http://localhost:3000
4. Access the application in your browser using the assigned port

## Configuration Files

Important configuration files that were fixed:

- `backend/.env` - Contains environment variables
- `frontend/vite.config.js` - Vite configuration with proxy settings
- `frontend/src/config/api.js` - Centralized API configuration
- `backend/server.js` - CORS configuration updated to allow frontend origin