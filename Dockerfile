FROM node:10-alpine

WORKDIR /app

COPY . .

RUN npm i

RUN npm run build

EXPOSE 2828

CMD [ "npm", "run", "start:prd" ]