FROM node:18-alpine  

WORKDIR /app
COPY package.json package-lock.json ./ 

RUN rm -rf node_modules && npm ci 

COPY . .

CMD ["npm", "run", "dev"]
