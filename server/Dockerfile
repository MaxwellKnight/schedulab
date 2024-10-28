FROM node:18.20.4

# Install debugging tools and build essentials
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Create app directory and set permissions
RUN mkdir -p /app && \
    chown -R node:node /app

# Set working directory
WORKDIR /app

# Switch to node user
USER node

# Print versions for debugging
RUN node -v && npm -v

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Install specific npm version and clear cache
RUN npm install -g npm@10.7.0 && \
    npm cache clean --force && \
    npm cache verify && \
    npm install --verbose --legacy-peer-deps --production=false

# Copy rest of the code with correct ownership
COPY --chown=node:node . .

# Expose port
EXPOSE 5713

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5713/ || exit 1

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
