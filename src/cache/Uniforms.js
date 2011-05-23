GLOW.Cache.Uniforms = (function() {
	
	var that = {};
	var dataByLocation = {};
	
	
	//--- is cached ---
	
	that.isCached = function( uniform ) {
		
		if( dataByLocation[ uniform.location ] === uniform.data ) {
			
			return true;
			
		}
		
		dataByLocation[ uniform.location ] === uniform.data;
		return false;
	}
	
	
	//--- clear ---
	
	that.clear = function() {
		
		dataByLocation = {};
		
	}
	
	
	//--- return public ---
	
	return that;
	
}());