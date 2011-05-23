GLOW.Cache.Program = (function() {
	
	var that = {};
	var currentProgramId = -1;
	
	
	//--- is cached ---
	
	that.isCached = function( programId ) {
		
		if( programId === currentProgramId ) {
			return true;
		}
		
		currentProgramId = programId;
		return false;
	}


	//--- clear ---

	that.clear = function() {
		
		currentProgramId = -1;
	}
	
	
	//--- return public ---
	
	return that;
	
}());