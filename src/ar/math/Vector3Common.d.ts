export interface Position {
    x: number;
    y: number;
    z: number;
}
export interface Vector {
    x: number;
    y: number;
    z: number;
}
export declare abstract class Vector3Common {
    abstract lerp(percent: number, fromA: Position, toB: Position): Position;
    abstract distance(fromA: Position, toB: Position): number;
    abstract direction(fromA: Position, toB: Position): Vector;
    abstract dot(a: Vector, v: Vector): number;
    center(a: Vector, b: Vector): Position;
    static Zero(): {
        x: number;
        y: number;
        z: number;
    };
}
