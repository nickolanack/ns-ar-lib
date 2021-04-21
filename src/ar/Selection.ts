
import { AR, Zero3D, ARItem } from '../AR';
import { AR as Augmented, ARNode, ARDimensions } from 'nativescript-ar';

import { getRenderer, extend } from '../utils';





export class Selection {

	private _lastSelected: ARItem;
	private _lastPopover: ARNode;
	private _ar: AR;
	private _field: any;

	constructor(ar: AR, field) {

		this._ar = ar;
	}

	public isSelected(item) {
		let me = this;
		if (me._lastSelected == item) {
			return true;
		}
		return false;
	}

	public selectObject(item: ARItem, fields) {

		let me = this;
		let last = me._lastSelected;

		if (me._lastPopover) {
			me._lastPopover.remove();
		}
		if (last) {
			me._lastSelected = null;
			me._ar.updateItem(last);
		}

		if (!item) {
			return;
		}

		// item.shape.scaleTo(1.7);

		me._lastSelected = item;
		me._ar.updateItem(item);

		let fields = me._field.card || [{
			type: "label",
			value: item.feature.name,
			style: "color:black;"
		}, {
			type: "label",
			value: "{data.feature.distance} {data.heading}",
			style: "color:cornflowerblue; font-size:10px;"
		}];

		if (typeof fields == "string" && fields[0] == '{') {
			fields = getRenderer()._parse(fields);
		}


		let preparsedFields = me._prepareTemplate(item.feature, fields);


		let fieldset = getRenderer().renderField(me._ar.getContainer(), {

			"type": "fieldset",
			"position": "absolute",
			"left": 200,
			"top": 1000,
			"className": "ar-card",
			"fields": preparsedFields

		});

		let isAndroid = require("@nativescript/core").isAndroid;

		setTimeout(() => {



			me._ar.getAugmented().addNode({
				parentNode: item.shape,
				position: Zero3D()
			}).then((selected) => {

				me._lastPopover = selected;

				me._ar.getAugmented().addUIView(extend({

					position: {
						x: 0,
						y: 0.3,
						z: 0
					},
					scale: isAndroid ? 1 : 3,
					parentNode: selected,
					view: fieldset,
					chamferRadius: .01
				}, (isAndroid ? {} : {
					dimensions: {
						x: .6,
						y: .1
					}
				}))).catch(console.error);

				let ImageResolver = require('../').ImageResolver;
				let image = (new ImageResolver()).setParser(getRenderer()._parse.bind(getRenderer())).createImage({
					image: "{markerIcon.3}?tint=rgb(255,255,255)",
					async: false
				});

				me._ar.getAugmented().addImage({
					dimensions: {
						x: 0.32,
						y: 0.32
					},
					image: image.src,
					rotation: Zero3D(),
					position: {
						x: 0,
						y: 0,
						z: isAndroid ? -0.03 : 0.03
					},
					parentNode: selected
				}).catch(console.error);

			});


		}, 500);


	}

	private _prepareTemplate(str, template) {
		return getRenderer()._getParser().prepareTemplate(str, getRenderer()._params(), template);
	}


}