FROM node:18.20.4

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ${NODE_DOCKER_PORT}
CMD ["npm", "run", "dev", "--", "--host"]
