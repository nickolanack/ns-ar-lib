import { AR } from '../../AR';
import { Observable } from "@nativescript/core";
export declare class NearbyItems extends Observable {
    private _at;
    private _nearby;
    private _nearbyTimeout;
    private _atTimeout;
    constructor(ar: AR);
    remove(): void;
    protected _notifyUpdateNearby(): void;
    protected _notifyUpdateAt(): void;
}
