import { AR as Augmented, ARNode, ARCommonNode } from 'nativescript-ar';
import { WorldOrientation } from './WorldOrientation';
import { WorldAlign } from './WorldAlign';
import { Color, isIOS } from "@nativescript/core";
import { extend, round } from "../utils";

import { AR } from "../AR";
import { Axis } from "./Axis";

export class ARCompass {

	private _ar: AR;
	private _augmented: Augmented;
	private _worldPosition: WorldOrientation;
	private _worldAlign: WorldAlign;

	constructor(ar: AR, worldPosition: WorldOrientation, worldAlign: WorldAlign) {


		this._augmented = ar.getAugmented();
		this._ar = ar;
		this._worldPosition = worldPosition;
		this._worldAlign = worldAlign;


		worldPosition.firstHeading((heading) => {
			this._renderHeading().then((ring: ARCommonNode) => {

				worldAlign.alignRotation(ring, { x: -90, y: isIOS ? 180 : 0, z: 0 });
				worldAlign.followCamera(ring, {x: 0, y: -1, z: -1});
				(new Axis(this._ar)).drawAxis(0.2, {x: 0, y: -1, z: -1});
			});
		});

		worldPosition.firstLocation((location) => {
			// this._renderLocation();
		});

	}


	private _renderHeading() {


		return new Promise((resolve, reject) => {




			let fontScale = 0.1;
			if (isIOS) {
				fontScale = 1;
			}





			this._augmented.addImage({
				// parentNode: shape,
				position: {
					x: 0, y: -1, z: -1
				},
				scale: 0.5,
				rotation: { x: -90, y: 0, z: 0 },

				fontSize: 1.3 * fontScale,
				fontColor: new Color(50, 255, 255, 255),
				image: "font://\uf111"// image.src

			}).then((ring) => {

				console.log("add image");

				// this._augmented.addImage({
				// 	parentNode:ring,
				// 	position: {
				// 		x: 0, y:.01, z: 0
				// 	},

				// 	//rotation: { x: -90, y: 0, z: 0 },
				// 	fontSize: 0.15*fontScale,
				// 	fontColor: "magenta",
				// 	image: "font://" + "hello world"
				// })



				this._addArrow(ring, 90, new Color(200, 200, 200, 200), { fontSize: 0.05 * fontScale });
				this._addString(ring, 90, "cornflowerblue", "W", { fontSize: 0.15 * fontScale });
				this._addDot(ring, 60, "cornflowerblue", { fontSize: 0.05 * fontScale });
				this._addDot(ring, 30, "limegreen", { fontSize: 0.05 * fontScale });

				this._addArrow(ring, 0, "white", { fontSize: 0.15 * fontScale });
				this._addString(ring, 0, "limegreen", "N", { fontSize: 0.35 * fontScale });


				this._addDot(ring, -30, "limegreen", { fontSize: 0.05 * fontScale });
				this._addDot(ring, -60, "cornflowerblue", { fontSize: 0.05 * fontScale });
				this._addArrow(ring, -90, new Color(200, 200, 200, 200), { fontSize: 0.05 * fontScale });
				this._addString(ring, -90, "cornflowerblue", "E", { fontSize: 0.15 * fontScale });


				this._addDot(ring, 120, "magenta", { fontSize: 0.05 * fontScale });
				this._addDot(ring, 150, "magenta", { fontSize: 0.05 * fontScale });

				this._addDot(ring, 180, new Color(200, 200, 200, 200), { fontSize: .05 * fontScale });
				this._addString(ring, 180, "cornflowerblue", "S", { fontSize: 0.15 * fontScale });

				this._addDot(ring, 210, "magenta", { fontSize: 0.05 * fontScale });
				this._addDot(ring, 240, "magenta", { fontSize: 0.05 * fontScale });



				resolve(ring);


			}).catch(console.error);





		});


	}

	private _addString(node: ARNode, deg: number, color: Color | string, str: string, options?: any) {
		this._addDot(node, deg, color, extend({
			// fontSize: 0.35 * fontScale,
			image: "font://" + str,
			position: {
				x: 0, y: 1.1, z: 0
			},
			rotation: { x: 0, y: 0, z: -deg }
		}, options));
	}


	private _addDot(node: ARNode, deg: number, color: Color | string, options?: any) {

		this._augmented.addNode({
			parentNode: node,
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: deg }
		}).then((innerNode) => {


			this._augmented.addImage(extend({
				parentNode: innerNode,

				position: {
					x: 0, y: 0.7, z: 0
				},
				fontSize: .05,
				fontColor: color,
				image: "font://" + "\uf111"
			}, options || {})).catch(console.error);

		}).catch(console.error);

	}

	private _addArrow(node, deg, color: Color | string, options?: any) {



		let fontSize = (options || {}).fontSize || 0.15;

		this._augmented.addNode({
			parentNode: node,
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: deg }
		}).then((innerNode) => {

			this._augmented.addImage(extend({
				parentNode: innerNode,
				position: {
					x: 0, y: .87, z: 0
				},
				fontColor: color,
				image: "font://" + "\uf106"
			}, options || {}, { fontSize: fontSize * 2 })).catch(console.error);

			this._augmented.addImage(extend({
				parentNode: innerNode,

				position: {
					x: 0, y: 0.7, z: 0
				},
				fontColor: color,
				image: "font://" + "\uf111"
			}, options || {}, { fontSize: fontSize })).catch(console.error);

		}).catch(console.error);

	}

	private _renderLocation() {
		const origin = this._worldAlign.getCameraCoordinate();



		let fontScale = 0.1;
		if (isIOS) {
			fontScale = 0.8;
		}

		this._augmented.addImage({

			position: {
				x: 0, y: -0.95, z: 0
			},
			rotation: { x: -90, y: 0, z: 0 },
			fontSize: 0.15 * fontScale,
			fontColor: "magenta",
			image: "font://" + ([round(origin.lat, 5), round(origin.lng, 5)]).join(', ')
		}).then((coord) => {




			// if (isIOS) {

			 	let interval = setInterval(() => {
			 		coord.setImage({
			 			fontSize: 0.15 * fontScale,
						fontColor: "magenta",
						image: "font://" + ([round(origin.lat, 5), round(origin.lng, 5)]).join(', ')
			 		}).catch(console.error);
			 		setTimeout(() => {
			 			coord.setImage({
				 			fontSize: 0.15 * fontScale,
							fontColor: "limegreen",
							image: "font://" + ([round(origin.lat, 5), round(origin.lng, 5)]).join(', ')
				 		}).catch(console.error);
			 		}, 1000);
			 	}, 3000);


			 	this._ar.once("remove", () => {
			 		clearInterval(interval);
			 	});

			// 	let rotationAnimation = CABasicAnimation.animationWithKeyPath("eulerAngles.y");

			// 	rotationAnimation.toValue = Math.PI * 2;
			// 	rotationAnimation.duration = 10.0; // One revolution in ten seconds.
			// 	rotationAnimation.repeatCount = 1000; // Repeat the animation forever.
			// 	coord.ios.addAnimationForKey(rotationAnimation, null); // Attach the animation to the node to start it.

			// }

		}).catch(console.error);
	}
}