import { WorldOrientation } from './WorldOrientation';
import { WorldAlign } from './WorldAlign';
import { AR } from "../AR";
export declare class ARCompass {
    private _ar;
    private _augmented;
    private _worldPosition;
    private _worldAlign;
    constructor(ar: AR, worldPosition: WorldOrientation, worldAlign: WorldAlign);
    private _renderHeading;
    private _addString;
    private _addDot;
    private _addArrow;
    private _renderLocation;
}
