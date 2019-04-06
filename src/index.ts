import Web from './web';
import Log from './log';

/**
 * Main File
 */
class Muchas {
    Web: Web;
    Log: Log;

    /**
     * Creates an instance of Muchas.
     * @memberof Muchas
     */
    constructor() {
        const {
            LOGGER_ELASTIC_HOST,
            LOGGER_ELASTIC_LEVEL
        } = process.env;

        this.Log = new Log({
            elastic: {
                host: LOGGER_ELASTIC_HOST,
                level: LOGGER_ELASTIC_LEVEL || 'debug'
            }
        });
    };

    init (): void {
        return;
    }
};

if (require.main === module) {
    (async () => await new Muchas().init())();
}
