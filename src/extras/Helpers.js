GLOW.Helpers = (function() {
	
	var that = {};
	
	
	//--- cube vertices ---
	
	that.cubeVertices = function( size ) {
		
		var a = new Float32Array( 6 * 4 * 3 );
		var i = 0;
		
		size *= 0.5;
		
		// front
		
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 

		// back

		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 

		// left

		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		
		// right

		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 

		// up
		
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		
		// down

		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		
		return a;
	}
	
	that.cubeElements = function() {

		var a = new Float32Array( 6 * 2 * 3 );
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
	}
	
	
	//--- array: random vector3 ---
	
	that.arrayRandomVector3 = function( amount, factor ) {
		
		factor = factor !== undefined ? factor : 1;
		
		var a, array = [];
		var doubleFactor = factor * 2;
		
		for( a = 0; a < amount; a++ ) {
			
			array.push( GLOW.Vector3( Math.random() * doubleFactor - factor, 
									  Math.random() * doubleFactor - factor, 
									  Math.random() * doubleFactor - factor ));
		}

		return array;
	}
	
	
	//--- array: elements ---
	
	that.arrayElements = function( amount ) {
		
		var i = 0, a, array = new Uint16Array( amount * 3 );
		
		for( a = 0; a < amount; a++ ) {
			
			array[ i ] = i++;
			array[ i ] = i++;
			array[ i ] = i++;
		}
		
		return array;
	}
	
	
	return that;
	
}());