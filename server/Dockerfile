FROM node:18.20.4

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force && \
    npm install --verbose --legacy-peer-deps

COPY . .

EXPOSE 5713

CMD ["npm", "run", "dev", "--", "--host"]
