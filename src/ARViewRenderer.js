"use strict";


var isAndroid = require("@nativescript/core").isAndroid;

var Color = require('@nativescript/core').Color;

var Permissions=require("tns-mobile-data-collector").Permissions;

function ARViewRenderer() {


	var me = this;



	Permissions.AddActionSupported('ar', ()=>{

		return new Promise((resolve, reject) => {
                try {
                  const ar = require("nativescript-ar").AR;
                  if (!ar.isSupported()) {
                       reject('AR is not supported on your device. It may become available after an update');
                       return;
                  }

                } catch (e) {
                   reject("missing plugin: @nativescript/ar");
                   return;
                }

                resolve(true);
            });

	})

	
	me._renderer = require('../').ViewRenderer.SharedInstance();
	me._renderer.addViewType('augmentedreality', function(container, field){
		return me.renderARView(container, field);
	});

}

try {
	var observableModule = require("@nativescript/core").Observable;
	ARViewRenderer.prototype = new observableModule.Observable();
} catch (e) {
	console.error('Unable to extend Observable!!!');
}

ARViewRenderer.prototype.renderARView = function(container, field) {

	var me = this;

	setTimeout(function() {
		me._renderARView(container, field);
		//me._renderSolarsystem(container, field);
	}, 100);

	//});

}


ARViewRenderer.prototype._setARState = function(state) {
	var me = this;
	state = JSON.parse(JSON.stringify(state));
	Object.keys(state).forEach(function(k) {
		me._renderer.getModel().set(k, state[k]);
	})

}

ARViewRenderer.prototype._renderARView = function(container, field) {



	var me = this;
	me._renderer._addClass(me._renderer._page, "with-ar");
	me._container = container;

	var AR=false;
	try{
	   AR = require("nativescript-ar").AR;
	}catch(e){
		console.error(e);

		me._renderer.renderField(container, {
			"type": "label",
			"value": "missing nativescript-ar"
		});

		return;
	}


	var supported = AR.isSupported();
	console.log('AR Supported: ' + (supported ? 'Yes' : 'No'));

	if (!supported) {

		me._renderer.renderField(container, {
			"type": "label",
			"value": "ARKit is not supported on your device. try updating the os"
		});

		return;
	}

	var ar = new AR({
		trackingMode:"IMAGE",

	});
	ar.trackingMode="IMAGE"
	if(isAndroid){

		ar.once("arLoaded",(event)=>{
			event.android.getArSceneView().getScene().getCamera().setFarClipPlane(1000); 
		});
		me._renderer.beforeDisposeCurrent(() => {
			let _fragment=ar.getFragment();
			
			_fragment.getPlaneDiscoveryController().hide();
	    	_fragment.getPlaneDiscoveryController().setInstructionView(null);
	    	//_fragment.getArSceneView().getPlaneRenderer().setEnabled(false);
	   
		});
	}
	
	var ARView=new (require('./AR').AR)(ar, container, field);

	me._renderer.onDisposeCurrent(()=>{
		ARView.remove();
	})


	ARView.once("arLoaded",()=>{
		ARView.getAugmented().setDebugLevel("WORLD_ORIGIN"); //draws origin in ios
		me.notify({
			eventName:"create",
			object:me,
			ar:ARView
		});
	});





	me._setARState({
		"nearbyImages":[],
		"nearbyMarkers":[],
		"atMarkers":[],
		"visibleMarkers":[],
		"calibrated":false,
		"calibrating":false
	})

	ARView.on("calibrating",(event)=>{
		me._setARState({
			"calibrating": true,
			"calibrated":false
		});
	});

	ARView.on("calibrated",(event)=>{
		me._setARState({
			"calibrating": false,
			"calibrated":true
		});
	});

	var nearby=(new (require('./ar/tracking/NearbyItems').NearbyItems)(ARView));

	me.notify({
		eventName:"createNearbyItems",
		object:me,
		ar:ARView,
		nearby:nearby
	});

	nearby.on("nearbyChanged",(event)=>{
		me._setARState({
			"nearbyMarkers": event.items.map((marker)=>{return marker.getFeature()})
		});
	})

	nearby.on("atChanged",(event)=>{
		me._setARState({
			"atMarkers": event.items.map((marker)=>{return marker.getFeature()})
		});
	});


	ARView.on("addMarker",(event)=>{
		me.notify(event);
	});


	// var application = require('application');
	// application.on(application.orientationChangedEvent, function() {
	// 	me._setARState({
	// 		"orientation":""
	// 	});
	// });



	var inView=(new (require('./ar/tracking/FieldOfView').FieldOfView)(ARView))
	// inView.on("intoView",(event)=>{
	// 	event.items.forEach((marker)=>{marker.showLabels();})
	// });
	
	me.notify({
		eventName:"createFieldOfView",
		object:me,
		ar:ARView,
		inView:inView
	});



	inView.on("update",(event)=>{
		event.itemsInView.forEach((marker)=>{marker.updateLabels();})
	});
	inView.on("outOfView",(event)=>{
		event.items.forEach((marker)=>{marker.hideLabels();})
	});
	inView.on("intoView",(event)=>{
		event.items.forEach((marker)=>{marker.showLabels();})
	});
	inView.on("inSightChanged",(event)=>{
		me._setARState({
			"visibleMarkers": event.items.map((marker)=>{return marker.getFeature()})
		});
	});


	ARView.on("itemSelect", function(event) {


		me._setARState({
			"item": event.item.feature
		});


		console.log("markerSelect: " + Object.keys(event));

		if(field.itemDetail){
			
			me._renderer._showSubform(_isObject(field.itemDetail)?field.itemDetail:{
				"view": field.itemDetail
			});

		}


		me.notify(event);
	});


	me._renderer.onDisposeCurrent(()=>{
		inView.remove();
		nearby.remove();
	});
	
	container.addChild(ar);

}



module.exports = ARViewRenderer;


var _isObject = (a) => {
	return Object.prototype.toString.call(a) == "[object Object]"
}
