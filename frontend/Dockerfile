# Frontend Dockerfile

FROM node:20-alpine
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_PRIVY_CLIENT_ID
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_PRIVY_APP_ID=${NEXT_PUBLIC_PRIVY_APP_ID}
ENV NEXT_PUBLIC_PRIVY_CLIENT_ID=${NEXT_PUBLIC_PRIVY_CLIENT_ID}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies and build
RUN npm install && NODE_OPTIONS="--max-old-space-size=3072" npm run build


# Expose frontend port
EXPOSE 3000

# Start the frontend app
CMD ["npm", "run", "start"]