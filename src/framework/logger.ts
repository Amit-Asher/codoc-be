import *  as  winston from 'winston';
import moment from 'moment';
import { RequestContext } from '../interfaces/common-interfaces';
import DailyRotateFile from 'winston-daily-rotate-file';

interface LogContext {
    ip: string;
    method: string;
    url: string;
    headers: any;
    body: string;
    query: any;
    params: any;
    rid: string;
}

class RequestsLogger {
    logger: winston.Logger;

    constructor() {
        const format = winston.format.combine(
            winston.format.splat(),
            winston.format.printf((_context: any) => {
                
                const context = _context as unknown as winston.Logform.TransformableInfo & LogContext;
                const ipSrc = context.headers['x-forwarded-for']?.split(',')?.[0];
                const timestamp = moment.utc().format('YYYY-MM-DD HH:mm:ss');
                const ip = ipSrc ? ` [ip: ${ipSrc}]` : '';
                const infoLevel = context.level ? ` [${context.level}]` : '';
                const rid = context.rid ? ` [rid: ${context.rid}]` : '';
                return `${timestamp}${ip}${infoLevel}${rid}: ${context.message}`;
            })
        );

        const filesTrnasport = new DailyRotateFile({
            filename: 'fs-app-logs-%DATE%.log',
            format: format,
            level: 'debug',
            options: { maxFiles: 10 },
            dirname: './logs',
            maxSize: '20m',
            maxFiles: '14d'
        });

        this.logger = winston.createLogger({
            level: 'debug',
            transports: [
                new winston.transports.Console({ format }),
                filesTrnasport
            ]
        });
    }

    private getLogContext(req?: RequestContext): LogContext {
        return {
            ip: req?.ip || '',
            method: req?.method || '',
            url: req?.url || '',
            headers: req?.headers || '',
            body: req?.body || '',
            query: req?.query || {},
            params: req?.params || {},
            rid: req?.rid || ''
        }
    }

    public debug(message: string, req?: RequestContext) {
        const context: LogContext = this.getLogContext(req);
        this.logger.debug(message, context);
    }

    public info(message: string, req?: RequestContext) {
        const context = this.getLogContext(req);
        this.logger.info(message, context);
    }

    public warn(message: string, req?: RequestContext) {
        const context = this.getLogContext(req);
        this.logger.warn(message, context);
    }

    public error(message: string, req?: RequestContext) {
        const context = this.getLogContext(req);
        this.logger.error(message, context);
    }

    get transports() {
        return this.logger.transports;
    }
}

export let logger: RequestsLogger;
export function initLogger() {
    logger = new RequestsLogger();
}