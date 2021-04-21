import { Observable } from "@nativescript/core";
import { WorldOrientation } from './WorldOrientation';
import { AR as Augmented } from 'nativescript-ar';
interface Coordinate {
    lat: number;
    lng: number;
}
export declare class WorldAlign extends Observable {
    private _worldOrientation;
    private _ar;
    private _cameraDifference;
    private _altitude;
    private _origin;
    private _worldNode;
    constructor(ar: Augmented, worldOrientation: WorldOrientation);
    getOriginCoordinate(): Coordinate;
    getCameraCoordinate(): Coordinate;
    getCameraOffset(): number;
    coordinateToVector3(coordinate: any): {
        x: number;
        y: number;
        z: number;
    };
    align(node: any, rotation: any): void;
}
export {};
