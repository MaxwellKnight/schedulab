FROM node:18.20.4

# Add node user for better security and permissions
RUN mkdir -p /app && chown -R node:node /app

# Set working directory
WORKDIR /app

# Switch to node user
USER node

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Clean install with troubleshooting flags
RUN npm cache clean --force && \
    npm install --verbose --legacy-peer-deps

# Copy rest of the code with correct ownership
COPY --chown=node:node . .

# Expose port
EXPOSE 5713

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
