
import { Observable, isIOS, alert } from "@nativescript/core";
import { getRenderer, getConfiguration, extend, round, _isArray, _isObject, PageData } from './utils';

import { AR as Augmented, ARNode, ARCommonNode, ARDimensions, ARPosition } from 'nativescript-ar';

import { Selection } from './ar/Selection';

import { ARCrowdCamera } from './ar/ARCrowdCamera';

import { Formatter } from './Formatter';

import { WorldOrientation } from './ar/WorldOrientation';
import { WorldAlign } from './ar/WorldAlign';
import { ARCompass } from './ar/ARCompass';

import { Marker } from './ar/feature/Marker';
import { distance, bearing, Coord, Coordinate } from './spatial/Spherical';

import { ImageTracker } from './ar/tracking/ImageTracker';
import { Vector3 } from './ar/math/Vector3';


export interface ARItem {
	root: ARNode;
	shape: ARNode;
	loaded?: boolean;
	feature: Feature;
	initialDistance: number;
	updates: number;
	initialized: boolean;
	distance: number;
	heading: Heading;
	position: ARPosition;
	marker: Marker | null;
}

export interface Feature {
	id: number;
	name: string;
	coordinates: Coord;
}


declare type Latitude = number;
declare type Longitude = number;
declare type Heading = number;

export const Zero3D = (): ARDimensions => {
	return {
		x: 0, y: 0, z: 0
	};
};



export class AR extends Observable {



	private _ar: Augmented;
	private _field: any;
	private _container: any;
	private _pageData: PageData;



	private _items: Array<ARItem> = [];

	private _origin: Coordinate;
	private _worldOrientation: WorldOrientation;
	private _worldAlign: WorldAlign;

	private _worldNode: ARCommonNode;


	private _priorityDistance: number = 200;
	private _requiresItemUpdate: boolean = false;
	private _locked: boolean = false;
	private _selection: Selection = null;

	private _imageTracker: ImageTracker = null;


	private _options: any = {
		showArCompass: false,
		trackImages: false
	};


	constructor(ar: Augmented, container, field) {

		super();

		this._ar = ar;
		this._field = field;
		this._container = container;

		this._pageData = new PageData();

		this._renderARView();




		this._ar.on('sceneTapped', () => {
			console.log('sceneTapped');
		});

		this._ar.on('planeDetected', () => {
			console.log('planeDetected');
		});

		this._ar.on('planeTapped', (args) => {
			console.log('planeTapped');
		});


		getRenderer().addActionHandler("augmented.calibrate", () => {
			this._calibrateWorldOrigin();
		});

		const fmt = (items: Array<any>) => {


			return JSON.stringify(items.map((item) => {

				let d = distance(this._worldOrientation.getLocation(), item.coordinates);

				return {
					id: item.id,
					name: item.name,
					distance: round(d, 2) + 'm',
					heading: (new Formatter()).format(bearing(this.getCameraCoordinate(), item.coordinates), ['cardinal']),
					scale: round((new ARCrowdCamera(this, this._selection)).getScale(d), 2),
					alt: item.coordinates[2]
				};
			}));

		};



		getRenderer().addActionHandler("augmented.atMarkers", () => {
			alert({
				title: "At Markers", message: fmt(getRenderer().getModel().get("atMarkers")),
				okButtonText: "OK"
			});
		});

		getRenderer().addActionHandler("augmented.markersNearby", () => {
			alert({
				title: "Nearby Markers", message: fmt(getRenderer().getModel().get("nearbyMarkers")),
				okButtonText: "OK"
			});
		});

		getRenderer().addActionHandler("augmented.markersInView", () => {
			alert({
				title: "Visible Markers", message: fmt(getRenderer().getModel().get("visibleMarkers")),
				okButtonText: "OK"
			});
		});

		getRenderer().addActionHandler("augmented.imagesNearby", () => {
			alert({
				title: "Tracking Images Nearby", message: "There are no images nearby",
				okButtonText: "OK"
			});
		});

	}

