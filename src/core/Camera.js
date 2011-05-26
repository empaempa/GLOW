/*
* camera
*/

GLOW.Camera = function( fov, aspect, near, far ) {
	
	var camera = GLOW.Matrix4();
	
	fov    = fov    !== undefined ? fov    : 60;
	aspect = aspect !== undefined ? aspect : 1.0;
	near   = near   !== undefined ? near   : 0.1;
	far    = far    !== undefined ? far    : 10000;
	
	camera.projection = GLOW.Matrix4.makeProjection( fov, aspect, near, far );
	camera.inverse    = GLOW.Matrix4();
	
	//--- update ---
	
	var superUpdate = camera.update;
	
	camera.update = function() {
		
		superUpdate();
		GLOW.Matrix4.makeInverse( camera, camera.inverse );
	}
	
	return camera;
}


/*
* Create default camera
*/

GLOW.defaultCamera = GLOW.Camera();

