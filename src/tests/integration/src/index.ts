import Muchas from '../../../..';

(async (): Promise<void> => {
    console.log('Starting test example application');
    await Muchas.init();
    console.log('Finished');
})();