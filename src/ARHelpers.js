function Stats(container){

	var me = this;
	me._renderer = require('../').ViewRenderer.SharedInstance();
	me._renderer.renderField(container, {
		"type": "fieldset",
		"position": "absolute",
		"left": 50,
		"top": 200,
		"fields": [{
			"type": "label",
			"value": "GPS: {data.gpsHeading} [{data.gpsCoordinate.lat}, {data.gpsCoordinate.lng}]"
		}, {
			"type": "label",
			"value": "AR Cam Heading: {data.arCameraHeading}"
		}, {
			"type": "label",
			"value": "AR Cam Position: x:{data.arCameraPosition.x}, z:{data.arCameraPosition.z} dxz:{data.arCameraPosition.dxz}"
		}, {
			"type": "label",
			"value": "AR Origin (=>Proj): {data.arOriginHeading} [{data.arOriginCoordinate.lat}, {data.arOriginCoordinate.lng}]"
		}]
	});

}


function Compass(container){

	var me = this;
	me._renderer = require('../').ViewRenderer.SharedInstance();
	me._renderer.renderField(container, {
		"type": "fieldset",
		"position": "absolute",
		"left": 20,
		"bottom": 20,
		"fields": [{
			"type": "label",
			"value": " {data.heading}",
			"style":"color:cornflowerblue; font-size:40px; font-weight:bold;"
		}]
	});

}



function ItemHighlighter(){

	
}


module.exports={

	Compass:Compass,
	Stats:Stats
}



