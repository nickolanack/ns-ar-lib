import { Observable, isIOS } from "@nativescript/core";
import { WorldOrientation } from './WorldOrientation';
import { AR as Augmented, ARNode, ARDimensions, ARPosition } from 'nativescript-ar';

import {latAddDistance, lngAddDistance, toDegrees, distanceVector} from '../spatial/Spherical';


import { _isArray} from "../utils";

interface Coordinate {
	lat: number;
	lng: number;
}
export class WorldAlign extends Observable {

	private _worldOrientation: WorldOrientation;
	private _ar: Augmented;
	private _cameraDifference: number = 0;
	private _altitude: number = 0;

	private _origin;

	private _worldNode: ARNode|null = null;

	constructor(ar: Augmented, worldOrientation: WorldOrientation) {
		super();
		this._ar = ar;
		this._worldOrientation = worldOrientation;

	}

	/**
	 * @return {Coordinate} Latitude, Longitude, Altitude: of origin. it should not change except if acuracty improves
	 */
	public getOriginCoordinate(): Coordinate {


		if (!this._origin) {
			this._origin = this.getCameraCoordinate();
		}

		return this._origin;

	}

	/**
	 * @return {Coordinate} Latitude, Longitude, Altitude: of camera. it should change as user moves
	 */
	public getCameraCoordinate(): Coordinate {




		const currentLocation = this._worldOrientation.getLocation();
		const currentHeading = this._worldOrientation.getHeading();


		const crot = this._ar.getCameraRotation();
		const cameraHeading = crot.y;

		const position = this._ar.getCameraPosition();

		const dxz = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.z, 2));

		const arHeading = (currentHeading - cameraHeading + 360) % 350;

		const camDirection = (toDegrees(Math.atan2(position.x, position.z)) - 90 + 360) % 360;

		const cam = arHeading - camDirection;

		const dylat = dxz * Math.cos(cam);
		const dxlng = dxz * Math.sin(cam);


		const origin = {
			lat: latAddDistance(currentLocation.lat, dylat),
			lng: lngAddDistance(currentLocation.lat, currentLocation.lng, dxlng),
			alt: currentLocation.alt
		};


		return origin;

	}



	public getCameraOffset() {

		return this._cameraDifference;
	}


	public coordinateToVector3(coordinate): Vector {

		let pos = distanceVector(this.getOriginCoordinate(), coordinate);
		if (typeof coordinate.alt == "number") {
			pos.y = coordinate.alt;
		}

		if (typeof coordinate.altitude == "number") {
			pos.y = coordinate.altitude;
		}

		if (_isArray(coordinate) && coordinate.length >= 3) {
			pos.y = coordinate[2];
		}

		return pos;

	}


	public alignWorldNode(node, offset) {


		if (this._worldNode) {
			throw 'Already aligning a single root node';
		}

		this._worldNode = node;
		this.alignRotation(node, offset);
		this.alignAltitude(node);
	}

	public alignRotation(node, offset) {




		this._worldOrientation.on("headingChanged", (event) => {

			if (isIOS) {
				return;
			}

			let dir = this._ar.getCameraDirection();
			let deg = Math.atan2(dir.z, dir.x) * 180 / Math.PI;
			let cameraDifference = ((event.heading - deg - 90 + offset.y) + 360 + (isIOS ? 0 : 180)) % 360;




			this._cameraDifference = cameraDifference;
			node.setRotation({x: offset.x, y: cameraDifference, z: offset.z});

			/*
			let compassHeading=event.heading;
			let cameraRot=this._ar.getCameraRotation()
			let cameraRotation=cameraRot.y;
			//if(!isIOS){
				cameraRotation=360.0-cameraRotation;
			//}


			let cameraDifference=event.heading-cameraRotation;
			cameraDifference=(360+(isIOS?0:180)+offset.y+cameraDifference)%360;


			this._cameraDifference=cameraDifference;

			node.setRotation({x:offset.x, y:cameraDifference, z:offset.z});
			*/
		});

	}
	public alignAltitude(node) {

		this._worldOrientation.firstLocation((location) => {

			node.setPosition({x: 0, y: -location.alt, z: 0});
			// this._altitude=location.alt;
		});


	}

	public followCamera(node, offset) {

	}


}