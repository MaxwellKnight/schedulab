# Use a specific Node version instead of just node:18
FROM node:18.20.4-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean npm cache and install dependencies with additional flags for troubleshooting
RUN npm cache clean --force && \
    npm install --verbose --legacy-peer-deps --no-optional

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5713

# Set NODE_ENV
ENV NODE_ENV=development

# Start the application
CMD ["npm", "run", "dev", "--", "--host"]
