FROM node:18-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["node","server.js"]
