import { AR as Augmented, ARCommonNode, ARPosition, ARNodeInteraction } from 'nativescript-ar';
import { AR, ARItem, Zero3D, Feature } from '../../AR';
import { Observable, ImageSource, isIOS } from "@nativescript/core";
import { getRenderer, round, extend } from '../../utils';

import { Formatter } from '../../Formatter';

import { Vector3 } from '../math/Vector3';
import { bearing, distance, toVector, distanceVector, toCoordinate, Coordinate } from '../../spatial/Spherical';



const ImageResolver = require('../../ImageResolver');


export class Marker extends Observable {

	private _ar: AR;
	private _item: ARItem;

	private _labelHash = '';


	private _label: ARCommonNode | null = null;
	private _distLabel: ARCommonNode | null = null;
	private _altLabel: ARCommonNode | null = null;

	private _options: any = {
		showLabels: true,
		showDistance: true,
		showAltitude: true,
		icon: "{markerIcon.3}"
	};


	private _labelsVisible = true;


	public getCoordinates(): Coordinate {

		return toCoordinate(this._item.feature.coordinates);

	}

	public getDistance(): number {
		return this._item.distance;
	}



	/**
	 *
	 */
	public getWorldDirectionVectorFromCamera(): any {



		return (new Vector3()).direction(this.getNode().getWorldPosition(), this._ar.getAugmented().getCameraPosition());

	}

	public getFeature(): Feature {
		return this._item.feature;
	}
	public getNode(): ARCommonNode {
		return this._item.root;
	}

	public updateLabels() {

		let distanceLabel = this.getDistanceLabel();
		let altitudeLabel = this.getAltitudeLabel();

		if (this._labelHash != distanceLabel + altitudeLabel) {
			if (this._distLabel && this._altLabel) {
				this._distLabel.setImage("font://" + distanceLabel);

				this._altLabel.setImage("font://" + altitudeLabel);
				this._labelHash = distanceLabel + altitudeLabel;
			}
		}

	}

	public showLabels() {
		// if(this._label){
		// 	this._label.setVisible(true);
		// }

		// if(this._distLabel){
		// 	this._distLabel.setVisible(true);
		// }


		if (!this._label) {
			this.drawLabel(this._item.shape).then((node) => {
				return this.drawDistance(node);
			}).catch(console.error);
		}

		this._labelsVisible = true;
	}
	public hideLabels() {



		if (this._label) {
			// this._label.setVisible(false);
			this._label.remove();
			this._label = null;
			this._distLabel = null;
			this._altLabel = null;
		}


		this._labelsVisible = false;
	}

	constructor(ar: AR, item: ARItem, options?: any) {

		super();
		this._ar = ar;
		this._item = item;


		item.distance = distance(this._ar.getCameraCoordinate(), item.feature.coordinates);
		item.heading = bearing(this._ar.getCameraCoordinate(), item.feature.coordinates);
		item.position = toVector(item.heading, item.distance);
		item.position.y = item.feature.coordinates[2];

		(<any>item)._position = distanceVector(this._ar.getOriginCoordinate(), item.feature.coordinates);

		item.loaded = false;


		let fontScale = 0.1;
		if (isIOS) {
			fontScale = 1;
		}




		if (options) {
			this._options = extend(this._options, options);
		}



		this._ar.getAugmented().addNode({
			position: item.position,
			parentNode: this._ar.getWorldNode(),
			onTap: (object: ARNodeInteraction) => {

				try {
					this.notify({
						eventName: 'tap',
						object: this,
						node: object.node,
						item: item
					});
				} catch (e) {
					console.error(e);
				}

				console.log('Tapped Marker Object');

			}
		}).then((rootNode) => {

			item.root = rootNode;



			let markerIcon = this._options.icon;


			let image = (new ImageResolver()).setParser(getRenderer()._parse.bind(getRenderer())).createImage({
				image: markerIcon, // "font://\uf058",//
				async: false
			});

			return this._ar.getAugmented().addImage({
				parentNode: rootNode,
				position: Zero3D(),
				rotation: Zero3D(),
				dimensions: {
					x: 0.3,
					y: 0.3
				},
				// fontColor:"cornflowerblue",
				image: image.src// "font://\uf058"//

			});





		}).then((shape) => {


			item.shape = shape;
			item.loaded = true;
			this.notify({
				eventName: "load",
				object: this
			});

		}).then((lastNode) => {

			if (this._labelsVisible) {
				this.showLabels();
			}

			return lastNode;

		}).catch(console.error);


	}

