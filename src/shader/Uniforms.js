/*
* Uniforms
*/

GLOW.Uniforms = function( uniforms ) {
	
	// construct
	
	var that = {};
	
	for( var u in uniforms ) {
		
		
		
	}
	
	
	//--- activate ---
	
	that.activate = function() {
		
		
		
	}
	
	
	//--- return public ---
	
	return that;
	
}

/*
* Uniform
*/

GLOW.Uniform = function( id, data ) {
	
	var that = {};
	var active = false;
	
	that.id = id;
	that.data = data;
	
	
	//--- setup location ---
	
	that.setupLocation = function( location ) {
		
		that.location = location;
		return that;
		
	}
	
	
	//--- setup type ---
	
	that.setupType = function( type ) {
		
		that.type = type;
		return that;
		
	}


	//--- activate ---
	
	that.activate = function() {
		
		if( active ) {
			
			if( !GLOW.Cache.Uniforms.isCached( that )) {

				switch( that.type ) {
					
					case GLOW.UniformType_1i:
						GL.uniform1i( that.location, that.data );
						break;

					case GLOW.UniformType_1iv:
						GL.uniform1iv( that.location, that.data );
						break;

					
					case GLOW.UniformType_1f:
						GL.uniform1f( that.location, that.data );
						break;
					
				}

			}
			
		} else {
			
			console.warning( "GLOW.Uniform: Trying to activate non-active uniform. Missing in vertex/fragment code?" );
			
		}
		
		return that;
	}
	
}

/*
* Uniform Cache
*/

