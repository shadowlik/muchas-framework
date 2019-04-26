FROM node:10-alpine

WORKDIR /app

COPY . .

RUN npm i

RUN npm i nodemon --global

RUN npm run build:prd

EXPOSE 2828

CMD [ "npm", "run", "start:prd" ]