	public setIcon(markerIcon: string|ImageSource) {


		if (markerIcon instanceof ImageSource) {
			return new Promise((resolve, reject) => {


				let item = this._item;
				if (item.shape) {


					return item.shape.setImage(markerIcon);
				} else {
					this.once("load", () => {
						item.shape.setImage(markerIcon).then(resolve).catch(reject);
					});
				}

			});
		}


		return new Promise((resolve, reject) => {




			let item = this._item;
			if (item.shape) {
				let image = (new ImageResolver()).setParser(getRenderer()._parse.bind(getRenderer())).createImage({
					image: markerIcon, // "font://\uf058",//
					async: false
				});


				return item.shape.setImage(image.src);

			}


			if (!this._item.loaded) {
				this.once("load", () => {
					item.shape.setImage(markerIcon).then(resolve).catch(reject);
				});
				return;
			}
			this._options.icon = markerIcon;
			resolve();

		});

	}

	private drawLabel(node) {
		if (!this._options.showLabels) {
			return node;
		}

		let item = this._item;

		if (item.distance > 600) {
			// return Promise.resolve();
		}

		let fontScale = 0.1;
		if (isIOS) {
			fontScale = 1;
		}


		return this._ar.getAugmented().addImage({
			parentNode: node,
			position: {
				x: 0, y: -0.2, z: 0
			},

			rotation: { x: 0, y: isIOS ? 180 : 0, z: 0 },
			fontSize: 0.1 * fontScale,
			fontColor: "black",
			image: "font://" + item.feature.name// image.src

		}).then((label) => {
			this._label = label;
			return label;
		});

	}
	private getDistanceLabel() {

		let item = this._item;
		let precision = 0;
			if (item.distance < 100) {
				precision = 1;
			}
			if (item.distance < 10) {
				precision = 2;
			}

		let fmt = new Formatter();



		item.distance = distance(this._ar.getCameraCoordinate(), item.feature.coordinates);

		let cardinal = fmt.format(item.heading, ['cardinal']);

		let distanceLabel = round(item.distance, precision) + "m " + cardinal;
		return distanceLabel;

	}

	private getAltitudeLabel() {
		let item = this._item;
		return "↥" + Math.round(item.position.y) + "m";

	}
	private drawDistance(node) {


		let item = this._item;

		if (!this._options.showLabels) {
			return node;
		}

		let distanceLabel = this.getDistanceLabel();
		let altitudeLabel = this.getAltitudeLabel();
		this._labelHash = distanceLabel + altitudeLabel;

		let fontScale = 0.1;
		if (isIOS) {
			fontScale = 1;
		}
		return this._ar.getAugmented().addImage({
			parentNode: node,
			position: {
				x: 0, y: -0.1, z: 0
			},

			fontSize: 0.1 * fontScale,
			fontColor: "cornflowerblue",
			image: "font://" + distanceLabel, // image.src

		}).then((label) => {
			this._distLabel = label;
			return label;
		}).then((parentNode) => {


			if (!this._options.showLabels) {
				return parentNode;
			}


			return this._ar.getAugmented().addImage({
				parentNode: parentNode,
				position: {
					x: 0, y: -0.07, z: 0
				},

				fontSize: 0.07 * fontScale,
				fontColor: "magenta",
				image: "font://" + altitudeLabel, // image.src

			}).then((label) => {
				this.c = label;
				return label;
			});


		});
	}



}