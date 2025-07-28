FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install OS dependencies
RUN apk add --no-cache libc6-compat

# Copy package files and install prod dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Set environment variables
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_PRIVY_CLIENT_ID
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PRIVY_APP_ID=$NEXT_PUBLIC_PRIVY_APP_ID
ENV NEXT_PUBLIC_PRIVY_CLIENT_ID=$NEXT_PUBLIC_PRIVY_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=development

# Build the Next.js app
RUN npm run build

# Expose Next.js server port
EXPOSE 3000

# Run production server
CMD ["npm", "start"]
