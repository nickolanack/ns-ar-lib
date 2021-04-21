export class Heading {

	private _sensorManager: null | CLLocationManager = null;
	private _sensorUpdate: null | number = null; // interval

	public clearWatch() {


		if (!this._sensorManager || !this._sensorUpdate) {
			return;
		}

		this._sensorManager.stopUpdatingHeading();
		clearInterval(this._sensorUpdate);
		this._sensorManager = null;
		return;


	}

	public watchHeading(callback: (heading: number) => void, options?: any) {


		if (this._sensorManager || this._sensorUpdate) {
			throw 'Only allows one heading monitor';
		}


		this._sensorManager = CLLocationManager.alloc().init();


		let atLeastOne = true;

		if (this._sensorManager.headingAvailable) {

			this._sensorManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation;

			this._sensorManager.startUpdatingHeading();


			let atLeastOne = true;
			let trueHeading = false;

			this._sensorUpdate = setInterval(() => {




				if (this._sensorManager.heading) {

					let heading = this._sensorManager.heading.trueHeading;
					if (heading < 0) {
						if (atLeastOne || !trueHeading) {
							heading = this._sensorManager.heading.magneticHeading;
							atLeastOne = false;
						} else {
							return;
						}
					} else {
						trueHeading = true;
					}

					let orientationOffset = 0;
					let device = UIDevice.currentDevice.orientation;

					if (typeof device == "undefined") {
						return;
					}

					if (device === UIDeviceOrientation.LandscapeLeft) {
						orientationOffset = 90;
					}

					if (device === UIDeviceOrientation.LandscapeRight) {
						orientationOffset = -90;
					}

					callback(heading + orientationOffset);
				}
			}, 100);
		}



	}




}