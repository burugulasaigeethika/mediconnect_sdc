# Running MediConnect Application

## Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn package manager

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mediconnect
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

### 3. Access the Application

Once both servers are running:
- Frontend will be available at: http://localhost:3000
- Backend API will be available at: http://localhost:5000

The frontend is configured to proxy API requests to the backend automatically.

## Troubleshooting

### Common Issues:

1. **Port Conflicts**: If ports 3000 or 5000 are already in use, you can change them in:
   - Frontend: `frontend/vite.config.js` (server.port)
   - Backend: `.env` file (PORT)

2. **MongoDB Connection**: Ensure MongoDB is running on your system and the connection string in `.env` is correct.

3. **CORS Issues**: The application is configured to allow requests from localhost:3000. If you're using a different port, update the `FRONTEND_URL` in the backend `.env` file.

### Verifying the Setup

1. Check if the backend is running by visiting: http://localhost:5000/api/health
2. Check if the frontend is running by visiting: http://localhost:3000