/*
* GLOW.Camera
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Camera = function( parameters ) {

	"use strict";
	GLOW.Matrix4.call( this );

	parameters = parameters !== undefined ? parameters : {};

	var fov    = parameters.fov    !== undefined ? parameters.fov    : 40;
	var aspect = parameters.aspect !== undefined ? parameters.aspect : window.innerWidth / window.innerHeight;
	var near   = parameters.near   !== undefined ? parameters.near   : 0.1;
	var far    = parameters.far    !== undefined ? parameters.far    : 10000;

	this.useTarget  = parameters.useTarget !== undefined ? parameters.useTarget : true;
	this.projection = GLOW.Matrix4.makeProjection( fov, aspect, near, far );
	this.inverse    = new GLOW.Matrix4();
	this.target     = new GLOW.Vector3( 0, 0, -100 );
	this.up         = new GLOW.Vector3( 0, 1, 0 );
	
	this.update();
}

/*
* Prototype
*/

GLOW.Camera.prototype = new GLOW.Matrix4();
GLOW.Camera.prototype.constructor = GLOW.Camera;
GLOW.Camera.prototype.supr = GLOW.Matrix4.prototype;

GLOW.Camera.prototype.update = function() {

	if( this.useTarget ) this.lookAt( this.target, this.up );
	GLOW.Matrix4.makeInverse( this, this.inverse );
}



/*
* Create default camera
*/

GLOW.defaultCamera = new GLOW.Camera();

