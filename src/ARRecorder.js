

function ARRecorder(){};

ARRecorder.prototype.recordVideo = function(ar) {

	var me = this;

	var Permission = require('tns-mobile-data-collector').Permission;

	(new Permission()).requirePermissionFor(["filewrite"]).then(function() {
		return ar.startRecordingVideo();
	}).then(function(isRecording) {
		if (isRecording) {
			me._isRecording = true;

			console.log("recording");
		}
	}).catch(function(e) {
		console.error(e);
	})

}

ARRecorder.prototype.stopRecordingVideo = function(ar) {
	var me = this;

	if (me._isRecording) {
		ar.stopRecordingVideo().then(function(file) {
			console.log(file);
		}).catch(function(e) {
			console.error(e);
		});

		me._isRecording = false;
	}
}

ARRecorder.prototype.screenShot = function(ar) {

	ar.grabScreenshot().then(function(imageSource) {

	}).catch(console.error);
}

