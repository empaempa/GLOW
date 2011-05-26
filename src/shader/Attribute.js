GLOW.Attribute = function( parameters, interleave ) {
	
	var attribute = {};
	
	attribute.id       = GLOW.uniqueId();
	attribute.data     = parameters.data;
	attribute.name     = parameters.name;
	attribute.type     = parameters.type;
	attribute.location = parameters.location;
	attribute.stride   = 0;
	attribute.offset   = 0;
	attribute.size     = GLOW.AttributeSize( parameters.type );

	if( !interleave ) {
		
		if( !(attribute.data instanceof Float32Array )) {
			
			var a, al = attribute.data.length; 
			var s, sl = attribute.size;
			var flat = new Float32Array( al * sl );
			var data = attribute.data;
			var i = 0;
			
			for( a = 0; a < al; a++ ) {

				for( s = 0; s < sl; s++ ) {
					
					flat[ i++ ] = data[ a ].value[ s ];
				}
			}
			
			attribute.bufferData = flat;
			
		} else {
			
			attribute.bufferData = attribute.data;
		}

		attribute.buffer = GL.createBuffer();
		GL.bindBuffer( GL.ARRAY_BUFFER, attribute.buffer );
		GL.bufferData( GL.ARRAY_BUFFER, attribute.bufferData, GL.STATIC_DRAW );

	}


	//--- interleave ---
	
	attribute.interleave = function( float32array, stride, offset ) {
		
		attribute.stride = stride;
		attribute.offset = offset;
		
		// TODO
	}


	//--- bind ---
	
	attribute.bind = function() {
		
		if( !GLOW.Cache.attributeCached( attribute )) {
			
			GL.bindBuffer( GL.ARRAY_BUFFER, attribute.buffer );
			GL.vertexAttribPointer( attribute.location, attribute.size, GL.FLOAT, false, attribute.stride, attribute.offset );
		}
	}
	
	return attribute;
}


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