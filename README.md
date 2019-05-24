# ![Muchas Framework](doc/muchas.png) Muchas Framework
[![npm version](https://badge.fury.io/js/muchas-framework.svg)](https://badge.fury.io/js/muchas-framework) [![CircleCI](https://circleci.com/gh/shadowlik/muchas-framework.svg?style=shield)](https://circleci.com/gh/shadowlik/muchas-framework) [![Coverage Status](https://coveralls.io/repos/github/shadowlik/muchas-framework/badge.svg?branch=master)](https://coveralls.io/github/shadowlik/muchas-framework?branch=master)

Muchas is an opinionated microservice nodejs framework. We use a set of other frameworks to build a rich ecoystem with a standard way of building applications.

## Installing

> npm i -s muchas-framework

## How it works

We are explain using the default folder strucuture. The MuchasFr

## Quick start

```typescript
import MuchasFramework from 'muchas-framework';

(async () => await MuchasFramework.init())();
```

## muchas.yml and .env

We can use two files to define our environment variables, we use the `muchas.yml` to help us organize our config object and a .env file for dynamic configuration values.

### muchas.yml example

All the ${VARIABLE} will be replaced buy the environment variables

```yaml
env: ${NODE_ENV} # Enviroment (development, production)
name: ${PROJECT_NAME} # Project name
debug: # Debug options
  port: ${DEBUG_PORT} # NodeJS debug port
web: # Web server
  port: ${SERVER_PORT} # Web server port
  headers: # Web server default response headers
    Access-Control-Allow-Origin: '*'
    Access-Control-Allow-Methods: '*'
    Access-Control-Allow-Headers: '*'
health: # Health web server
  port: 9000 # Health web server port
apm: # Application performance management
  host: ${APM_HOST} # Host
  logLevel: ${APM_LEVEL} # Level
  sample: 0.2 # Sample rate
logger: # Logger
  elasticsearch: # Elasticsearch logger
    host: ${LOGGER_ELASTIC_HOST} # Elastic host
    level: ${LOGGER_ELASTIC_LEVEL} # Log level
database: # Database
  uri: ${DATABASE_URI} # Database URI
  model: # Models
    path: ${MODELS_PATH} # Model base path
broker: # Broker
  host: ${BROKER_HOST} # Broker Host
components: # Components
  path: ${COMPONENTS_PATH} # Components base path
```

### .env example

```bash
NODE_ENV=development
DATABASE_URI=mongodb://mongo/muchas
SERVER_PORT=6028
BROKER_HOST=rabbit
COMPONENTS_PATH=dist/tests/integration/components
MODELS_PATH=dist/tests/integration/models
LOGGER_ELASTIC_HOST=http://elastic:9200
LOGGER_ELASTIC_LEVEL=error
PROJECT_NAME=muchas
APM_HOST=http://elastic-apm:8200
APM_LEVEL=error
```

## Web

The web application uses [express](https://github.com/expressjs/express) under the hood

## Broker

We support amqp protocol for our message broker and we encourage to use it with [RabbitMQ](https://www.rabbitmq.com/)

### Message Queue

### RPC (Beta)

## Routines

## Health

## Logger

### Levels

|Level|Priority|
|---|---|
|error|0|
|warn|1|
|info|2|
|verbose|3|
|debug|4|
|silly|5|

## Loading Flow

[Google Draw](https://docs.google.com/drawings/d/1d_GYNWtXPEzYliMAQ0X0daqeNN8Kqzk5qS1vwtb5mA8/edit?usp=sharing)

## Big thanks to

* https://github.com/Automattic/mongoose
* https://github.com/timisbusy/node-amqp-stats
* https://github.com/expressjs/express
* https://github.com/squaremo/amqp.node
* https://github.com/agenda/agenda