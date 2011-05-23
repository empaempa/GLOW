/*
* Uniforms - Wrapper of Uniform
*/

GLOW.Uniforms = function( uniforms ) {
	
	// construct
	
	var that = {};
	

	//--- setup ---

	that.setup = function( program ) {
		
		
		
	}

	
	//--- activate ---
	
	that.activate = function() {
		
		var u, ul = uniforms.length;
		
		for( u = 0; u < ul; u++ ) {
			
			uniforms[ u ].activate();
			
		}
		
	}
	
	
	//--- return public ---
	
	return that;
	
}


/*
* Uniform
*/

GLOW.Uniform = function( uniformName, data ) {
	
	var that = {};
	var active = false;
	
	that.id = GLOW.uniqueId();
	that.uniformName = uniformName;
	that.data = data;
	
	
	//--- setup location ---
	
	that.setupLocation = function( location ) {
		
		that.location = location;
		return that;
		
	}
	
	
	//--- setup type ---
	
	that.setupType = function( type, isArray ) {
		
		if( isArray ) isArray = "_A";
		else          isArray = "";
		
		switch( type ) {
			
			case GL.INT:      that.set = GLOW.UniformSetFunctions[ "INT"      + isArray ]; break;
			case GL.INT_VEC2: that.set = GLOW.UniformSetFunctions[ "INT_VEC2" + isArray ]; break;
			case GL.INT_VEC3: that.set = GLOW.UniformSetFunctions[ "INT_VEC3" + isArray ]; break;
			case GL.INT_VEC4: that.set = GLOW.UniformSetFunctions[ "INT_VEC4" + isArray ]; break;
			
			case GL.FLOAT:      that.set = GLOW.UniformSetFunctions[ "FLOAT"      + isArray ]; break;
			case GL.FLOAT_VEC2: that.set = GLOW.UniformSetFunctions[ "FLOAT_VEC2" + isArray ]; break;
			case GL.FLOAT_VEC3: that.set = GLOW.UniformSetFunctions[ "FLOAT_VEC3" + isArray ]; break;
			case GL.FLOAT_VEC4: that.set = GLOW.UniformSetFunctions[ "FLOAT_VEC4" + isArray ]; break;

			case GL.FLOAT_MAT2: that.set = GLOW.UniformSetFunctions[ "FLOAT_MAT2" ]; break;
			case GL.FLOAT_MAT3: that.set = GLOW.UniformSetFunctions[ "FLOAT_MAT3" ]; break;
			case GL.FLOAT_MAT4: that.set = GLOW.UniformSetFunctions[ "FLOAT_MAT4" ]; break;
			
			case GL.SAMPLER_2D:   that.set = GLOW.UniformSetFunctions[ "SAMPLER_2D"   + isArray ]; break;
			case GL.SAMPLER_CUBE: that.set = GLOW.UniformSetFunctions[ "SAMPLER_CUBE" + isArray ]; break;
			
		}
		
		return that;
		
	}


	//--- activate ---
	
	that.activate = function() {
		
		if( active ) {
			
			if( !GLOW.Cache.Uniforms.isCached( that.id )) {

				that.set( that.location, that.data );

			}

		} else {
			
			console.warning( "GLOW.Uniform: Trying to activate non-active uniform. Is uniform missing in vertex/fragment code?" );
			
		}
		
		return that;
	}
	
	return that;

}

/*
* Uniform set functions
*/

GLOW.UniformSetFunctions = {
	
	INT: 			function( location, data ) { GL.uniform1i ( location, data ); },
	INT_A:	 		function( location, data ) { GL.uniform1iv( location, data ); },
	INT_VEC2:		function( location, data ) { GL.uniform2i ( location, data.x, data.y ); },
	INT_VEC2_A:		function( location, data ) { GL.uniform2iv( location, data ); },
	INT_VEC3:		function( location, data ) { GL.uniform3i ( location, data.x, data.y, data.z ); },
	INT_VEC3_A:		function( location, data ) { GL.uniform3iv( location, data ); },
	INT_VEC4:		function( location, data ) { GL.uniform4i ( location, data.x, data.y, data.z, data.w ); },
	INT_VEC4_A:		function( location, data ) { GL.uniform4iv( location, data ); },
	
	FLOAT: 			function( location, data ) { GL.uniform1f ( location, data ); },
	FLOAT_A:	 	function( location, data ) { GL.uniform1fv( location, data ); },
	FLOAT_VEC2:		function( location, data ) { GL.uniform2f ( location, data.x, data.y ); },
	FLOAT_VEC2_A:	function( location, data ) { GL.uniform2fv( location, data ); },
	FLOAT_VEC3:		function( location, data ) { GL.uniform3f ( location, data.x, data.y, data.z ); },
	FLOAT_VEC3_A:	function( location, data ) { GL.uniform3fv( location, data ); },
	FLOAT_VEC4:		function( location, data ) { GL.uniform4f ( location, data.x, data.y, data.z, data.w ); },
	FLOAT_VEC4_A:	function( location, data ) { GL.uniform4fv( location, data ); },
	
	FLOAT_MAT2:		function( location, data ) { GL.uniformMatrix2fv( location, data.transpose, data ); },
	FLOAT_MAT3:		function( location, data ) { GL.uniformMatrix3fv( location, data.transpose, data ); },
	FLOAT_MAT4:		function( location, data ) { GL.uniformMatrix4fv( location, data.transpose, data ); },
	
	SAMPLER_2D:		function( location, data ) { GL.uniform1i( location, data ); },
	SAMPLER_CUBE:	function( location, data ) { GL.uniform1i( location, data ); }
}
