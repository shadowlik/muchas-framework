import Muchas from '../../../src';

(async (): Promise<void> => {
    console.log('Starting test example application');
    await Muchas.init();
    console.log('Finished');
})();