	public remove() {
		this.notify({
			eventName: 'remove',
			object: this
		});
	}


	public addAction = function(name, fn) {
		getRenderer().addActionHandler("augmented." + name, fn);
	};
	public getActionName = function(name) {
		return "augmented." + name;
	};

	public getAugmented(): Augmented {
		return this._ar;
	}
	public getWorldNode(): ARCommonNode {
		return this._worldNode;
	}
	public getContainer() {
		return this._container;
	}


	public getOrientation(): WorldOrientation {
		return this._worldOrientation;
	}


	private _renderStats() {
		new (require('./ARHelpers').Stats)(this._container);
	}

	private _renderCompass() {
		new (require('./ARHelpers').Compass)(this._container);
	}




	private _renderARView() {

		// this._pageData.set("heading", "Loading GPS");




		this._worldOrientation = new WorldOrientation();
		this._worldAlign = new WorldAlign(this._ar, this._worldOrientation);
		this._worldAlign.on("calibrating", (event) => {
			this.notify(event);
		});
		this._worldAlign.on("calibrated", (event) => {
			this.notify(event);
		});



		this._worldOrientation.on('locationChanged', (event) => {
			this.notify(event);
			this._pageData.set("altitude", round(event.location.alt, 2));
			this._pageData.set("latitude", round(event.location.lat, 5));
			this._pageData.set("longitude", round(event.location.lng, 5));
			// this._pageData.set("longitude", round(event.location.lng, 5));
		});



		this._pageData.set("features", []);
		this.on('addMarker', (event) => {
			this._pageData.set("features", this._items.slice(0).map((item) => {
				return item.feature;
			}));
		});


		if (this._field.offsetLatLng) {
			this._worldOrientation.setInitialLocation(this._field.offsetLatLng);
		}


		this._pageData.set("stateAR", "Initializing");

		Promise.all([
			new Promise((resolve) => {

				this._ar.once('arLoaded', (event) => {
					resolve();
					this.notify(event);
				});

			}),
			this._worldOrientation.monitorWorldOrientation(),
			this._loadLayerFeatures().then((features: Array<Feature>) => {


				this._pageData.set("stateAR", "Download layer");

				return this._initFeatures(features);
			})




		]).then(() => {

			return this._loadLayerItems();


		}).then(() => {

			this._pageData.set("stateAR", "Running");

			setTimeout(() => {
				this._startUpdateInterval();
			}, 50);

			if (this._options.showArCompass) {
				console.log("add ar compass");
				new ARCompass(this, this._worldOrientation, this._worldAlign);
			}

			if (this._options.trackImages) {
				console.log('track images');
				this._trackImages().catch(console.error);
			}

		}).catch((err) => {

			console.error(err);
			console.error("Error Loading AR");

			this._pageData.set("errorAR", err);
			this._pageData.set("stateAR", "Error");
		});

	}
	private requireUpdate() {
		this._requiresItemUpdate = true;
	}

