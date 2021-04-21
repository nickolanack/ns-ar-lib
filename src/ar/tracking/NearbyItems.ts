

import {AR} from '../../AR';

import { Observable } from "@nativescript/core";

export class NearbyItems extends Observable {


	private _at: Array<any> = [];
	private _nearby: Array<any> = [];

	private _nearbyTimeout = null;
	private _atTimeout = null;

	constructor(ar: AR) {

		super();


		ar.on('addMarker', (event) => {

			const item = event.item;

			ar.getOrientation().addGeofence(item.getCoordinates(), 100, (inBounds) => {
				console.log((inBounds ? 'In Bounds: ' : 'Out Bounds: ') + item.getFeature().name);

				let i = this._nearby.indexOf(item);
				if (inBounds && i == -1) {
					this._nearby.push(item);
					this._notifyUpdateNearby();
					return;
				}

				if (i >= 0 && !inBounds) {
					this._notifyUpdateNearby();
					this._nearby.splice(i, 1);

				}

			});

			ar.getOrientation().addGeofence(item.getCoordinates(), 30, (atItem, event) => {



				let i = this._at.indexOf(item);
				if (atItem && i == -1) {
					this._at.push(item);
					this._notifyUpdateAt();
					return;
				}

				if (i >= 0 && !atItem) {
					this._at.splice(i, 1);
					this._notifyUpdateAt();
				}

			});

		});


	}

	public remove() {
		if (this._nearbyTimeout) {
			clearTimeout(this._nearbyTimeout);
		}
		if (this._atTimeout) {
			clearTimeout(this._atTimeout);
		}
	}


	protected _notifyUpdateNearby() {

		if (this._nearbyTimeout) {
			clearTimeout(this._nearbyTimeout);
		}

		this._nearbyTimeout = setTimeout(() => {
			this._nearbyTimeout = null;

			this.notify({
				eventName: "nearbyChanged",
				object: this,
				items: this._nearby.slice(0)
			});

		}, 1000);

	}

	protected _notifyUpdateAt() {
		if (this._atTimeout) {
			clearTimeout(this._atTimeout);
		}

		this._atTimeout = setTimeout(() => {
			this._atTimeout = null;

			this.notify({
				eventName: "atChanged",
				object: this,
				items: this._at.slice(0)
			});

		}, 1000);
	}


}