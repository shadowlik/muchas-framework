import apm from 'elastic-apm-node';

type LovLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export = (name: string, loglevel: LovLevel, nodeEnv: string, apmHost: string, sample: number): any => {
    const logLevel: LovLevel = loglevel;

    return apm.start({
        transactionSampleRate: sample,
        serviceName: nodeEnv === 'production' ?
            name :
            `${name}-${nodeEnv || 'development'}`,
        serverUrl: apmHost,
        logLevel,
    });

};