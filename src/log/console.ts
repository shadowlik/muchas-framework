import winston from 'winston';

const {
    combine, timestamp, printf,
} = winston.format;

const logFormat = printf(info => `${info.timestamp} ${info.level}: ${info.message}`);

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
                timestamp(),
                logFormat,
            ),
        });
    }
}

export { ConsoleLogger };
