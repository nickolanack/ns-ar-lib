import {Vector3Common, Position, Vector} from './Vector3Common';


export class Vector3 extends Vector3Common {
	public lerp(fraction: number, fromA: Position, toB: Position): Position {

		const posA = new com.google.ar.sceneform.math.Vector3(fromA.x, fromA.y, fromA.z); // nodeAndroid.getWorldPosition();
		const posB = new com.google.ar.sceneform.math.Vector3(toB.x, toB.y, toB.z);

		const p = com.google.ar.sceneform.math.Vector3.lerp(posA, posB, fraction);

		return p;
	}

	public distance(fromA: Position, toB: Position): number {

		const posA = new com.google.ar.sceneform.math.Vector3(fromA.x, fromA.y, fromA.z); // nodeAndroid.getWorldPosition();
		const posB = new com.google.ar.sceneform.math.Vector3(toB.x, toB.y, toB.z);

		const p = com.google.ar.sceneform.math.Vector3.subtract(posB, posA).length();

		return p;

	}

	public direction(fromA: Position, toB: Position): Vector {

		const posA = new com.google.ar.sceneform.math.Vector3(fromA.x, fromA.y, fromA.z); // nodeAndroid.getWorldPosition();
		const posB = new com.google.ar.sceneform.math.Vector3(toB.x, toB.y, toB.z);

		const p = com.google.ar.sceneform.math.Vector3.subtract(posB, posA).normalized();

		return p;

	}



	public dot(a: Position, b: Position): number {

		const lhs = new com.google.ar.sceneform.math.Vector3(a.x, a.y, a.z); // nodeAndroid.getWorldPosition();
		const rhs = new com.google.ar.sceneform.math.Vector3(b.x, b.y, b.z);
		const d = com.google.ar.sceneform.math.Vector3.dot(lhs, rhs);
		return d;

	}



}



