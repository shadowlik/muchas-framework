import apm from 'elastic-apm-node';

interface ApmOptions {
    loglevel: LovLevel;
    apmHost: string;
    sample: number;
    token?: string;
};

type LovLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export = (name: string, nodeEnv: string, apmOptions: ApmOptions | undefined): any | undefined => {
    if (!name || !apmOptions) return undefined;
    const logLevel: LovLevel = apmOptions.loglevel;
    const opt: any = {
        transactionSampleRate: apmOptions.sample,
        serviceName: nodeEnv === 'production' ?
            name :
            `${name}-${nodeEnv || 'development'}`,
        serverUrl: apmOptions.apmHost,
        logLevel,
    };

    if (apmOptions.token)  opt.secretToken = apmOptions.token;

    return apm.start(opt);
};