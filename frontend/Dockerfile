# Use Node 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/prescriptions uploads/profile-pictures uploads/doctor-prescriptions

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
