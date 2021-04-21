
import { AR as Augmented, ARCommonNode, ARPosition } from 'nativescript-ar';
import { AR, ARItem } from '../AR';
import { Selection } from './Selection';
import { extend } from '../utils';

import { Vector3 } from './math/Vector3';

import { isIOS } from "@nativescript/core";

interface ARCrowdedItem extends ARItem {
	crowdPosition?: ARPosition;
}

/**
 * places items close to the camera
 */

export class ARCrowdCamera {

	private _selection: Selection;
	private _originNode: ARCommonNode;
	private _ar: Augmented;
	constructor(ar: AR, selection: Selection) {

		this._ar = ar.getAugmented();
		this._originNode = ar.getWorldNode(); // originNode;
		this._selection = selection;

	}

	public updateItem(node: ARCommonNode, item: ARItem) {

		node.scaleTo(item.distance / Math.log2(item.distance) - Math.log(item.distance) + 5);


		node.lookAtWorldPosition(extend(this._ar.getCameraPosition(), {
			y: node.getWorldPosition().y
		}));

		return;








		/*



		let origin=this._originNode.getPosition();
		let originInv=extend({}, origin, {y:-origin.y});

		item.distance=(new Vector3()).distance(originInv, item.position);

		let point=(<ARCrowdedItem>item).crowdPosition = this._setCrowdCamera(
			<ARCommonNode>item.shape,
			((this._isSelected(item) ? 20 : 23) + (item.distance / 400))/item.distance,
			item.position
		);



		item.shape.moveTo({x:point.x-item.position.x, y:point.y-item.position.y, z:point.z-item.position.z});



		let scale=(isIOS?1:3) * this.getScale(item.distance)*(this._isSelected(item)?1.5:1);

		node.scaleTo(scale);


		*/

	}

	private _isSelected(item) {
		if (this._selection) {
			return this._selection.isSelected(item);
		}
		return false;
	}

	private _setCrowdCamera(node: ARCommonNode, percent, pos) {

		let origin = this._originNode.getPosition();
		let originInv = extend({}, origin, {y: -origin.y});

		const p = (new Vector3()).lerp(percent, originInv, pos);
		// node.moveTo(p); //extend(p, {y:pos.y}));

		return p;

	}

	public getScale(distance) {

		return this._getScaleFactorNew(distance);
	}

	private _getScaleFactorNew(d) {
		let me = this;

		// initial scale can be static since items are 'crowded';
		let scale = isIOS ? 40 : 10;

		scale *= Math.min(1, 30 / d);


		scale = Math.min(5, scale);


		return Math.max(.25, scale);
	}

	private _getScaleFactor(d) {
		let me = this;

		// initial scale can be static since items are 'crowded';
		let scale = 23;

		if (d > 200) {
			// scale = scale - 5 * scale / Math.log(item.distance);
		}
		if (d > 700) {
			scale = scale / 2;
		}
		if (d > 800) {
			scale = scale / 2;
		}
		if (d > 900) {
			scale = scale / 2;
		}



		return Math.max(.25, scale);
	}

}



