import { ARCommonNode } from 'nativescript-ar';
import { AR, ARItem } from '../AR';
import { Selection } from './Selection';
export declare class ARCrowdCamera {
    private _selection;
    private _originNode;
    private _ar;
    constructor(ar: AR, selection: Selection);
    updateItem(node: ARCommonNode, item: ARItem): void;
    private _isSelected;
    private _setCrowdCamera;
    getScale(distance: any): number;
    private _getScaleFactorNew;
    private _getScaleFactor;
}
