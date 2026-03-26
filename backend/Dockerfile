<<<<<<< HEAD
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]

EXPOSE 3000
=======
FROM node:25-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 
COPY . .
RUN npm run build 
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
>>>>>>> backend
