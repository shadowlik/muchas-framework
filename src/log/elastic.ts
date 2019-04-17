import winstonElasticsearch from 'winston-elasticsearch';
import * as Elasticsearch from  'elasticsearch';

interface ElasticLoggerOptions {
    host: string;
    level?: string;
    indexPrefix?: string;
}

class ElasticLogger {
    elasticsearchClient: Elasticsearch.Client;

    constructor(host: string, log: string = 'none') {
        this.elasticsearchClient = new Elasticsearch.Client({
            host,
            log,
        });
    }

    /**
     *
     * @param level
     * @param indexPrefix
     */
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
                if (log.meta.errorCode) {
                    transformed.errorCode = log.meta.errorCode;
                    delete log.meta.errorCode;
                }
                // Log unique ID
                if (log.meta.uid) {
                    transformed.uid = log.meta.uid;
                    delete log.meta.uid;
                }
                transformed.meta = log.meta;
                return transformed;
            },
        });
    }
}

export { ElasticLogger, ElasticLoggerOptions, winstonElasticsearch };
