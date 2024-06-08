import { logger } from "../../framework/logger";
import { DebounceLock } from "./DebounceLock";

export type Operation<T> = {
    type: 'insert';
    positionIdx: number;
    element: T;
} | {
    type: 'delete',
    positionIdx: number;
} | {
    type: 'update',
    element: T,
    updatedBy: string,
    version: number
};

interface Revision<T> {
    number: number;
    operations: Operation<T>[];
}

const DEBOUNCE_LOCK_IN_MS = 2000; // 2 seconds lock

/**
 * generic operational transformation engine.
 * T can be HTML element or a simple char
 */
export class OTEngine<T extends { id: string }> {

    /**
     * current state
     */
    public elements: T[] = [];

    /**
     * revisions history
     */
    public revisions: Revision<T>[] = [];

    /**
     * elements locks
     */
    public locks: { [elementId: string]: DebounceLock } = {};

    public insertElement(element: T, positionIdx: number) {
        this.elements.splice(positionIdx, 0, element);
        this.locks[element.id] = new DebounceLock(DEBOUNCE_LOCK_IN_MS);
    }

    public deleteElement(positionIdx: number) {
        // clean from list
        const element = this.elements.splice(positionIdx, 1);
        // clean its metadata
        if (element[0]) {
            delete this.locks[element[0].id];
        }
    }

    public updateElement(element: T, updatedBy: string, version: number) {
        // lock is created at element creation time. shouldnt be missing, but just in case
        if (this.locks[element.id]) {
            const isAcquired = this.locks[element.id].acquire({
                elementId: element.id,
                updatedBy: updatedBy,
                nextVersion: version
            })

            if (!isAcquired.success) {
                logger.warn(`Failed to acquire lock for element ${element.id}`);
                return;
            }

            // update the element
            const idx = this.elements.findIndex(e => e.id === element.id);
            if (idx >= 0) {
                this.elements[idx] = element;
            }
        }
    }

    private applyRevisionNoTransform(revision: Revision<T>): Revision<T> {
        for (const operation of revision.operations) {
            if (operation.type === 'insert') {
                this.insertElement(operation.element, operation.positionIdx);
            } else if (operation.type === 'delete') {
                this.deleteElement(operation.positionIdx);
            } else if (operation.type === 'update') {
                this.updateElement(operation.element, operation.updatedBy, operation.version);
            }
        }
        this.revisions.push(revision);
        return revision;
    }

    private transformInsertInsert(transformedOperation: any, concurrentOperation: any) {
        if (transformedOperation.positionIdx <= concurrentOperation.positionIdx) {
            return transformedOperation;
        } else if (transformedOperation.positionIdx === concurrentOperation.positionIdx) {
            // duplicate by design
            return { ...transformedOperation, positionIdx: transformedOperation.positionIdx + 1 };
        } else {
            return { ...transformedOperation, positionIdx: transformedOperation.positionIdx + 1 };
        }
    }

    private transformInsertDelete(transformedOperation: any, concurrentOperation: any) {
        if (transformedOperation.positionIdx <= concurrentOperation.positionIdx) {
            return transformedOperation;
        } else {
            return { ...transformedOperation, positionIdx: transformedOperation.positionIdx - 1 };
        }
    }

    private transformDeleteInsert(transformedOperation: any, concurrentOperation: any) {
        if (transformedOperation.positionIdx < concurrentOperation.positionIdx) {
            return transformedOperation;
        } else {
            return { ...transformedOperation, positionIdx: transformedOperation.positionIdx + 1 };
        }
    }

    private transformDeleteDelete(transformedOperation: any, concurrentOperation: any) {
        if (transformedOperation.positionIdx < concurrentOperation.positionIdx) {
            return transformedOperation;
        } else if (transformedOperation.positionIdx === concurrentOperation.positionIdx) {
            // cancel duplicate operation and avoid null pointer exception
            return null;
        } else {
            return { ...transformedOperation, positionIdx: transformedOperation.positionIdx - 1 };
        }
    }

    private transform(transformedOperation: any, concurrentOperation: any) {
        // if operation is null, it means it is duplicate and should be ignored
        if (transformedOperation === null) return null;

        // insert vs insert
        if (transformedOperation.type === 'insert' && concurrentOperation.type === 'insert') {
            return this.transformInsertInsert(transformedOperation, concurrentOperation);
        }

        // insert vs delete
        if (transformedOperation.type === 'insert' && concurrentOperation.type === 'delete') {
            return this.transformInsertDelete(transformedOperation, concurrentOperation);
        }

        // delete vs insert
        if (transformedOperation.type === 'delete' && concurrentOperation.type === 'insert') {
            return this.transformDeleteInsert(transformedOperation, concurrentOperation);
        }

        // delete vs delete
        if (transformedOperation.type === 'delete' && concurrentOperation.type === 'delete') {
            return this.transformDeleteDelete(transformedOperation, concurrentOperation);
        }

        // never reach here, just in case
        return null;
    }

    public apply(revision: Revision<T>): Revision<T> {
        // if no conflict, apply the revision
        if (revision.number === this.revisions.length) {
            const newRevision = this.applyRevisionNoTransform(revision);
            return newRevision;
        }

        // else need to solve conflicts and transform the revision
        const newRevision: Revision<T> = { number: this.revisions.length, operations: [] };
        // get all the revisions after the current revision (i.e concurrent revisions)
        const concurrentOperations = this.revisions.slice(revision.number).flatMap(r => r.operations);
        for (const operation of revision.operations) {
            // skip transform of update operations- different algorithm
            if (operation.type === 'update') {
                newRevision.operations.push(operation);
                continue;
            }

            // iterate through all concurrent operations and transform the current operation
            const transformedOperation = concurrentOperations.reduce(this.transform, operation);

            // if transformed operation is null, it means it is duplicate and should be ignored
            if (transformedOperation === null) continue;

            // build transformed revision
            newRevision.operations.push(transformedOperation);
        }

        // apply transformed revision to state in place
        // (if no operations exist, then empty revision created)
        this.applyRevisionNoTransform(newRevision);
        return newRevision;
    }
}
