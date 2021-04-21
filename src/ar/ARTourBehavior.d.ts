import { TourBehavior } from '../map/TourBehavior';
import { AR } from '../AR';
export declare class ARTourBehavior extends TourBehavior {
    protected _ar: AR;
    constructor(ar: AR, options: any);
    protected startTour(): void;
    private _drawLine;
    protected focusTourStep(index: any): void;
    protected endTour(): void;
    protected getVisibleItemLocationData(tourItem: any, callback: any): void;
    protected getItemLabel(tourItem: any, callback: any): void;
}
