# Enabling Socket.io Real-time Features

The Socket.io real-time features are currently **disabled** to allow the application to run without import errors.

## What's Disabled
- Real-time notifications for appointments
- Live order status updates
- Instant messaging between doctors and patients

## How to Enable Socket.io

### Step 1: Ensure Package is Installed
In the `frontend` directory, verify `socket.io-client` is installed:
```bash
cd frontend
npm install socket.io-client
```

### Step 2: Stop the Frontend Server
Press `Ctrl+C` in the terminal running the frontend to stop it completely.

### Step 3: Restart the Frontend Server
```bash
npm run dev -- --port 3000
```

### Step 4: Uncomment Socket.io Code
After the server restarts successfully, uncomment the following lines in [`App.jsx`](file:///d:/ps1/mediconnect5/frontend/src/App.jsx):

**Line 4:** Change:
```javascript
// import { SocketProvider } from './context/SocketContext';
```
To:
```javascript
import { SocketProvider } from './context/SocketContext';
```

**Lines 93-97:** Change:
```javascript
<AuthProvider>
    {/* SocketProvider temporarily disabled */}
    <Router>
        <AppContent />
    </Router>
</AuthProvider>
```
To:
```javascript
<AuthProvider>
    <SocketProvider>
        <Router>
            <AppContent />
        </Router>
    </SocketProvider>
</AuthProvider>
```

### Step 5: Verify
Refresh the browser at `http://localhost:3000` and check that there are no console errors.

## Current Status
✅ **Application is functional** without real-time features  
⏳ **Socket.io integration** is ready but disabled  
📦 **Package installed** in `package.json`
