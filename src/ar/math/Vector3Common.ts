
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

export abstract class Vector3Common {


	public abstract lerp(percent: number, fromA: Position, toB: Position): Position;
	public abstract distance(fromA: Position, toB: Position): number;
	public abstract direction(fromA: Position, toB: Position): Vector;

	public abstract dot(a: Vector, v: Vector): number;

	public center(a: Vector, b: Vector) {
		return this.lerp(0.5, a, b);
	}



	public static Zero() {
		return {x: 0, y: 0, z: 0};
	}
}