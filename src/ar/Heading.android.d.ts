export declare class Heading {
    private _sensorManager;
    private _sensorUpdate;
    clearWatch(): void;
    watchHeading(callback: (heading: number) => void, options?: any): void;
}
