import { Observable } from "@nativescript/core";
declare type Latitude = number;
declare type Longitude = number;
declare type Altitude = number;
declare type Heading = number;
interface Location {
    lat: Latitude;
    lng: Longitude;
    alt: Altitude;
}
export declare class WorldOrientation extends Observable {
    private _fakeInitialLocation;
    private _currentHeading;
    private _currentLocation;
    private _initialLocation;
    private _locationMonitor;
    private _headingInterval;
    private _locationInterval;
    constructor();
    setInitialLocation(location: Location): void;
    firstHeading(callback: (heading: Heading) => void): void;
    firstLocation(callback: (location: Location) => void): void;
    getHeadingTime(): number;
    getLocationTime(): number;
    monitorWorldOrientation(): Promise<unknown>;
    hasOrientation(): boolean;
    getLocation(): Location;
    getHeading(): number;
    private _monitorLocation;
    addGeofence(location: any, distance: any, callback: any): void;
    private _monitorOrientation;
}
export {};
