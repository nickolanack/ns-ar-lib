'use strict';

import {AR} from '../../AR';

import { Observable, Screen as screen } from "@nativescript/core";
import { Feature } from "../../AR";

import { Vector3 } from '../math/Vector3';
import { toVector } from '../../spatial/Spherical';
import { Marker } from '../feature/Marker';


interface FocusItem {
	marker: Marker;
	deltaCenter: {dx: number, dy: number};
}

export class FieldOfView extends Observable {


	private _lookingAtGroup: Array<any> = [];
	private _lookingAt: Array<any> = [];

	private _lookingTowardGroup: Array<any> = [];

	private _nearbyTimeout = null;
	private _atTimeout = null;

	private _centerX = 0;
	private _centerY = 0;
	private _width = 0;
	private _height = 0;

	private _viewInterval;

	private _ar: AR;
	private _insightHash = '';


	constructor(ar: AR) {

		super();


		this._ar = ar;

		// const width = screen.mainScreen.widthDIPs;
		// this._width=width;
		// const height = screen.mainScreen.heightDIPs;
		// this._centerX = width / 2;
		// this._centerY = height / 2;




		ar.on('addMarker', (event) => {

			const item = event.item;
			item.hideLabels();


		});


		// return;


		this._viewInterval = setInterval(() => {


			const width = screen.mainScreen.widthDIPs;
			this._width = width;
			const height = screen.mainScreen.heightDIPs;
			this._height = height;
			this._centerX = width / 2;
			this._centerY = height / 2;

			try {


				let cameraDirection = this._ar.getAugmented().getCameraDirection();
				let items: Array<FocusItem> = ar.getMarkers().map((marker) => {
					const positionOnScreen = marker.getNode().getPositionOnScreen();
					return {
						marker: marker,
						deltaCenter: this.computeDxDy(positionOnScreen.x, positionOnScreen.y),
						dot: (new Vector3()).dot(marker.getWorldDirectionVectorFromCamera(), cameraDirection),
						name: marker.getFeature().name,
						id: marker.getFeature().id
					};

				});


				const inSight = items.filter((item: FocusItem) => {
					if (item.marker.getDistance() > 1000) {
						return false;
					}

					return item.dot > 0.85;

					// const onScreen = this.isOnScreen(item.deltaCenter);
					// const inFront = this.isInFront(item.marker);
					// return onScreen&&inFront;
				});


				inSight.sort((a, b) => {
					return b.dot - a.dot;
				});

				const outOfSight = this._lookingTowardGroup.filter((item: FocusItem) => {
					return this.indexOf(inSight, item) == -1;
				});
				const intoSight = inSight.filter((item: FocusItem) => {
					return this.indexOf(this._lookingTowardGroup, item) == -1;
				});


				if (outOfSight.length > 0) {
					this.notify({
						eventName: "outOfSight",
						object: this,
						items: outOfSight.map((item: FocusItem) => { return item.marker; })
					});
				}

				if (intoSight.length > 0) {
					this.notify({
						eventName: "intoSight",
						object: this,
						items: intoSight.map((item: FocusItem) => { return item.marker; })
					});
				}


				const insightHash = JSON.stringify(inSight.map((item) => { return item.marker.getFeature().id; }));

				if (intoSight.length > 0 || outOfSight.length > 0 || insightHash != this._insightHash) {

					this.notify({
						eventName: "inSightChanged",
						object: this,
						items: inSight.map((item: FocusItem) => { return item.marker; })
					});
					this._lookingTowardGroup = inSight;
					this._insightHash = insightHash;
				}





				const inView = inSight.filter((item) => {
					return item.dot > 0.95;
					// const inRange = this.isInFocusRange(item.deltaCenter);
					// return inRange;
				});

				const outOfView = this._lookingAtGroup.filter((item) => {
					return this.indexOf(inView, item) == -1;
				});

				const intoView = inView.filter((item) => {
					return this.indexOf(this._lookingAtGroup, item) == -1;
				});

				if (outOfView.length > 0) {
					this.notify({
						eventName: "outOfView",
						object: this,
						items: outOfView.map((item: FocusItem) => { return item.marker; })
					});
				}

				if (intoView.length > 0) {
					this.notify({
						eventName: "intoView",
						object: this,
						items: intoView.map((item: FocusItem) => { return item.marker; })
					});
				}

				if (intoView.length > 0 || outOfView.length > 0) {

					this.notify({
						eventName: "inViewChanged",
						object: this,
						items: inSight.map((item: FocusItem) => { return item.marker; })
					});

					this._lookingAtGroup = inView;
				}



				this.notify({
					eventName: "update",
					object: this,
					itemsInView: inView.map((item: FocusItem) => { return item.marker; })
				});

			} catch (e) {
				console.error(e);
			}




		}, 200);


	}

	private indexOf(list, item: FocusItem) {

		for (let i = 0; i < list.length; i++) {
			if (item.marker.getFeature().id == list[i].marker.getFeature().id) {
				return i;
			}
		}
		return -1;
	}

	public remove() {
		if (this._viewInterval) {
			clearInterval(this._viewInterval);
		}

	}

	private isInFront(marker) {

		try {
			return (new Vector3()).dot(marker.getWorldDirectionVectorFromCamera(),
				this._ar.getAugmented().getCameraDirection()
				) >= 0;
		} catch (e) {
			console.error(e);
			return true;
		}
	}

	private isInFocusRange(deltaCenter) {


		const bounds = Math.min(this._width / 4, this._height / 4);



		return deltaCenter.dx < bounds &&
            deltaCenter.dy < bounds;


	}

	private computeDxDy(x, y) {

		return {dx: Math.abs(x - this._centerX), dy: Math.abs(y - this._centerY)};

	}

	private isOnScreen(deltaCenter) {



		return deltaCenter.dx < this._width / 2 && deltaCenter.dy < this._height / 2;


	}
}
