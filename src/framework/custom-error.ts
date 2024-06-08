import { ErrorKey } from "../interfaces/error-keys";

export class ApiError {
    code: number;
    details: any;

    constructor(code: number, details: any) {
        this.code = code;
        this.details = details;
    }
}

export class ServiceError {
    errKey: ErrorKey;
    details: any;

    constructor(errKey: ErrorKey, details: any) {
        this.errKey = errKey;
        this.details = details;
    }
}