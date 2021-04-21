
import { Observable } from "@nativescript/core";
import { getRenderer, extend } from '../utils';

import { Heading as HeadingMonitor } from './Heading';
import {Location as LocationMonitor} from '../Location';

declare type Latitude = number;
declare type Longitude = number;
declare type Altitude = number;
declare type Heading = number;

interface Location {
	lat: Latitude;
	lng: Longitude;
	alt: Altitude;
}





export class WorldOrientation extends Observable {

	private _fakeInitialLocation: null | Location = null;
	private _currentHeading: undefined | Heading = undefined;
	private _currentLocation: undefined | Location = undefined;
	private _initialLocation: null | Location = null;

	private _locationMonitor: LocationMonitor = null;
	private _headingInterval: number = -1;

	private _locationInterval: number = -1;

	constructor() {

		super();
	}


	public setInitialLocation(location: Location) {

		this._fakeInitialLocation = location;

	}


	public firstHeading(callback: (heading: Heading) => void) {

		if (typeof this._currentHeading != "undefined") {
			callback(this.getHeading());
			return;
		}

		this.once('headingChanged', function(event) {
			callback(event.heading);
		});
	}


	public firstLocation(callback: (location: Location) => void) {

		if (typeof this._currentLocation != "undefined") {
			callback(this.getLocation());
			return;
		}

		this.once('headingChanged', function(event) {
			callback(event.location);
		});
	}


	/**
	 * return time since update
	 */
	public getHeadingTime() {
		if (this._headingInterval == -1) {
			return -1;
		}

		return (new Date()).getTime() - this._headingInterval;
	}

	public getLocationTime() {
		if (this._locationInterval == -1) {
			return -1;
		}

		return (new Date()).getTime() - this._locationInterval;
	}


	public monitorWorldOrientation() {
		let me = this;
		let currentLocation = null;

		this._monitorOrientation((heading, err) => {
			this._currentHeading = heading;

			this._headingInterval = (new Date()).getTime();

			let eventData = {
				eventName: "headingChanged",
				object: this,
				heading: this._currentHeading

			};
			this.notify(eventData);
		});



		let offsetLocation: Location = {
			lat: 0,
			lng: 0,
			alt: 0
		};

		this._monitorLocation((lat, lng, alt) => {

			if (this._initialLocation == null) {
				this._initialLocation = {
					lat: lat,
					lng: lng,
					alt: alt
				};
				if (this._fakeInitialLocation) {
					offsetLocation = {
						lat: this._fakeInitialLocation.lat - lat,
						lng: this._fakeInitialLocation.lng - lng,
						alt: this._fakeInitialLocation.alt - alt
					};
				}
			}

			this._currentLocation = {
				lat: lat + offsetLocation.lat,
				lng: lng + offsetLocation.lng,
				alt: alt + offsetLocation.alt,
			};


			this._locationInterval = (new Date()).getTime();

			let eventData = {
				eventName: "locationChanged",
				object: this,
				location: extend({}, this._currentLocation)

			};
			this.notify(eventData);


		});


		return new Promise(function(resolve, reject) {
			let heading = false;
			let location = false;
			me.once('headingChanged', function(event) {
				heading = event.heading;
				if (location !== false) {
					resolve([location, heading]);
				}
			});
			me.once('locationChanged', function(event) {
				location = event.location;
				if (heading !== false) {
					resolve([location, heading]);
				}
			});

		}).catch(console.error);

	}


	public hasOrientation() {
		let me = this;
		if (typeof me._currentHeading !== "number") {
			return false;
		}
		if (me._currentLocation == null) {
			return false;
		}
		return true;
	}


	public getLocation() {
		return this._currentLocation;
	}


	public getHeading() {
		return this._currentHeading;
	}


	private _monitorLocation(callback) {


		this._locationMonitor = new LocationMonitor();
		this._locationMonitor.watchLocation((loc) => {
			callback(loc.latitude, loc.longitude, loc.altitude);
		});

		getRenderer().onDisposeCurrent(() => {
			this._locationMonitor.clearWatch();
			this._locationMonitor = null;
		});


	}


	public addGeofence(location, distance, callback) {

		this._locationMonitor.addGeofence(location, distance, callback);
	}


	private _monitorOrientation(callback) {


		const heading = new HeadingMonitor();
		heading.watchHeading(callback);


		getRenderer().onDisposeCurrent(() => {
			heading.clearWatch();
		});



	}




}