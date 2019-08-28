import { promisify } from 'util';

import redis, { RedisClient } from 'redis';

const client = redis.createClient(6379);

class Redis {
    redisInstance: RedisClient;
    get: any;
    set: any;

    constructor(port: number = 6379, host: string) {
        this.redisInstance = redis.createClient(port, host);
        this.get = promisify(client.get).bind(this.redisInstance);
        this.set = promisify(client.set).bind(this.redisInstance);
    }

}

export default Redis;