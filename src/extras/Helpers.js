GLOW.Helpers = (function() {
	
	var that = {};
	
	
	//--- random vector3 ---
	
	that.randomVector3 = function( amount, factor ) {
		
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
	
	
	//--- straight elements ---
	
	that.straightFaces = function( amount ) {
		
		var a, array = [];
		
		for( a = 0; a < amount; a++ ) {
			
			array.push( a );
		}
	}
	
	
	return that;
	
}());