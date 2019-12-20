import winston from 'winston';
import moment from 'moment-timezone';

const {
    combine, printf,
} = winston.format;

const logFormat = printf((info): string => 
    info.level.indexOf('error') === -1 ? 
        `${info.timestamp} ${info.level}: ${info.message}` :
        `${info.timestamp} ${info.level}: ${info.message}
${info.stack}
        `
);

const appendTimestamp: any = winston.format((info, opts): any => {
    if(opts.tz)
        info.timestamp = moment().tz(opts.tz).format();
    return info;
});

class ConsoleLogger {
    level: string;

    constructor(level: string) {
        this.level = level;
    }

    transport(): winston.transports.ConsoleTransportInstance {
        return new winston.transports.Console({
            level: this.level,
            format: combine(
                winston.format.colorize(),
                appendTimestamp({ tz: 'America/Sao_Paulo' }),
                logFormat,
            ),
        });
    }
}

export { ConsoleLogger };
