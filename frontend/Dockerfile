# Frontend Dockerfile

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies and build
RUN npm install && NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Expose frontend port
EXPOSE 3000

# Start the frontend app
CMD ["npm", "run", "start"]