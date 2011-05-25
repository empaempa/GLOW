GLOW.Cache = (function() {
	
	var cache = {};

	//--- program cache --
	
	cache.programCache( program ) {
		
		return false;
		
	}

	//--- uniform cache ---
	
	cache.uniformCached( uniform ) {
		
		return false;
		
	}


	//--- attribute cached ---
	
	cache.attributeCached( attribute ) {
		
		return false;
		
	}


	//--- texture cached ---
	
	cache.textureCached( texture ) {
		
		return false;
	}


	//--- clear ---
	
	that.clear = function() {

	}
	
	return cache;
	
}());