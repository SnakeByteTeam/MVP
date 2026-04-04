FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]

<<<<<<< HEAD
EXPOSE 3000
=======
EXPOSE 3000
>>>>>>> feature/alarms
