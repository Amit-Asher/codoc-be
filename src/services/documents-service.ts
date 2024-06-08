import { OTEngine } from "./OT/OTEngine";

export enum ElementType {
    Shape = 'Shape'
}

export interface ShapeElement {
    type: ElementType.Shape;
    id: string;
    top: number;
    left: number;
}

export enum WSTopic {
    CursorTracking = 'CursorTracking',
    PostRevision = 'PostRevision',
    PublishRevision = 'PublishRevision'
}

export interface DocumentTrack {
    nextRevision: number;
    elements: ShapeElement[];
}

export type DocElement = ShapeElement;
export const docEngine: OTEngine<ShapeElement> = new OTEngine();
