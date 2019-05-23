import apm from 'elastic-apm-node';

interface ApmOptions {
    loglevel: LovLevel;
    apmHost: string;
    sample: number;
};

type LovLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export = (name: string, nodeEnv: string, apmOptions: ApmOptions | undefined): any => {
    if (!name || nodeEnv || !apmOptions) return undefined;

    const logLevel: LovLevel = apmOptions.loglevel;

    return apm.start({
        transactionSampleRate: apmOptions.sample,
        serviceName: nodeEnv === 'production' ?
            name :
            `${name}-${nodeEnv || 'development'}`,
        serverUrl: apmOptions.apmHost,
        logLevel,
    });
};