	private _startUpdateInterval() {
		this.requireUpdate();
		let counter = 0;
		getRenderer()._addUpdateInterval('calibrateHeading', () => {

			try {

				counter++;
				if (counter > 20) {
					this.requireUpdate();
					counter = 0;
				}
				this._calibrateWorldOrigin();


				let spinner = ['◜', '◝', '◞', '◟'];
				let ch = spinner[Math.round(counter / 2) % 4];


				this._pageData.set(
					"heading", round(this._worldOrientation.getHeading(), 1) + "°");
				this._pageData.set(
					"headingInterval", ch + round(this._worldOrientation.getHeadingTime() / 1000, 1));
				this._pageData.set(
					"locationInterval", ch + round(this._worldOrientation.getLocationTime() / 1000, 1));
				this._pageData.set(
					"headingCardinal", (new Formatter()).format(this._worldOrientation.getHeading(), ['cardinal']));
				this._pageData.set(
					"headingAR", round(this._ar.getCameraRotation().y, 1) + "°");

				// if(isIOS){
				let rot = this._ar.getCameraRotation(); // this._ar.sceneView.defaultCameraController.pointOfView.eulerAngles;
				let euler = { x: round(rot.x, 2), y: round(rot.y, 2), z: round(rot.z, 2) };
				this._pageData.set(
					"rotationAR", JSON.stringify(euler).replace('{', '').replace('}', ''));

				let dir = this._ar.getCameraDirection(); // this._ar.sceneView.defaultCameraController.pointOfView.eulerAngles;
				let direction = { x: round(dir.x, 2), y: round(dir.y, 2), z: round(dir.z, 2) };

				let deg = Math.atan2(dir.z, dir.x) * 180 / Math.PI;
				deg = round((deg - 90 + 360) % 360, 2);

				this._pageData.set(
					"directionAR", JSON.stringify(direction).replace('{', '').replace('}', '') + '(' + deg + ')');
				// }



				this._pageData.set(
					"headingAROffset", round(this._worldAlign.getCameraOffset(), 1) + "Δ");


				let campos = this._ar.getCameraPosition();
				// let campos=this.getWorldNode().getWorldPosition();
				let arpos = { x: round(campos.x, 2), y: round(campos.y, 2), z: round(campos.z, 2), t: round(((new Date()).getTime() - campos.time) / 1000, 2) };

				this._pageData.set('positionAR', JSON.stringify(arpos).replace('{', '').replace('}', ''));
				this._pageData.set('wanderAR', (new Vector3()).distance({ x: 0, y: 0, z: 0 }, this._ar.getCameraPosition()));

				this._pageData.set('counterAR', counter);

			} catch (e) {
				this._pageData.set('errorAR', e);
				console.error(e);
			}


		}, 500);


		// this._ar.toggleStatistics();
	}

	private _initFeatures(features: Array<Feature>) {

		let items = <Array<ARItem>>features.map((feature) => {

			return {
				root: null,
				initialDistance: null,
				feature: feature,
				updates: 0,
				initialized: false,
				initialDistance: distance(this._worldOrientation.getLocation(), feature.coordinates)
			};



		}).filter((item: ARItem) => {

			return item.initialDistance <= 10000;


		});

		if (items.length > 50) {
			items = items.filter((item: ARItem) => {
				return item.initialDistance <= 5000;
			});
		}

		if (items.length > 50) {
			items = items.filter((item: ARItem) => {
				return item.initialDistance <= 3000;
			});
		}

		if (items.length > 50) {
			items = items.filter((item: ARItem) => {
				return item.initialDistance <= 2000;
			});
		}

		items.sort((a, b) => {
			return a.initialDistance - b.initialDistance;
		});

		this._items = this._items.concat(items);




		return items;
	}
	private _loadLayerItems() {


		if (!(this._worldOrientation.hasOrientation())) {
			throw 'AR load-layers before orientation has been detected';
		}


		this._items.forEach((item: ARItem) => {
			// item.initialDistance = distance(this._worldOrientation.getLocation(), item.feature.coordinates);
		});


		return this._ar.addNode({
			position: Zero3D()
		}).then((worldNode) => {
			this._worldNode = worldNode;


			this._items.forEach((item: ARItem) => {
				this._addPoint(item);
			});


			this._worldAlign.alignWorldNode(worldNode, { x: 0, y: 0, z: 0 });
			return worldNode;

		});



	}

	public coordinateToVector3(coordinate): Vector3 {
		return this._worldAlign.coordinateToVector3(coordinate);
	}

	public getOriginCoordinate(): Coordinate {
		return this._worldAlign.getOriginCoordinate();
	}

