# Use full Node image
FROM node:18.20.4

# Set working directory
WORKDIR /app

# Install necessary build tools
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Show versions for debugging
RUN node -v && npm -v

# Copy package files
COPY package*.json ./

# Fix permissions and install dependencies
RUN mkdir -p /root/.npm && \
    chmod -R 777 /root/.npm && \
    npm config set unsafe-perm true && \
    npm install --verbose --legacy-peer-deps --no-optional

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5713

# Set NODE_ENV
ENV NODE_ENV=development

# Start the application
CMD ["npm", "run", "dev", "--", "--host"]
