FROM node:10-alpine

WORKDIR /app

COPY . .

RUN npm i

EXPOSE 2828

CMD [ "npm", "run", "start" ]