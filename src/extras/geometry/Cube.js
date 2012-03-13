GLOW.Geometry.Cube = {
	
	vertices: function( size ) {

		var a = new Float32Array( 6 * 4 * 3 );
		var i = 0;

		size = size !== undefined ? size * 0.5 : 5;

		// front

		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 

		// back

		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 

		// left

		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 

		// right

		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 

		// up

		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 

		// down

		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 

		return a;
	},

	indices: function() {

		var a = new Uint16Array( 6 * 2 * 3 );
		var i = 0;

		a[ i++ ] = 0; a[ i++ ] = 1; a[ i++ ] = 2;
		a[ i++ ] = 0; a[ i++ ] = 2; a[ i++ ] = 3;

		a[ i++ ] = 4; a[ i++ ] = 5; a[ i++ ] = 6;
		a[ i++ ] = 4; a[ i++ ] = 6; a[ i++ ] = 7;

		a[ i++ ] = 8; a[ i++ ] = 9; a[ i++ ] = 10;
		a[ i++ ] = 8; a[ i++ ] = 10; a[ i++ ] = 11;

		a[ i++ ] = 12; a[ i++ ] = 13; a[ i++ ] = 14;
		a[ i++ ] = 12; a[ i++ ] = 14; a[ i++ ] = 15;

		a[ i++ ] = 16; a[ i++ ] = 17; a[ i++ ] = 18;
		a[ i++ ] = 16; a[ i++ ] = 18; a[ i++ ] = 19;

		a[ i++ ] = 20; a[ i++ ] = 21; a[ i++ ] = 22;
		a[ i++ ] = 20; a[ i++ ] = 22; a[ i++ ] = 23;

		return a;
	},

	primitives: function() {
	    return GL.TRIANGLES;
	},

	uvs: function() {
		
		var a = new Float32Array( 6 * 4 * 2 );
		var i = 0;
		
		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;
		
		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;

		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;

		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;
		
		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;

		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;

		return a;
	},
	
	normals: function() {
		return GLOW.Geometry.faceNormals( GLOW.Geometry.Cube.vertices(), GLOW.Geometry.Cube.indices());
	}
}


