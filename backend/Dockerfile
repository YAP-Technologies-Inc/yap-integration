FROM node:20-alpine

# ffmpeg for your audio pipeline
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Better layer caching: copy only package files first
COPY package*.json ./
RUN npm install

# then copy the rest
COPY . .

EXPOSE 4000

# run your dev script instead of node index.js
CMD ["npm", "run", "dev"]
