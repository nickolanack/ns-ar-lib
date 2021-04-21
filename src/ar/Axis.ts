

import { Color } from "@nativescript/core";
import { AR } from '../AR';
import { ARNode } from '../AR';
import { extend } from '../utils';

export class Axis {

	private ar: AR;
	private node: ARNode|null = null;


	public constructor(ar, node?: ARNode) {

		this.ar = ar;

		if (node) {
			this.node = node;
		}




	}

	private addAlpha(color: Color, a: number) {

		return new Color(a, color.r, color.g, color.b);

	}

	public drawAxis(scale, offset?: any) {


		let nodeOpts = {

			position: extend({x: 0, y: 0, z: 0}, offset),
			scale: scale
		};
		if (this.node) {
			nodeOpts.parentNode = this.node;
		}

		this.ar.getAugmented().addNode(nodeOpts).then((container) => {

			this.ar.getAugmented().addSphere({
				parentNode: container,
				position: {x: 0, y: 0, z: 0},
				radius: 0.25,
				materials: [this.addAlpha(new Color("magenta"), 50)]

			});

			this.ar.getAugmented().addBox({
				parentNode: container,
				position: {x: .5, y: 0, z: 0},
				dimensions: {
					x: .5, y: .01, z: .1
				},
				materials: [this.addAlpha(new Color("red"), 50)]

			});
			this.ar.getAugmented().addBox({
				parentNode: container,
				position: {x: 0, y: 0, z: .5},
				dimensions: {
					x: .1, y: .01, z: .5
				},
				materials: [this.addAlpha(new Color("blue"), 50)]

			});
			this.ar.getAugmented().addBox({
				parentNode: container,
				position: {x: 0, y: .5, z: 0},
				dimensions: {
					x: .01, y: .5, z: .1
				},

				materials: [this.addAlpha(new Color("green"), 50)]

			});

		});


	}
}