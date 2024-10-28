FROM node:18.20.4

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies
RUN rm -rf node_modules \
    && rm -f package-lock.json \
    && npm install

# Copy the rest
COPY . .

EXPOSE 5713

CMD ["npm", "run", "dev", "--", "--host"]
