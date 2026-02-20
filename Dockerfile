# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies required for Expo and React Native
RUN apk add --no-cache \
    git \
    bash

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Expo development server ports
# 8081: Metro bundler
# 19000: Expo Dev Tools
# 19001: Expo Dev Tools (HTTP)
# 19002: Expo Dev Tools (HTTPS)
EXPOSE 8081 19000 19001 19002

# Set environment variables
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Start the development server with LAN option
CMD ["npm", "start", "--", "--lan"]
