
import {Application as app} from "@nativescript/core";

export class Heading {

	private _sensorManager: any = null;
	private _sensorUpdate: any = null; // interval

	public clearWatch() {


		if ((!this._sensorManager) || (!this._sensorUpdate)) {
			return;
		}

		this._sensorManager.unregisterListener(this._sensorUpdate);
		this._sensorManager = null;
		this._sensorUpdate = null;

		return;


	}

	public watchHeading(callback: (heading: number) => void, options?: any) {


		if (this._sensorManager || this._sensorUpdate) {
			throw 'Only allows one heading monitor';
		}


		this._sensorManager = app.android.foregroundActivity.getSystemService(
			android.content.Context.SENSOR_SERVICE
		);



		let atLeastOne = true;
		let requireAccuracy = false;

		this._sensorUpdate = new android.hardware.SensorEventListener({
			onAccuracyChanged: (sensor, accuracy) => {
				// console.log(accuracy)
			},
			onSensorChanged: (event) => {

				/*

				if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER)  mGravity = event.values.clone ();
			    if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) mGeomagnetic =  event.values.clone ();

			    if (mGravity != null && mGeomagnetic != null) {


			        float[] rotationMatrixA = mRotationMatrixA;
			        if (SensorManager.getRotationMatrix(rotationMatrixA, null, mGravity, mGeomagnetic)) {

			            float[] rotationMatrixB = mRotationMatrixB;
			            SensorManager.remapCoordinateSystem(rotationMatrixA,
			                    SensorManager.AXIS_X, SensorManager.AXIS_Z,
			                    rotationMatrixB);
			            float[] dv = new float[3];
			            SensorManager.getOrientation(rotationMatrixB, dv);
			            // add to smoothing filter
			            fd.AddLatest((double)dv[0]);
			        }
			        mDraw.invalidate();
			    }

				*/



				if (requireAccuracy && event.accuracy == android.hardware.SensorManager.SENSOR_STATUS_UNRELIABLE) {
					if (!atLeastOne) {
						return;
					}
					atLeastOne = false;
				}


				let orientationOffset = 0;

				// let device=app.android.context.getResources().getConfiguration().orientation;
				// if (device === android.content.res.Configuration.ORIENTATION_LANDSCAPE) {
				// 	orientationOffset = 90;
				// }


				callback(event.values[0] + orientationOffset);
			}
		});




		const orientationSensor = this._sensorManager.getDefaultSensor(
			android.hardware.Sensor.TYPE_ORIENTATION
		);
		this._sensorManager.registerListener(
			this._sensorUpdate,
			orientationSensor,
			android.hardware.SensorManager.SENSOR_DELAY_NORMAL, android.hardware.SensorManager.SENSOR_DELAY_UI
		);



	}




}