# Use full Node image instead of alpine
FROM node:18.20.4

# Set working directory
WORKDIR /app

# Install necessary build tools (in case they're needed)
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Show npm and node versions for debugging
RUN node -v && npm -v

# Clean npm cache and install dependencies with additional flags
RUN npm cache clean --force && \
    npm cache verify && \
    npm install -g npm@10.7.0 && \
    npm install --verbose --legacy-peer-deps --no-optional

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5713

# Set NODE_ENV
ENV NODE_ENV=development

# Start the application
CMD ["npm", "run", "dev", "--", "--host"]
