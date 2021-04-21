

import { MapBase as Map } from './MapBase';
import { TourBehavior, ActionTemplateHandler} from './TourBehavior';
import { MapView, Position, Marker, Polyline, Polygon } from 'nativescript-google-maps-sdk';
import { extend } from '../utils';
import {LineDecorator} from './LineDecorator';

export class MapTourBehavior extends TourBehavior {

	private _map: Map;
	private _lines: Array<any> = [];
	private _lineSections: Array<any> = [];
	private _lineDecorator: LineDecorator|null = null;

	public constructor(map: Map, options?: any) {
		super(<ActionTemplateHandler>map, extend({
			tourZoom: 17
		}, options));
		this._map = map;
	}
	protected startTour() {


		if (!this.hasDirections()) {


			this._map.addLine({
				coordinates: this._points,
				width: 3,
				color: "cornflowerblue"
			}).then((l) => {

				this._lines.push(l);
			});

		}


		this._points.forEach((p, index) => {
			if (index == 0) {
				return;
			}
			let directions = this.getDirectionsTo(index);
			if (directions) {

				this._map.addLine({
					coordinates: directions,
					width: 4,
					color: "white"
				}).then((l) => {

					this._lines.push(l);
				});

			}
			console.log(directions);
		});


	}


	protected focusTourStep(index) {
		this._map.setZoomAndCenter(this._options.tourZoom, this._points[index]);
		this._lineSections.forEach((l) => {
			this._map.removeLine(l);
		});
		if (this._lineDecorator) {
			this._lineDecorator.remove();
			this._lineDecorator = null;
		}
		let directions = this.getDirectionsTo(index);
			if (directions) {

				this._map.addLine({
					coordinates: directions,
					width: 4,
					color: "#5daeeb"
				}).then((l) => {

					this._lineSections.push(l);
					this._lineDecorator = new LineDecorator(this._map, l, {
						startIcon: "~/markers/circles/sm/1f78b4-16.png",
						endIcon: "~/markers/circles/plain-flat/b2df8a-24.png",
						vertIcon: "~/markers/circles/sm/1f78b4-16.png",
						selectedVertIcon: false,
						selectedIcon: "~/markers/circles/plain-flat/1f78b4-32.png",
						clickable: false,
						draggable: false,
						autoselect: false
					});
				});

			}
	}

	protected endTour() {
		this._lines.forEach((l) => {
			this._map.removeLine(l);
		});
		this._map.resetMapView();

	}


	protected getVisibleItemLocationData(tourItem, callback) {

		this._map.getLayers().forEach((l) => {

			let item: Marker | null = l.getItemByFilter((item) => {
				return item.userData.id == tourItem.id;

			});

			if (item) {
				callback([item.position.latitude, item.position.longitude]);
			}
		});

	}


	protected getItemLabel(tourItem, callback) {

		this._map.getLayers().forEach((l) => {

			let item: Marker | null = l.getItemByFilter((item) => {
				return item.userData.id == tourItem.id;

			});

			if (item) {
				callback(item.userData.name);
			}
		});

	}


}