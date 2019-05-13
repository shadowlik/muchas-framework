FROM node:10-alpine

WORKDIR /app

COPY . .

RUN npm i

RUN npm i nodemon --global

EXPOSE 2828

CMD [ "npm", "run", "start:dev" ]