	/**
	 *
	 * @return {Coordinate} latitude and longitude
	 */
	public getCameraCoordinate(): Coordinate {
		return this._worldAlign.getCameraCoordinate();
	}

	private _calibrateWorldOrigin() {
		let items = this._items;
		let me = this;
		let maxDistance = 2000;
		let priorityDistance = 200;


		items.forEach((item: ARItem) => {

			if (!item.loaded) {
				return;
			}

			if (item.distance > maxDistance) {
				if (item.root) {
					item.root.setVisible(false);
				}
				return;
			}

			/*
			if (item.distance < 50) {
				if (item.root) {
					item.root.setVisible(false);
				}
				return;
			}
			*/

			if (!(this.shouldUpdateItem(item))) {
				return;
			}

			me.updateItem(item);

		});


		me._requiresItemUpdate = false;


	}


	private shouldUpdateItem(item: ARItem) {

		return (this._requiresItemUpdate || item.initialized == false || item.distance <= this._priorityDistance) && (!this._locked);

	}

	public updateItem(item: ARItem) {

		let me = this;

		item.updates++;
		if (item.updates > 5) {
			// return;
		}

		(new ARCrowdCamera(this, this._selection)).updateItem(item.shape, item);

		// item.shape.scaleTo(3 * me._getScaleFactor(item));
		item.initialized = true;

		if (me._isSelected(item)) {

			const fmt = new Formatter();



			me._pageData.set(
				"feature", extend(item.feature, {
					distance: fmt.format(item.distance, ['distance(0)']),
					heading: fmt.format(item.heading, ['cardinal'])
				}));
		}

	}

	private _isSelected(item: ARItem) {
		return this._selection && this._selection.isSelected(item);
	}


	public getMarkers() {
		return this._items.filter((item) => { return !!item.marker; }).map((item) => { return item.marker; });
	}


	private _addPoint(item: ARItem) {

		const marker = (new Marker(this, item));
		marker.on('tap', (event) => {
			this.notify(extend(event, {
				eventName: 'itemSelect',
				object: this
			}));
		});

		item.marker = marker;

		this.notify({
			eventName: 'addMarker',
			object: this,
			item: marker

		});

		this._worldOrientation.addGeofence(item.feature.coordinates, 100, (inBounds) => {
			console.log((inBounds ? 'In Bounds: ' : 'Out Bounds: ') + item.feature.name);
		});
	}

	private lockWorld() {
		this._locked = true;
	}
	private unlockWorld() {
		this._locked = false;
	}


	private _resolveLayer(layer) {
		let me = this;
		if (typeof layer == 'string' || typeof layer == 'number' || _isObject(layer)) {
			let args = [layer];
			let promise = getRenderer().getListViewRenderer()._listResolvers['layer'].apply(null, args);
			return promise;
		}

		return new Promise((resolve) => {
			resolve([]);
		});
	}

	private _loadLayerFeatures(callback?: (feature: Feature) => void) {



		let me = this;
		let field = this._field;

		return new Promise((resolve, reject) => {

			let layers = [];
			try {
				layers = field.layers || getConfiguration().get('layers', () => {
					return [getConfiguration().get('layer')];
				});
			} catch (e) {
				reject(e);
				return;
			}


			if (typeof layers == "string" && layers.indexOf('{') === 0) {
				layers = getRenderer()._parse(layers);
			}

			console.log('Render Layers: ' + JSON.stringify(layers));

			layers.forEach((l) => {

				if (typeof l == "string" && l.indexOf('{') === 0) {
					l = getRenderer()._parse(l);
				}

				me._resolveLayer(l).then((list) => {
					if (callback) {
						list.forEach(callback);
					}

					resolve(list);

				}).catch((e) => {
					console.trace();
					console.log('Error: ' + e);
				});

			});
		});


	}


	private _trackImages() {





		return new Promise((resolve, reject) => {


			// this._imageTracker=new ImageTracker(this);

			resolve(this);
		});


	}

}


