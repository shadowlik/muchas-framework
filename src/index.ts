import Web from './web';

/**
 * Main File
 */
class Muchas {
    Web: Web;

    constructor() {

    };

    init (): void {
        return;
    }
};

if (require.main === module) {
    (async () => await new Muchas().init())();
}
