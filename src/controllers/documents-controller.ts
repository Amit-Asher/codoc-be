import {
    Controller,
    Route,
    Tags,
    Request,
    Get} from "tsoa";
import { RequestContext } from "../interfaces/common-interfaces";
import { logger } from "../framework/logger";
import { ApiError, ServiceError } from "../framework/custom-error";
import { ErrorKey, messagesByErrorKey } from "../interfaces/error-keys";
import { docEngine, DocumentTrack, WSTopic } from "../services/documents-service";

@Route(`api`)
@Tags(`Documents`)
export class DocumentsController extends Controller {

    @Get('/get-document')
    public async getDocument(
        @Request() request: RequestContext
    ): Promise<DocumentTrack> {
        const prefix = `[DocumentsController.getDocument]`;
        try {
            logger.info(`${prefix} start`, request);
            return {
                nextRevision: docEngine.revisions.length,
                elements: docEngine.elements
            }
        } catch (err: any) {
            logger.error(`${prefix} error: ${err?.message}, details: ${err?.details}`, request);
            if (err instanceof ServiceError) {
                throw new ApiError(400, { message: messagesByErrorKey[err.errKey], errorKey: err.errKey });
            }
            throw new ApiError(400, { message: 'Failed to get', errorKey: ErrorKey.InternalServerError });
        }
    }

    @Get('/get-topics')
    public async getTopics(
        @Request() request: RequestContext
    ): Promise<WSTopic[]> {
        const prefix = `[DocumentsController.getTopics]`;
        try {
            logger.info(`${prefix} start`, request);
            return Object.values(WSTopic);
        } catch (err: any) {
            logger.error(`${prefix} error: ${err?.message}, details: ${err?.details}`, request);
            if (err instanceof ServiceError) {
                throw new ApiError(400, { message: messagesByErrorKey[err.errKey], errorKey: err.errKey });
            }
            throw new ApiError(400, { message: 'Failed to get', errorKey: ErrorKey.InternalServerError });
        }
    }
}
