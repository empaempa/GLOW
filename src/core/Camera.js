/*
* camera
*/

GLOW.Camera = function( parameters ) {
	
	var camera = GLOW.Matrix4();
	
	camera.fov    = parameters.fov    !== undefined ? parameters.fov    : 60;
	camera.aspect = parameters.aspect !== undefined ? parameters.aspect : 1.0;
	camera.near   = parameters.near   !== undefined ? parameters.near   : 0.1;
	camera.far    = parameters.far    !== undefined ? parameters.far    : 10000;

	camera.useTarget = parameters.useTarget !== undefined ? parameters.useTarget : true;
	
	camera.projection = GLOW.Matrix4.makeProjection( camera.fov, camera.aspect, camera.near, camera.far );
	camera.inverse    = GLOW.Matrix4();
	camera.target     = GLOW.Vector3( 0, 0, -100 );
	camera.up         = GLOW.Vector3( 0, 1, 0 );
	
	
	//--- update ---
	
	var superUpdate = camera.update;
	
	camera.update = function() {

		if( camera.useTarget ) camera.lookAt( camera.target, camera.up );
		else superUpdate();
		
		GLOW.Matrix4.makeInverse( camera, camera.inverse );
	}
	
	return camera;
}


/*
* Create default camera
*/

GLOW.defaultCamera = GLOW.Camera( { fov: 40, aspect: window.innerWidth / window.innerHeight, near: 1, far: 10000 } );

