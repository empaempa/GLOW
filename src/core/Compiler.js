/*
* GLOW.Compiler
* @author: Mikael Emtinger, gomo.se
* Compiles vertex- and fragementshader, uniforms, attributes and elements into a GLOW.CompiledData
*/

GLOW.Compiler = (function() {
	
	"use strict"; 
	"use restrict";
	
	var compiler = {};
	
	//--- compile ------------------------------------------
	// parameter object containing:
	//  vertexShaderCode = string, the vertex shader code
	//  fragmentShaderCode = string, the framgnet shader code
	//  uniformsAndAttributes = object, for example { transform: GLOW.Matrix4 }
	//  elements = array or UInt16Array with elements
	
	compiler.compile = function( parameters ) {
		var program = GLOW.currentContext.cache.codeCompiled( parameters.vertexShader, parameters.fragmentShader );
		if( program === undefined ) {
			program = compiler.linkProgram( compiler.compileVertexShader  ( parameters.vertexShader   ),
			                                compiler.compileFragmentShader( parameters.fragmentShader ));
			GLOW.currentContext.cache.addCompiledProgram( program );
		}
		
		var uniforms              = compiler.createUniforms      ( compiler.extractUniforms  ( program ), parameters.data );
		var attributes            = compiler.createAttributes    ( compiler.extractAttributes( program ), parameters.data, parameters.usage, parameters.interleave );
		var interleavedAttributes = compiler.interleaveAttributes( attributes, parameters.interleave );

		var elements = parameters.elements;
		var elementType = GL.TRIANGLES;
		var usageParameters = parameters.usage ? parameters.usage : {};
		var elementUsage = usageParameters.elements;

		if( parameters.triangles ) {
		    elements = parameters.triangles;
		    elementUsage = usageParameters.triangles;
		} else if( parameters.triangleStrip ) {
		    elements = parameters.triangleStrip;
		    elementType = GL.TRIANGLE_STRIP;
		    elementUsage = usageParameters.triangleStrip;
		} else if( parameters.triangleFan ) {
		    elements = parameters.triangleFan;
		    elementType = GL.TRIANGLE_FAN;
		    elementUsage = usageParameters.triangleFan;
		} else if( parameters.points ) {
		    elements = parameters.points;
		    elementType = GL.POINTS;
		    elementUsage = usageParameters.points;
		} else if( parameters.lines ) {
		    elements = parameters.lines;
		    elementType = GL.LINES;
		    elementUsage = usageParameters.lines;
		} else if( parameters.lineLoop ) {
		    elements = parameters.lineLoop;
		    elementType = GL.LINE_LOOP;
		    elementUsage = usageParameters.lineLoop;
		} else if( parameters.lineStrip ) {
		    elements = parameters.lineStrip;
		    elementType = GL.LINE_STRIP;
		    elementUsage = usageParameters.lineStrip;
		}

		elements = compiler.createElements( elements, elementType, elementUsage ); 

        return new GLOW.CompiledData( program, uniforms, attributes, interleavedAttributes, elements, parameters );
	}


	//--- compile vertex shader ---

	compiler.compileVertexShader = function( vertexShaderCode ) {

		var vertexShader;
		vertexShader    = GL.createShader( GL.VERTEX_SHADER );
		vertexShader.id = GLOW.uniqueId();
		
		GL.shaderSource ( vertexShader, vertexShaderCode );
		GL.compileShader( vertexShader );

	    if( !GL.getShaderParameter( vertexShader, GL.COMPILE_STATUS )) {
			console.error( "GLOW.Compiler.compileVertexShader: " + GL.getShaderInfoLog( vertexShader ));
		}
		
		return vertexShader;
	}


	//--- compile fragment shader code ---

	compiler.compileFragmentShader = function( fragmentShaderCode ) {

		var fragmentShader;
		fragmentShader    = GL.createShader( GL.FRAGMENT_SHADER );
		fragmentShader.id = GLOW.uniqueId();
		
		GL.shaderSource ( fragmentShader, fragmentShaderCode );
		GL.compileShader( fragmentShader );

	    if( !GL.getShaderParameter( fragmentShader, GL.COMPILE_STATUS )) {
			console.error( "GLOW.Compiler.compileFragmentShader: " + GL.getShaderInfoLog( fragmentShader ));
		}
		
		return fragmentShader;
	}


	//--- link program ---

	compiler.linkProgram = function( vertexShader, fragmentShader ) {

		var program;
	    program    = GL.createProgram();
		program.id = GLOW.uniqueId();

	    GL.attachShader( program, vertexShader );
	    GL.attachShader( program, fragmentShader );
	    GL.linkProgram ( program );

	    if( !GL.getProgramParameter( program, GL.LINK_STATUS )) {
			console.error( "GLOW.Compiler.linkProgram: Could not initialise program" );
	    }
	
		return program;
	}
	
	
	//--- extract uniforms ---

	compiler.extractUniforms = function( program ) {
		var uniforms = {};
		var uniform;
		var locationNumber = 0;
		var result;

		while( true ) {
			result = GL.getActiveUniform( program, locationNumber );
			if( result !== null && result !== -1 && result !== undefined ) {
                uniform = {
                    name: result.name.split( "[" )[ 0 ],
                    size: result.size,
                    type: result.type,
                    location: GL.getUniformLocation( program, result.name.split( "[" )[ 0 ] ),
                    locationNumber: locationNumber
                };
				uniforms[ uniform.name ] = uniform;
			} else break;
			locationNumber++;
		}

		return uniforms;
	}


	//--- extract attributes ---
	
	compiler.extractAttributes = function( program ) {
		var attribute, locationNumber = 0;
		var attributes = {};
        var result;

		while( true ) {
			result = GL.getActiveAttrib( program, locationNumber );
			if( result !== null && result !== -1 && result !== undefined ) {
                attribute = {
                    name: result.name,
                    size: result.size,
                    type: result.type,
                    location: GL.getAttribLocation( program, result.name ),
                    locationNumber: locationNumber
                }
				attributes[ attribute.name ] = attribute;
			} else break;
			locationNumber++;
		}

		program.highestAttributeNumber = locationNumber - 1;
		return attributes;
	}
	

	//--- create uniforms ---

	compiler.createUniforms = function( uniformInformation, data ) {
		var u;
		var uniforms = {};
		var uniform, name;
		var textureUnit = 0;

		for( u in uniformInformation ) {
			uniform = uniformInformation[ u ];
			name    = uniform.name;
			if( data[ name ] === undefined ) {
				console.warn( "GLOW.Compiler.createUniforms: missing declaration for uniform " + name );
			} else if( data[ name ] instanceof GLOW.Uniform ) {
				uniforms[ name ] = data[ name ];
			} else {
				uniforms[ name ] = new GLOW.Uniform( uniform, data[ name ] );
				if( uniforms[ name ].type === GL.SAMPLER_2D || uniforms[ name ].type === GL.SAMPLER_CUBE ) {
					uniforms[ name ].textureUnit = textureUnit++;
					uniforms[ name ].data.init();
				}
			}
		}
		
		return uniforms;
	}


	//--- create attributes ---

	compiler.createAttributes = function( attributeInformation, data, usage, interleave ) {

		var a;
		var attribute, name;
		var attributes = {};
		interleave = interleave !== undefined ? interleave : {};
		usage = usage !== undefined ? usage : {};

		for( a in attributeInformation ) {
			attribute = attributeInformation[ a ];
			name      = attribute.name;
			
			if( data[ name ] === undefined ) {
				console.warn( "GLOW.Compiler.createAttributes: missing declaration for attribute " + name );
			} else if( data[ name ] instanceof GLOW.Attribute ) {
				attributes[ name ] = data[ name ];
			} else {
				attributes[ name ] = new GLOW.Attribute( attribute, data[ name ], usage[ name ] !== undefined ? usage[ name ] : undefined, interleave[ name ] !== undefined ? interleave[ name ] : true );
			}
		}

		return attributes;
	}
	
	//--- interleave attributes ---
	
	compiler.interleaveAttributes = function( attributes, interleave ) {
	    interleave = interleave !== undefined ? interleave : {};
	    
	    var a, al, b, bl, i;
	    var lowestAvailableIndex = 0;
	    var attributeByIndex = [];
	    
	    // get lowest available index
	    for( a in attributes ) {
	        if( interleave[ a ] !== undefined && interleave[ a ] !== false ) {
	            lowestAvailableIndex = Math.max( lowestAvailableIndex - 1, interleave[ a ] ) + 1;
	        }
	    }
	    
	    // set all non-set attributes to lowest available index
	    for( a in attributes ) {
	        if( interleave[ a ] === undefined ) {
	            interleave[ a ] = lowestAvailableIndex;
	        }
	    }
	    
	    // sort attributes into 2d-array
	    for( i in interleave ) {
	        if( interleave[ i ] !== false ) {
	            if( attributeByIndex[ interleave[ i ]] === undefined ) {
	                attributeByIndex[ interleave[ i ]] = [];
	            }
	            attributeByIndex[ interleave[ i ]].push( attributes[ i ] );
 	        }
	    }
	    
	    // stride overflow check
	    var stride, attribute, currentLength;
 	    for( a = 0, al = attributeByIndex.length; a < al; a++ ) {
 	        if( attributeByIndex[ a ] !== undefined ) {
 	            stride = 0;
 	            for( b = 0, bl = attributeByIndex[ a ].length; b < bl; b++ ) {
 	                if( stride + attributeByIndex[ a ][ b ].size * 4 > 255 ) {
 	                    console.warn( "GLOW.Compiler.interleaveAttributes: Stride owerflow, moving attributes to new interleave index. Please check your interleave setup!" );
 	                    currentLength = attributeByIndex.length;
 	                    attributeByIndex[ currentLength ] = [];
 	                    while( b < bl ) {
 	                        attributeByIndex[ currentLength ].push( attributeByIndex[ a ][ b ] );
 	                        attributeByIndex[ a ].splice( b, 1 );
 	                        bl--;
 	                    }
 	                    continue;
 	                }
 	                stride += attributeByIndex[ a ][ b ].size * 4;
 	            }
 	        }
 	    }
 	    
 	    // create interleaved attributes
	    var name, interleavedAttributes = {};
	    for( a = 0, al = attributeByIndex.length; a < al; a++ ) {
	        if( attributeByIndex[ a ] !== undefined ) {
	            name = "";
	            for( b = 0, bl = attributeByIndex[ a ].length; b < bl; b++ ) {
	                name += b !== bl - 1 ? attributeByIndex[ a ][ b ].name + "_" : attributeByIndex[ a ][ b ].name;
	            }
	            interleavedAttributes[ name ] = new GLOW.InterleavedAttributes( attributeByIndex[ a ] );
	        }
	    }
	    
	    
	    // remove interleaved attributes from attribute object
	    for( i in interleave ) {
	        if( interleave[ i ] !== false ) {
	            delete attributes[ i ];
	        }
	    }
	    
	    return interleavedAttributes;
	}
	
	
	//--- create elements ---
	
	compiler.createElements = function( data, type, usage ) {

		var elements;

		if( data === undefined ) {
			console.error( "GLOW.Compiler.createElements: missing 'elements' in supplied data. Quitting." );
		} else if( data instanceof GLOW.Elements ) {
			elements = data;
		} else {
			if( !( data instanceof Uint16Array )) {
				data = new Uint16Array( data );
			}
			elements = new GLOW.Elements( data, type, usage !== undefined ? usage : GL.STATIC_DRAW );
		}

		return elements;
	}
	
	return compiler;
	
})();