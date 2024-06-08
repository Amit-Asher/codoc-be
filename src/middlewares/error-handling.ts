import {
    Response as ExResponse,
    Request as ExRequest,
    NextFunction,
    Express
} from "express";
import { ValidateError } from "tsoa";
import { ApiError } from "../framework/custom-error";
import { logger } from "../framework/logger";
import { RequestContext } from "../interfaces/common-interfaces";

export function enableErrorHandling(app: Express): void {
    app.use(function errorHandler(
        err: unknown,
        req: ExRequest,
        res: ExResponse,
        next: NextFunction
    ): ExResponse | void {

        if (err instanceof ValidateError) {
            logger.error(`Caught Validation Error for ${req.path}: ${JSON.stringify(err.fields)}`, req as RequestContext);
            return res.status(422).json({
                message: "Validation Failed",
                details: err?.fields,
            });
        }

        if (err instanceof ApiError) {
            const code = err.code || 400;
            const details = err.details || {};
            return res.status(code).json(details);
        }

        if (err) {
            logger.error(`Caught unknown error: ${JSON.stringify(err)}`, req as RequestContext);
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }

        next();
    });
}
