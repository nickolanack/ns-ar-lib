import { AR, ARItem } from '../AR';
export declare class Selection {
    private _lastSelected;
    private _lastPopover;
    private _ar;
    private _field;
    constructor(ar: AR, field: any);
    isSelected(item: any): boolean;
    selectObject(item: ARItem, fields: any): void;
    private _prepareTemplate;
}
