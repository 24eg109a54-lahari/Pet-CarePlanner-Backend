# Use lightweight Node.js Alpine base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install dependencies if present
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose default port
EXPOSE 5000

# Run the backend server
CMD ["node", "server.js"]
