import { Vector3Common, Position, Vector } from './Vector3Common';
export declare class Vector3 extends Vector3Common {
    lerp(fraction: number, fromA: Position, toB: Position): Position;
    distance(fromA: Position, toB: Position): number;
    direction(fromA: Position, toB: Position): Vector;
    dot(a: Position, b: Position): number;
}
