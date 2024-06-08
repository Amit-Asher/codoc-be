interface LockContext {
    elementId: string;
    updatedBy: string;
    nextVersion: number;
}

interface LockResponse extends LockContext {
    success: boolean;
}

export class DebounceLock {
    lock: NodeJS.Timeout | null = null;
    lockedBy: string | null = null;
    debounceInMs: number;
    version: number = 0;

    constructor(debounceInMs: number) {
        this.debounceInMs = debounceInMs;
    }

    public acquire(context: LockContext): LockResponse {
        // if object is locked by another session, discard the operation
        if (this.lock && this.lockedBy !== context.updatedBy) {
            return {
                success: false,
                elementId: context.elementId,
                updatedBy: context.updatedBy,
                nextVersion: context.nextVersion,
            }
        }

        // if later version is already applied, discard the operation
        if (this.version > context.nextVersion) {
            return {
                success: false,
                elementId: context.elementId,
                updatedBy: context.updatedBy,
                nextVersion: context.nextVersion,
            }
        }

        if (this.lock) {
            // NOTE: the upcoming code between unlocking and relocking is still locked,
            // since the function is synchronous and single-threaded
            clearTimeout(this.lock);
        }

        // debounce- reset timeout
        this.lock = setTimeout(() => {
            this.lock = null;
            this.lockedBy = null;
        }, this.debounceInMs);

        // apply the operation
        this.lockedBy = context.updatedBy;
        this.version = context.nextVersion;

        // send response
        return {
            success: true,
            elementId: context.elementId,
            updatedBy: context.updatedBy,
            nextVersion: context.nextVersion,
        }
    }
}