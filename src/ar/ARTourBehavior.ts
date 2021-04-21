"use strict";


import { TourBehavior, ActionTemplateHandler} from '../map/TourBehavior';
import { extend, getRenderer} from '../utils';
import { AR } from '../AR';
import { Marker } from './feature/Marker';
import { distance, toCoordinate } from '../spatial/Spherical';
import { Vector3, Vector } from './math/Vector3';

import { Color } from "@nativescript/core";

import { Axis } from "./Axis";

export class ARTourBehavior extends TourBehavior {


	protected _ar: AR;

	constructor(ar: AR, options) {
		super(ar, options);
		this._ar = ar;


	}


	protected  startTour() {


		if (!this.hasDirections()) {

			let last = null;
			this._points.forEach((p, i) => {

				if (last) {
					this._drawLine(last, p, i == 1 ? "#5daeeb" : "white");
				}
				last = p;


			});

		}


		this._points.forEach((p, index) => {
			if (index == 0) {
				return;
			}
			let directions = this.getDirectionsTo(index);
			if (directions) {

				let last = null;
				directions.forEach((p, i) => {

					p = toCoordinate(p);
					p.alt = this._points[index][2];

					if (last) {
						this._drawLine(last, p, i == 1 ? "#5daeeb" : "white");
					}
					last = p;


				});

			}
			console.log(directions);
		});


	}


	private _drawLine(c0, c1, color) {

				let first = this._ar.coordinateToVector3(c0);
				let second: Vector = this._ar.coordinateToVector3(c1);
				let center = (new Vector3()).center(first, second);

				let length = (new Vector3()).distance(first, second);
				this._ar.getAugmented().addBox({
					parentNode: this._ar.getWorldNode(),
					position: center,
					dimensions: {
						x: 0.5, y: 0.1, z: length
					},
					materials: [new Color(color || "white")]

				}).then((segment) => {



					// (new Axis(this._ar, segment)).drawAxis(4);


					const secondWorld = this._ar.getWorldNode().toWorldPosition(second);
					segment.lookAtWorldPosition(secondWorld);
					// segment.rotateBy({x:90, y:0, z:0})
					// let count=0;
					// let interval=setInterval(()=>{
					// 	if(count++>100){
					// 		clearInterval(interval);
					// 	}



					// }, 1000);
					console.log(segment);
				});



	}


	protected  focusTourStep(index) {


	}
	protected  endTour() {

	}
	protected  getVisibleItemLocationData(tourItem, callback) {

		this._ar.getMarkers().forEach((marker: Marker) => {
			if (marker.getFeature().id == tourItem.id) {
				callback(marker.getFeature().coordinates.slice(0));
			}
		});


	}
	protected  getItemLabel(tourItem, callback) {

		this._ar.getMarkers().forEach((marker: Marker) => {
			if (marker.getFeature().id == tourItem.id) {
				callback(marker.getFeature().name);
			}
		});


	}





}