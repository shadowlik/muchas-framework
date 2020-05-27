FROM node:10

RUN npm install @google-cloud/profiler

WORKDIR /app

COPY . .

RUN npm i

EXPOSE 2828

CMD [ "npm", "run", "start" ]