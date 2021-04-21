

import {AR} from '../../AR';
import {AR as Augmented} from 'nativescript-ar';

import {isIOS} from '@nativescript/core';

export class ImageTracker {


	private _ar: AR;

	public constructor(ar: AR) {

		this._ar = ar;

		const image = "~/github-octocat-c.png"; // https://rijekafiume.geolive.ca/test.png";

		this._ar.getAugmented().trackImage({
        image: image,
        width: 1,
        onDetectedImage: (args) => {

          console.log('found image');

          args.imageTrackingActions.addImage({
            position: {
              x: 0, y: -0.1, z: 0
            },


            dimensions: {
              x: 0.2,
              y: 0.05
            },
            fontColor: "red",
            image: "font://" + "Cool!", // image.src,
            scale: 0.1
          }).catch(console.error);



        }
      });

	console.log("tracking image: " + image);


	}


  /**
   * tracking images are anchored at a location (lat/lng)
   * @param {[type]} location [description]
   * @param {[type]} radius   [description]
   */
  public trackingImagesNearby(location, radius) {


  }

  public onProximity(radius, callback) {


  }


}