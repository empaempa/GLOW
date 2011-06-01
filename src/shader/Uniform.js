/*
* Uniform
*/

GLOW.Uniform = function( parameters, data ) {
	
	"use strict";
	
	this.id             = GLOW.uniqueId();
	this.name           = parameters.name;
	this.length         = parameters.length;
	this.type           = parameters.type;
	this.location       = parameters.location;
	this.locationNumber = parameters.locationNumber;
	this.data           = data;
	
	
	// set set-function
	
	var isArray;
	
	if( this.length && this.length > 1 ) {
		isArray = "_A";
	} else {
		isArray = "";
	}
	
	switch( this.type ) {
		
		case GL.INT:      this.uniformFunction = GLOW.UniformFunctions[ "INT"      + isArray ]; break;
		case GL.INT_VEC2: this.uniformFunction = GLOW.UniformFunctions[ "INT_VEC2" + isArray ]; break;
		case GL.INT_VEC3: this.uniformFunction = GLOW.UniformFunctions[ "INT_VEC3" + isArray ]; break;
		case GL.INT_VEC4: this.uniformFunction = GLOW.UniformFunctions[ "INT_VEC4" + isArray ]; break;
		
		case GL.FLOAT:      this.uniformFunction = GLOW.UniformFunctions[ "FLOAT"      + isArray ]; break;
		case GL.FLOAT_VEC2: this.uniformFunction = GLOW.UniformFunctions[ "FLOAT_VEC2" + isArray ]; break;
		case GL.FLOAT_VEC3: this.uniformFunction = GLOW.UniformFunctions[ "FLOAT_VEC3" + isArray ]; break;
		case GL.FLOAT_VEC4: this.uniformFunction = GLOW.UniformFunctions[ "FLOAT_VEC4" + isArray ]; break;

		case GL.FLOAT_MAT2: this.uniformFunction = GLOW.UniformFunctions[ "FLOAT_MAT2" ]; break;
		case GL.FLOAT_MAT3: this.uniformFunction = GLOW.UniformFunctions[ "FLOAT_MAT3" ]; break;
		case GL.FLOAT_MAT4: this.uniformFunction = GLOW.UniformFunctions[ "FLOAT_MAT4" ]; break;
		
		case GL.SAMPLER_2D:   this.uniformFunction = GLOW.UniformFunctions[ "SAMPLER_2D"   + isArray ]; break;
		case GL.SAMPLER_CUBE: this.uniformFunction = GLOW.UniformFunctions[ "SAMPLER_CUBE" + isArray ]; break;
		
	}
}

/*
* Prototype
*/

GLOW.Uniform.prototype.set = function() {
	
	if( !GLOW.currentContext.cache.uniformCached( this )) {
		this.uniformFunction( this.location, this.data );
	}
}


/*
* Uniform functions
*/

GLOW.UniformFunctions = {
	
	INT: 			function( location, data ) { GL.uniform1i ( location, data.value ); },
	INT_A:	 		function( location, data ) { GL.uniform1iv( location, data.value ); },
	INT_VEC2:		function( location, data ) { GL.uniform2i ( location, data.value[ 0 ], data.value[ 1 ] ); },
	INT_VEC2_A:		function( location, data ) { GL.uniform2iv( location, data.value ); },
	INT_VEC3:		function( location, data ) { GL.uniform3i ( location, data.value[ 0 ], data.value[ 1 ], data.value[ 2 ] ); },
	INT_VEC3_A:		function( location, data ) { GL.uniform3iv( location, data.value ); },
	INT_VEC4:		function( location, data ) { GL.uniform4i ( location, data.value[ 0 ], data.value[ 1 ], data.value[ 2 ], data.value[ 3 ] ); },
	INT_VEC4_A:		function( location, data ) { GL.uniform4iv( location, data ); },
	
	FLOAT: 			function( location, data ) { GL.uniform1f ( location, data.value ); },
	FLOAT_A:	 	function( location, data ) { GL.uniform1fv( location, data.value ); },
	FLOAT_VEC2:		function( location, data ) { GL.uniform2f ( location, data.value[ 0 ], data.value[ 1 ] ); },
	FLOAT_VEC2_A:	function( location, data ) { GL.uniform2fv( location, data.value ); },
	FLOAT_VEC3:		function( location, data ) { GL.uniform3f ( location, data.value[ 0 ], data.value[ 1 ], data.value[ 2 ] ); },
	FLOAT_VEC3_A:	function( location, data ) { GL.uniform3fv( location, data.value ); },
	FLOAT_VEC4:		function( location, data ) { GL.uniform4f ( location, data.value[ 0 ], data.value[ 1 ], data.value[ 2 ], data.value[ 3 ] ); },
	FLOAT_VEC4_A:	function( location, data ) { GL.uniform4fv( location, data.value ); },
	
	FLOAT_MAT2:		function( location, data ) { GL.uniformMatrix2fv( location, data.transposeUniform, data.value ); },
	FLOAT_MAT3:		function( location, data ) { GL.uniformMatrix3fv( location, data.transposeUniform, data.value ); },
	FLOAT_MAT4:		function( location, data ) { GL.uniformMatrix4fv( location, data.transposeUniform, data.value ); },

	SAMPLER_2D:	function( location, data ) { 
		
		if( data.texture !== undefined && data.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached( data )) {
			
			GL.uniform1i( location, data.textureUnit ); 
			GL.activeTexture( GL.TEXTURE0 + data.textureUnit );
			GL.bindTexture( GL.TEXTURE_2D, data.texture ); 
		}
	},
	
	SAMPLER_CUBE:	function( location, data ) { /* TODO */ }
}
