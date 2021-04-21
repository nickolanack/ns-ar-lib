import { Vector3Common, Position, Vector } from './Vector3Common';


export class Vector3 extends Vector3Common {


	public lerp(fraction: number, fromA: Position, toB: Position): Position {
		let dir = _subtractV(toB, fromA);
		let l = _lengthV(dir);
		let n = _divide(dir, l);

		let d = l * Math.min(1, Math.max(0, fraction));

		return {
			x: fromA.x + n.x * d,
			y: fromA.y + n.y * d,
			z: fromA.z + n.z * d
		};
	}

	public distance(fromA: Position, toB: Position): number {
		return _lengthV(_subtractV(toB, fromA));
	}



	public direction(fromA: Position, toB: Position): Vector {


		let dV = _subtractV(toB, fromA);
		let m = _lengthV(dV);

		return {x: dV.x / m, y: dV.y / m, z: dV.z / m};

	}

	public dot(a: Vector, b: Vector): number {

	 	let d = a.x * b.x + a.y * b.y + a.z * b.z;


		// let d= simd_dot(simd_float3(a.x, a.y, a.z), simd_float3(b.x, b.y, b.z));
		 return d;
	}

}





const _subtractV = (a: Position, b: Position) => {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
		z: a.z - b.z,
	};
};

const _lengthV = (a: Vector) => {
	return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2) + Math.pow(a.z, 2));
};
const _divide = (a: Vector, m: number) => {
	if (!m) {
		m = this._lengthV(a);
	}
	return {
		x: a.x / m,
		y: a.y / m,
		z: a.z / m,
	};
};


