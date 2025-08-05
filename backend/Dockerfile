# Backend Dockerfile
FROM node:20-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Expose backend port
EXPOSE 4000

# Start the backend server
CMD ["node", "index.js"]