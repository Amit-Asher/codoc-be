import { Express } from "express";
import crypto from 'crypto';
import { logger } from "../framework/logger";
import { RequestContext } from "../interfaces/common-interfaces";

export function enableMonitoring(app: Express) {
    app.use((req, res, next) => {
        // generate a new request id
        const rid = crypto.randomUUID();

        const requestContext = (req as RequestContext);
        // add the request id to the request object
        requestContext.rid = rid;
        // add the request id to the response headers
        res.set('X-Request-Id', rid);
        // start measuring the request duration
        requestContext.startTime = Date.now();

        // log the request when the request is received
        if (req.originalUrl.startsWith('/api')) {
            logger.info(`New request received to ${req.originalUrl}`, requestContext);
        }

        // log the response status when the response is finished
        res.on('finish', () => {
            // log the response status
            if (res.statusCode.toString().startsWith('2') || res.statusCode.toString().startsWith('3')) {
                const requestDuration = Date.now() - requestContext.startTime;
                logger.info(`Succeeded to complete ${req.method} ${req.originalUrl} with status ${res.statusCode} in ${requestDuration / 1000} seconds.`, requestContext);
            } else { // error
                const requestDuration = Date.now() - requestContext.startTime;
                logger.error(`Failed to complete ${req.method} ${req.originalUrl} with status code ${res.statusCode} in ${requestDuration / 1000} seconds.`, requestContext);
            }
        });

        next();
    });
}