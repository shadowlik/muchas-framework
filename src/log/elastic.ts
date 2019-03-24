import winstonElasticsearch from 'winston-elasticsearch';
import winston from 'winston';
import * as Elasticsearch from  'elasticsearch';


class LoggerElastic {
    elasticsearchClient: Elasticsearch.Client;

    constructor(host: string, log: string) {
        this.elasticsearchClient = new Elasticsearch.Client({
            host,
            log,
        });
    }

    transport(level: string, indexPrefix: string): winstonElasticsearch {
        return new winstonElasticsearch({
            indexPrefix,
            level,
            client: this.elasticsearchClient,
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            transformer:(log: any): any => {
                const transformed: {[x: string]: {}} = {};
                transformed['@timestamp'] =
                    log.timestamp ? log.timestamp : new Date().toISOString();
                transformed.message = log.message;
                transformed.severity = log.level;
                // Log error Code
                transformed.errorCode = log.meta.errorCode;
                delete log.meta.errorCode;
                // Log unique ID
                transformed.uid = log.meta.uid;
                delete log.meta.uid;
                transformed.fields = log.meta;
                return transformed;
            },
        });
    }
}

export = LoggerElastic;
