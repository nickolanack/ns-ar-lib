import { ARCommonNode } from 'nativescript-ar';
import { AR, ARItem, Feature } from '../../AR';
import { Observable, ImageSource } from "@nativescript/core";
import { Coordinate } from '../../spatial/Spherical';
export declare class Marker extends Observable {
    private _ar;
    private _item;
    private _labelHash;
    private _label;
    private _distLabel;
    private _altLabel;
    private _options;
    private _labelsVisible;
    getCoordinates(): Coordinate;
    getDistance(): number;
    getWorldDirectionVectorFromCamera(): any;
    getFeature(): Feature;
    getNode(): ARCommonNode;
    updateLabels(): void;
    showLabels(): void;
    hideLabels(): void;
    constructor(ar: AR, item: ARItem, options?: any);
    setIcon(markerIcon: string | ImageSource): Promise<unknown>;
    private drawLabel;
    private getDistanceLabel;
    private getAltitudeLabel;
    private drawDistance;
}
