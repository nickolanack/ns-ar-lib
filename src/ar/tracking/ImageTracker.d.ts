import { AR } from '../../AR';
export declare class ImageTracker {
    private _ar;
    constructor(ar: AR);
    trackingImagesNearby(location: any, radius: any): void;
    onProximity(radius: any, callback: any): void;
}
