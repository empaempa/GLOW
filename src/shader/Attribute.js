GLOW.Attribute = function( parameters, interleave ) {
	
	"use strict";
	
	this.id             = GLOW.uniqueId();
	this.data           = parameters.data;
	this.name           = parameters.name;
	this.type           = parameters.type;
	this.location       = parameters.location;
	this.locationNumber = parameters.locationNumber;
	this.stride         = 0;
	this.offset         = 0;
	this.size           =  GLOW.AttributeSize( parameters.type );

	if( !interleave ) {
		
		if( !(this.data instanceof Float32Array )) {
			
			var a, al = this.data.length; 
			var s, sl = this.size;
			var flat = new Float32Array( al * sl );
			var data = this.data;
			var i = 0;
			
			for( a = 0; a < al; a++ ) {

				for( s = 0; s < sl; s++ ) {
					
					flat[ i++ ] = data[ a ].value[ s ];
				}
			}
			
			this.bufferData = flat;
			
		} else {
			
			this.bufferData = this.data;
		}

		this.buffer = GL.createBuffer();
		GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
		GL.bufferData( GL.ARRAY_BUFFER, this.bufferData, GL.STATIC_DRAW );

	}
}

/*
* Prototype
*/

GLOW.Attribute.prototype.interleave = function( float32array, stride, offset ) {
	
	this.stride = stride;
	this.offset = offset;
	
	// TODO
}

GLOW.Attribute.prototype.bind = function() {
	
	if( !GLOW.currentContext.cache.attributeCached( this )) {
		
		GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
		GL.vertexAttribPointer( this.location, this.size, GL.FLOAT, false, this.stride, this.offset );
	}
}


/*
* Attribute Size
*/

GLOW.AttributeSize = function( type ) { 
	
	switch( type ) {
		
		case GL.INT:      return 1;
		case GL.INT_VEC2: return 2;
		case GL.INT_VEC3: return 3;
		case GL.INT_VEC4: return 4;
		
		case GL.FLOAT:      return 1;
		case GL.FLOAT_VEC2: return 2;
		case GL.FLOAT_VEC3: return 3;
		case GL.FLOAT_VEC4: return 4;

		case GL.FLOAT_MAT2: return 4;
		case GL.FLOAT_MAT3: return 9;
		case GL.FLOAT_MAT4: return 16;
	}
	
	return 0;
}
