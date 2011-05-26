/*
* Cache
*/

GLOW.Cache = (function() {
	
	var cache = {};

	//--- program cache --
	
	cache.programCached = function( program ) {
		
		return false;
	}

	//--- uniform cache ---
	
	cache.uniformCached = function( uniform ) {
		
		return false;
	}


	//--- attribute cached ---
	
	cache.attributeCached = function( attribute ) {
		
		return false;
	}


	//--- texture cached ---
	
	cache.textureCached = function( texture ) {
		
		return false;
	}


	//--- elements cached ---
	
	cache.elementsCached = function( elements ) {
		
		return false;
	}
 

	//--- clear ---
	
	cache.clear = function() {

	}
	
	return cache;
	
}());