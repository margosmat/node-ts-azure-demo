import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
    transports: [
        new winston.transports.DailyRotateFile({
            level: 'info',
            filename: `%DATE%.log`,
            datePattern: 'DD-MM-YYYY',
            dirname: 'logs',
            handleExceptions: true,
            maxSize: '5m',
            maxFiles: 5
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true
        })
    ],
    exitOnError: false
});

export default logger;