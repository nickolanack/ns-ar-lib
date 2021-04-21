

var isAndroid = require("@nativescript/core").isAndroid;

var toDegrees = function(rad) {
	return rad * (180.0 / Math.PI);
}





var precision = function(n, d) {
	var p=Math.pow(10,d);
	return Math.round(p * n) / p;
}


var toRadians = function(deg) {
	return deg * (Math.PI / 180.0);
}








function ARVector() {

}



ARVector.prototype.dist=function(n, p){

	var u="m";
	if(n>1000){
		n=n/1000;
		u="km";
	}

	return precision(n,p)+u;
}

ARVector.prototype.dir=function(h, fmt){
	var cardinal=[
		'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
	]

	var step=360/cardinal.length;
	var index=Math.round((h-step/2)/step);
	return cardinal[index];
}




module.exports = ARVector;