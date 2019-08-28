import { promisify } from 'util';

import redis, { RedisClient } from 'redis';

class Redis {
    redisInstance: RedisClient;
    get: any;
    set: any;

    constructor(uri: string) {
        this.redisInstance = redis.createClient(uri);
        this.get = promisify(this.redisInstance.get).bind(this.redisInstance);
        this.set = promisify(this.redisInstance.set).bind(this.redisInstance);
    }
}

export default Redis;