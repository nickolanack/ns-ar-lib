import { AR } from '../../AR';
import { Observable } from "@nativescript/core";
export declare class FieldOfView extends Observable {
    private _lookingAtGroup;
    private _lookingAt;
    private _lookingTowardGroup;
    private _nearbyTimeout;
    private _atTimeout;
    private _centerX;
    private _centerY;
    private _width;
    private _height;
    private _viewInterval;
    private _ar;
    private _insightHash;
    constructor(ar: AR);
    private indexOf;
    remove(): void;
    private isInFront;
    private isInFocusRange;
    private computeDxDy;
    private isOnScreen;
}
