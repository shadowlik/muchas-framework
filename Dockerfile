FROM node:10

WORKDIR /app

COPY . .

RUN npm i

EXPOSE 2828

CMD [ "npm", "run", "start" ]