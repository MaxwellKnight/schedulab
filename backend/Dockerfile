FROM node:18.20.4

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5713

CMD ["npm", "run", "dev", "--", "--host"]
