// GLOWCore.js r1.1 - http://github.com/empaempa/GLOW
/*
* GLOW - Just-Above-Low-Level WebGL API
*/

var GLOW = (function() {
    "use strict"; "use restrict";

    var glow = {};
    var contexts = {};
    var uniqueIdCounter = -1;

    glow.currentContext = {};

    glow.registerContext = function( context ) {
        contexts[ context.id ] = context;
        glow.enableContext( context );
    };

    glow.getContextById = function( id ) {
        if( contexts[ id ] ) {
            return contexts[ id ];
        }
        console.error( "Couldn't find context id " + id + ", returning current with id " + glow.currentContext.id );
        return glow.currentContext;
    };

    glow.enableContext = function( contextOrId ) {
        if( typeof( contextOrId ) === 'string' ) {
            glow.currentContext = getContextById(contextOrId);
        } else {
            glow.currentContext = contextOrId;
        }
        GL = glow.GL = glow.currentContext.GL;
    };

    glow.uniqueId = function() {
        return ++uniqueIdCounter;
    };

    return glow;
}());

/*
* Current GL - set to latest registered or enabled GL context 
*/
var GL = {};
/*
* GLOW Context
*/

GLOW.Context = (function() {
	
	"use strict"; "use restrict";

    // constructor
    function GLOWContext( parameters ) {
    	if( parameters === undefined ) parameters = {};

    	this.id                     = parameters.id                    !== undefined ? parameters.id                    : GLOW.uniqueId();
    	this.alpha                  = parameters.alpha                 !== undefined ? parameters.alpha                 : true;
    	this.depth                  = parameters.depth                 !== undefined ? parameters.depth                 : true;
    	this.antialias              = parameters.antialias             !== undefined ? parameters.antialias             : true;
    	this.stencil                = parameters.stencil               !== undefined ? parameters.stencil               : false;
    	this.premultipliedAlpha     = parameters.premultipliedAlpha    !== undefined ? parameters.premultipliedAlpha    : true;
    	this.preserveDrawingBuffer  = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;
    	this.width                  = parameters.width                 !== undefined ? parameters.width                 : window.innerWidth;
    	this.height                 = parameters.height                !== undefined ? parameters.height                : window.innerHeight;
    	this.cache                  = new GLOW.Cache();
        this.viewport               = { x: 0, y: 0, width: 0, height: 0 };

    	if( parameters.context ) {
    	    this.GL = parameters.context;
        	GLOW.registerContext( this );
    	} else {
        	try {
        		this.domElement = document.createElement( 'canvas' );
        		this.GL         = this.domElement.getContext( 'experimental-webgl', { alpha:                 this.alpha, 
                                                                                      depth:                 this.depth, 
                                                                                      antialias:             this.antialias,
                                                                                      stencil:               this.stencil,
                                                                                      premultipliedAlpha:    this.premultipliedAlpha,
                                                                                      preserveDrawingBuffer: this.preserveDrawingBuffer } );
        		this.domElement.width  = this.width;
        		this.domElement.height = this.height;
        	} catch( error ) {
        		console.error( "GLOW.Context.construct: " + error );
        	}

        	GLOW.registerContext( this );

        	this.enableCulling( true, { frontFace: GL.CCW, cullFace: GL.BACK } );
        	this.enableDepthTest( true, { func: GL.LEQUAL, write: true, zNear: 0, zFar: 1 } );
        	this.enableBlend( false );
        	this.setupClear( { clearBits: GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT } );
        	this.setupViewport( { x: 0, y: 0, width: this.width, height: this.height } );
        	this.clear();
    	}
    }
	
	
	// methods
    GLOWContext.prototype.setupClear = function( setup ) {
    	var r = setup.red   !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : 0; 
    	var g = setup.green !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : 0; 
    	var b = setup.blue  !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : 0; 
    	var a = setup.alpha !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : 1;
    	var d = setup.depth !== undefined ? Math.min( 1, Math.max( 0, setup.depth )) : 1;

    	GL.clearColor( r, g, b, a );
    	GL.clearDepth( d );
    	this.clearBits = setup.clearBits !== undefined ? setup.clearBits : this.clearBits;
    	return this;
    };

    GLOWContext.prototype.clear = function( bits ) {
    	if( bits === undefined ) { bits = this.clearBits };
    	GL.clear( bits );
    	return this;
    };

    GLOWContext.prototype.enableBlend = function( flag, setup ) {
    	if( flag ) {
    		GL.enable( GL.BLEND );
    		if( setup ) this.setupBlend( setup );
    	} else GL.disable( GL.BLEND );
    	return this;
    };

    GLOWContext.prototype.setupBlend = function( setup ) {
    	if( setup.equationRGB ) {
			if( setup.equationAlpha ) GL.blendEquationSeparate( setup.equationRGB, setup.equationAlpha );
			if( setup.srcRGB        ) GL.blendFuncSeparate( setup.srcRGB, setup.dstRGB, setup.srcAlpha, setup.dstAlpha );
    	} else {
			if( setup.equation ) GL.blendEquation( setup.equation );
			if( setup.src      ) GL.blendFunc( setup.src, setup.dst );
    	}
    	return this;
    };

    GLOWContext.prototype.enableDepthTest = function( flag, setup ) {
    	if( flag ) {
    		GL.enable( GL.DEPTH_TEST );
    		if( setup ) this.setupDepthTest( setup );
    	} else GL.disable( GL.DEPTH_TEST );
    	return this;
    };

    GLOWContext.prototype.setupDepthTest = function( setup ) {
		if( setup.func  !== undefined ) GL.depthFunc( setup.func );
		if( setup.write !== undefined ) GL.depthMask( setup.write );
		if( setup.zNear !== undefined && setup.zFar !== undefined && setup.zNear <= setup.zFar ) {
			GL.depthRange( Math.max( 0, Math.min( 1, setup.zNear )), Math.max( 0, Math.min( 1, setup.zFar )));
		}
    	return this;
    };

    GLOWContext.prototype.enablePolygonOffset = function( flag, setup ) {
        if( flag ) {
            GL.enable( GL.POLYGON_OFFSET_FILL );
            if( setup ) this.setupPolygonOffset( setup );
        } else GL.disable( GL.POLYGON_OFFSET_FILL );
        return this;
    }
    
    GLOWContext.prototype.setupPolygonOffset = function( setup ) {
        if( setup.factor && setup.units ) GL.polygonOffset( setup.factor, setup.units );
    }

    GLOWContext.prototype.enableStencilTest = function( flag, setup ) {
    	if( flag ) {
    		GL.enable( GL.STENCIL_TEST );
    		if( setup ) this.setupStencilTest( setup );
    	} else GL.disable( GL.STENCIL_TEST );
    	return this;
    };

    GLOWContext.prototype.setupStencilTest = function( setup ) {
        if( setup.func && setup.funcFace ) {
            GL.stencilFuncSeparate( setup.funcFace, setup.func, setup.funcRef, setup.funcMask );
        } else if( setup.func ) {
            GL.stencilFunc( setup.func, setup.funcRef, setup.funcMask );
        }
        
        if( setup.mask && setup.maskFace ) {
            GL.stencilMaskSeparate( setup.maskFace, setup.mask );
        } else if( setup.mask ) {
            GL.stencilMask( setup.mask );
        }

        if( setup.opFail && setup.opFace ) {
            GL.stencilOpSeparate( setup.opFace, setup.opFail, setup.opZfail, setup.opZpass );
        } else if( setup.opFail ) {
            GL.stencilOp( setup.opFail, setup.opZfail, setup.opZpass );
        }
    	return this;
    };

    GLOWContext.prototype.enableCulling = function( flag, setup ) {
    	if( flag ) {
    		GL.enable( GL.CULL_FACE );
    		if( setup ) this.setupCulling( setup );
    	} else GL.disable( GL.CULL_FACE );
    	return this;
    };

    GLOWContext.prototype.setupCulling = function( setup ) {
    	try {
    		if( setup.frontFace ) GL.frontFace( setup.frontFace );
    		if( setup.cullFace  ) GL.cullFace ( setup.cullFace  );
    	} catch( error ) {
    		console.error( "GLOW.Context.setupCulling: " + error );
    	}
    	return this;
    };

    GLOWContext.prototype.enableScissor = function( flag, setup ) {
    	if( flag ) {
    		GL.enable( GL.SCISSOR_TEST );
    		if( setup ) this.setupScissor( setup );
    	} else {
    		GL.disable( GL.SCISSOR_TEST );
    	}
    	return this;
    };

    GLOWContext.prototype.setupScissor = function( setup ) {
        try {
            GL.scissor( setup.x, setup.y, setup.width, setup.height );
        } catch( error ) {
            console.error( "GLOW.Context.setupScissorTest: " + error );
        } 
    	return this;
    };

    GLOWContext.prototype.setViewport = function() {
        this.setupViewport();
    };

    GLOWContext.prototype.setupViewport = function( setup ) {
        if( setup ) {
        	this.viewport.x      = setup.x      !== undefined ? setup.x      : this.viewport.x;
        	this.viewport.y      = setup.y      !== undefined ? setup.y      : this.viewport.y;
        	this.viewport.width  = setup.width  !== undefined ? setup.width  : this.viewport.width;
        	this.viewport.height = setup.height !== undefined ? setup.height : this.viewport.height;
        }
    	GL.viewport( this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height );
    	return this;
    };

    GLOWContext.prototype.availableExtensions = function() {
        return GL.getSupportedExtensions();
    };
	
    GLOWContext.prototype.enableExtension = function( extensionName ) {
        var availableExtensions = GL.getSupportedExtensions();
        for( var a = 0, al = availableExtensions.length; a < al; a++ ) {
            if( extensionName.toLowerCase() === availableExtensions[ a ].toLowerCase())
                break;
        }
                
        if( a !== al ) {
            return GL.getExtension( availableExtensions[ a ] );
        } else {
            return undefined;
        }
    };
	
	return GLOWContext;
})();


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
	
})();/*
* Shader Compiled Data
* @author: Mikael Emtinger, gomo.se
*/

GLOW.CompiledData = (function() {
    
    "use strict"; "use restrict";
    
    // private data, functions and initializations here

    // constructor
    
    function GLOWCompiledData( program, uniforms, attributes, interleavedAttributes, elements, extras ) {
	    this.program = program;
	    this.uniforms = uniforms !== undefined ? uniforms : {};
	    this.attributes = attributes !== undefined ? attributes : {};
	    this.interleavedAttributes = interleavedAttributes !== undefined ? interleavedAttributes : {};
	    this.elements = elements;
	    
	    extras = extras !== undefined ? extras : {};
	    this.preDrawCallback = extras.preDrawCallback;
	    this.postDrawCallback = extras.postDrawCallback;
	    this.blend = extras.blend;
	    this.stencil = extras.stencil;
    }

    // methods
    GLOWCompiledData.prototype.clone = function( except ) {
    	var clone = new GLOW.CompiledData();
    	except = except !== undefined ? except : {};

    	var u;
    	for( u in this.uniforms ) {
    		if( except[ u ] ) {
    			clone.uniforms[ u ] = new GLOW.Uniform( this.uniforms[ u ], except[ u ] );
				if( clone.uniforms[ u ].type === GL.SAMPLER_2D || 
				    clone.uniforms[ u ].type === GL.SAMPLER_CUBE ) {
					clone.uniforms[ u ].data.init( this.uniforms[ u ].data.textureUnit );
				}
    		} else {
    			clone.uniforms[ u ] = this.uniforms[ u ];
    		}
    	}

    	var a;
    	for( a in this.attributes ) {
    		if( except[ a ] ) {
    			clone.attributes[ a ] = new GLOW.Attribute( this.attributes[ a ], except[ a ] );
    		} else {
    			clone.attributes[ a ] = this.attributes[ a ];
    		}
    	}
    	
    	var i;
    	for( i in this.interleavedAttributes ) {
    	    if( except[ i ] ) {
    	        clone.interleavedAttributes[ i ] = new GLOW.InterleavedAttributes( except[ i ] );
    	    } else {
    	        clone.interleavedAttributes[ i ] = this.interleavedAttributes[ i ];
    	    }
    	}

    	if( except.elements ) {
    		clone.elements = new GLOW.Elements( except.elements );
    	} else {
    		clone.elements = this.elements;
    	}

        if( except.program ) {
        	clone.program = except.program;
        } else {
        	clone.program = this.program;
        }
        
        if( except.blend ) {
            clone.blend = except.blend;
        } else {
            clone.blend = this.blend;
        }
        
        if( except.stencil ) {
            clone.stencil = except.stencil;
        } else {
            clone.stencil = this.stencil;
        }
        
        if( except.preDrawCallback ) {
            clone.preDrawCallback = except.preDrawCallback;
        } else {
            clone.preDrawCallback = this.preDrawCallback;
        }
        
        if( except.postDrawCallback ) {
            clone.postDrawCallback = except.postDrawCallback;
        } else {
            clone.postDrawCallback = this.postDrawCallback;
        }

    	return clone;
    };
    
    return GLOWCompiledData;
})();

/*
* Cache
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Cache = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function GLOWCache() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation = [];
        this.attributeByLocation = [];
        this.textureByLocation = [];
        this.compiledCode = [];
        this.elementId = -1;
        this.programId = -1;
        this.active = true;
    }

    // methods
    GLOWCache.prototype.codeCompiled = function( vertexShader, fragmentShader ) {
        var code, c, cl = this.compiledCode.length;
        
		for( c = 0; c < cl; c++ ) {
			code = this.compiledCode[ c ];
			if( vertexShader === code.vertexShader && fragmentShader === code.fragmentShader ) { break; }
		}
		
		if( c === cl ) {
			this.compiledCode.push( { vertexShader: vertexShader, 
				                      fragmentShader: fragmentShader } );
			return undefined;
		} else {
		    return this.compiledCode[ c ].program;
		}
    };
    
    GLOWCache.prototype.addCompiledProgram = function( program ) {
        this.compiledCode[ this.compiledCode.length - 1 ].program = program;
    }
    
    
    GLOWCache.prototype.programCached = function( program ) {
        if( this.active ) {
            if( program.id === this.programId ) return true;
            this.programId = program.id;
        }
        return false;
    };

    GLOWCache.prototype.setProgramHighestAttributeNumber = function( program ) {
        var saveHighestAttributeNumber = this.highestAttributeNumber;
        this.highestAttributeNumber = program.highestAttributeNumber;
        return program.highestAttributeNumber - saveHighestAttributeNumber;
    };

    GLOWCache.prototype.uniformCached = function( uniform ) {
        if( this.active ) {
            if( this.uniformByLocation[ uniform.locationNumber ] === uniform.id ) return true;
            this.uniformByLocation[ uniform.locationNumber ] = uniform.id;
        }
        return false;
    };
    
    GLOWCache.prototype.invalidateUniform = function( uniform ) {
        this.uniformByLocation[ uniform.locationNumber ] = undefined;
    }

    GLOWCache.prototype.attributeCached = function( attribute ) {
        if( this.active ) {
            if( this.attributeByLocation[ attribute.locationNumber ] === attribute.id ) return true;
            this.attributeByLocation[ attribute.locationNumber ] = attribute.id;
        }
        return false;
    };

    GLOWCache.prototype.invalidateAttribute = function( attribute ) {
        this.attributeByLocation[ attribute.locationNumber ] = undefined;
    }

    GLOWCache.prototype.textureCached = function( textureUnit, texture ) {
        if( this.active ) {
            if( this.textureByLocation[ textureUnit ] === texture.id ) return true;
            this.textureByLocation[ textureUnit ] = texture.id;
        }
        return false;
    };

    GLOWCache.prototype.invalidateTexture = function( textureUnit ) {
        this.textureByLocation[ textureUnit ] = undefined;
    };

    GLOWCache.prototype.elementsCached = function( elements ) {
        if( this.active ) {
            if( elements.id === this.elementId ) return true;
            this.elementId = elements.id;
        }
        return false;
    };

    GLOWCache.prototype.invalidateElements = function() {
        this.elementId = -1;
    };

    GLOWCache.prototype.clear = function() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation.length = 0;
        this.attributeByLocation.length = 0;
        this.textureByLocation.length = 0;
        this.elementId = -1;
        this.programId = -1;
    };
    
    return GLOWCache;
})();
GLOW.FBO = (function() {
    
    "use strict"; "use restrict";

    var cubeSideOffsets = { "posX":0, "negX":1, "posY":2, "negY":3, "posZ":4, "negZ":5 };

	// constructor
	function GLOWFBO( parameters ) {

    	parameters = parameters !== undefined ? parameters : {};

    	this.id            = GLOW.uniqueId();
    	this.width         = parameters.width          !== undefined ? parameters.width          : parameters.size !== undefined ? parameters.size : window.innerWidth;
    	this.height        = parameters.height         !== undefined ? parameters.height         : parameters.size !== undefined ? parameters.size : window.innerHeight;
    	var wrapS          = parameters.wrapS          !== undefined ? parameters.wrapS          : parameters.wrap !== undefined ? parameters.wrap : GL.CLAMP_TO_EDGE;
    	var wrapT          = parameters.wrapT          !== undefined ? parameters.wrapT          : parameters.wrap !== undefined ? parameters.wrap : GL.CLAMP_TO_EDGE;
    	var magFilter      = parameters.magFilter      !== undefined ? parameters.magFilter      : GL.LINEAR;
    	var minFilter      = parameters.minFilter      !== undefined ? parameters.minFilter      : GL.LINEAR;
    	var internalFormat = parameters.internalFormat !== undefined ? parameters.internalFormat : GL.RGBA;
    	var format         = parameters.format         !== undefined ? parameters.format         : GL.RGBA;
    	var type           = parameters.type           !== undefined ? parameters.type           : GL.UNSIGNED_BYTE;
    	var depth          = parameters.depth          !== undefined ? parameters.depth          : true;
    	var stencil        = parameters.stencil        !== undefined ? parameters.stencil        : false;
        var data           = parameters.data           !== undefined ? parameters.data           : null;

        this.isBound       = false;
    	this.textureUnit   = -1;
        this.textureType   = parameters.cube !== true ? GL.TEXTURE_2D : GL.TEXTURE_CUBE_MAP;
    	this.viewport      = { x: 0, y: 0, width: this.width, height: this.height };
    	this.clearSettings = { r: 0, g: 0, b: 0, a: 1, depth: 1, clearBits: 0 };
    	
    	this.clearSettings.clearBits  = GL.COLOR_BUFFER_BIT;
    	this.clearSettings.clearBits |= depth   ? GL.DEPTH_BUFFER_BIT   : 0;
        this.clearSettings.clearBits |= stencil ? GL.STENCIL_BUFFER_BIT : 0;
        this.setupClear( parameters );

    	// setup texture
    	this.texture = GL.createTexture();
    	GL.bindTexture  ( this.textureType, this.texture );
    	GL.texParameteri( this.textureType, GL.TEXTURE_WRAP_S, wrapS );
    	GL.texParameteri( this.textureType, GL.TEXTURE_WRAP_T, wrapT );
    	GL.texParameteri( this.textureType, GL.TEXTURE_MAG_FILTER, magFilter );
    	GL.texParameteri( this.textureType, GL.TEXTURE_MIN_FILTER, minFilter );

        if( this.textureType === GL.TEXTURE_2D ) {
        	GL.texImage2D( this.textureType, 0, internalFormat, this.width, this.height, 0, format, type, data );
        } else {
            for( var c in cubeSideOffsets ) {
            	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], 0, internalFormat, this.width, this.height, 0, format, type, data[ c ] );
            }
        }

        // setup render buffer
        if( depth || stencil ) {
        	this.renderBuffer = GL.createRenderbuffer();
    		GL.bindRenderbuffer( GL.RENDERBUFFER, this.renderBuffer );
    		if( depth && !stencil ) {
    			GL.renderbufferStorage( GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.width, this.height );
    		} else if( !depth && stencil ) {
    			GL.renderbufferStorage( GL.RENDERBUFFER, GL.STENCIL_INDEX8, this.width, this.height );
    		} else if( depth && stencil ) {
    			GL.renderbufferStorage( GL.RENDERBUFFER, GL.DEPTH_STENCIL, this.width, this.height );
    		}
        }


        // setup frame buffer
        if( this.textureType === GL.TEXTURE_2D ) {
        	this.frameBuffer = GL.createFramebuffer();
    		GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffer );
    		GL.framebufferTexture2D( GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.texture, 0 );

    		if( depth && !stencil ) {
    			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
    		} else if( !depth && stencil ) {
    			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
    		} else if( depth && stencil ) {
    			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
    		}
        } else {
        	this.frameBuffers = {};
        	for( var f in cubeSideOffsets ) {
        	    this.frameBuffers[ f ] = GL.createFramebuffer();
        		GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffers[ f ] );
        		GL.framebufferTexture2D( GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ f ], this.texture, 0 );

        		if( depth && !stencil ) {
        			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
        		} else if( !depth && stencil ) {
        			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
        		} else if( depth && stencil ) {
        			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
        		}
        	}
        }
    	
		// release
		GL.bindTexture( this.textureType, null );
		GL.bindRenderbuffer( GL.RENDERBUFFER, null );
		GL.bindFramebuffer( GL.FRAMEBUFFER, null);
	}

    // methods
    GLOWFBO.prototype.init = function() {
        // called from compiler but there's really nothing to do here
    };

    GLOWFBO.prototype.bind = function( setViewport, side ) {
        if( !this.isBound ) {
            this.isBound = true;
            
            if( setViewport || setViewport === undefined ) 
                this.setupViewport( setViewport );
                
            if( this.textureType === GL.TEXTURE_2D ) {
            	GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffer );
            } else {
                side = side !== undefined ? side : "posX";
            	GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffers[ side ] );
            }
        }
    	return this;
    };

    GLOWFBO.prototype.unbind = function( setViewport ) {
    	// TODO: add cache
    	if( this.isBound ) {
    	    this.isBound = false;
        	GL.bindFramebuffer( GL.FRAMEBUFFER, null );
        	
        	if( setViewport === undefined || setViewport === true )
        	    GL.viewport( GLOW.currentContext.viewport.x, GLOW.currentContext.viewport.y, GLOW.currentContext.viewport.width, GLOW.currentContext.viewport.height );
    	}
    	return this;
    };

    GLOWFBO.prototype.setViewport = function() {
        this.setupViewport();
    };

    GLOWFBO.prototype.setupViewport = function( setup ) {
        if( setup ) {
        	this.viewport.x      = setup.x      !== undefined ? setup.x      : this.viewport.x;
        	this.viewport.y      = setup.y      !== undefined ? setup.y      : this.viewport.y;
        	this.viewport.width  = setup.width  !== undefined ? setup.width  : this.viewport.width;
        	this.viewport.height = setup.height !== undefined ? setup.height : this.viewport.height;
        }
    	GL.viewport( this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height );
    	return this;
    };

    GLOWFBO.prototype.setupClear = function( setup ) {
    	if( setup !== undefined ) {
        	this.clearSettings.r         = setup.red       !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : this.clearSettings.r; 
        	this.clearSettings.g         = setup.green     !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : this.clearSettings.g; 
        	this.clearSettings.b         = setup.blue      !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : this.clearSettings.b; 
        	this.clearSettings.a         = setup.alpha     !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : this.clearSettings.a;
        	this.clearSettings.depth     = setup.depth     !== undefined ? Math.min( 1, Math.max( 0, setup.depth )) : this.clearSettings.depth;
        	this.clearSettings.clearBits = setup.clearBits !== undefined ? setup.clearBits : this.clearSettings.clearBits;
    	}

    	GL.clearColor( this.clearSettings.r, this.clearSettings.g, this.clearSettings.b, this.clearSettings.a );
    	GL.clearDepth( this.clearSettings.depth );
    	return this;
    };

    GLOWFBO.prototype.clear = function( setup ) {
        if( this.isBound ) {
            this.setupClear( setup );
        	GL.clear( this.clearSettings.clearBits );
        }
    	return this;
    };
    
    GLOWFBO.prototype.resize = function() {
    	// TODO
    	return this;
    };

    GLOWFBO.prototype.generateMipMaps = function() {
    	GL.bindTexture( this.textureType, this.texture );
    	GL.generateMipmap( this.textureType );
    	GL.bindTexture( this.textureType, null );
    	return this;
    };
    
    return GLOWFBO;
})();
GLOW.Texture = (function() {
	
	"use strict"; "use restrict";

    var cubeSideOffsets = { "posX":0, "negX":1, "posY":2, "negY":3, "posZ":4, "negZ":5 };
	
	// constructor
	function GLOWTexture( parameters ) {
        if( parameters.url !== undefined ) {
            parameters.data = parameters.url;
        }
    	
    	this.id = GLOW.uniqueId();
        this.data = parameters.data;
        this.autoUpdate = parameters.autoUpdate;
    	this.internalFormat = parameters.internalFormat !== undefined ? parameters.internalFormat : GL.RGBA;
    	this.format = parameters.format !== undefined ? parameters.format : GL.RGBA;
    	this.type = parameters.type !== undefined ? parameters.type : GL.UNSIGNED_BYTE;
    	this.wrapS = parameters.wrapS !== undefined ? parameters.wrapS : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.wrapT = parameters.wrapT !== undefined ? parameters.wrapT : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.magFilter = parameters.magFilter !== undefined ? parameters.magFilter : GL.LINEAR;
    	this.minFilter = parameters.minFilter !== undefined ? parameters.minFilter : GL.LINEAR_MIPMAP_LINEAR;
	    this.width  = parameters.width;
	    this.height = parameters.height;
    	this.texture = undefined;
	}

	// methods
    GLOWTexture.prototype.init = function() {
    	if( typeof( this.data ) === "string" ) {
        	this.textureType = GL.TEXTURE_2D;
            var originalURL  = this.data;
        	var lowerCaseURL = originalURL.toLowerCase();
        	if( lowerCaseURL.indexOf( ".jpg" ) !== -1 || 
                lowerCaseURL.indexOf( ".png" ) !== -1 ||
                lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                this.data = new Image();
    	        this.data.scope = this;
        	    this.data.onload = this.onLoadImage;
        	    this.data.src = originalURL;
            } else {
                if( this.autoUpdate === undefined ) {
                    this.autoUpdate = true;
                }
                this.data = document.createElement( "video" );
    	        this.data.scope = this;
        		this.data.addEventListener( "loadeddata", this.onLoadVideo, false );
        	    this.data.src = originalURL;
            }
    	} else if( this.data instanceof HTMLImageElement ||
    	           this.data instanceof HTMLVideoElement ||
    	           this.data instanceof HTMLCanvasElement ||
    	           this.data instanceof Uint8Array ) {
            this.textureType = GL.TEXTURE_2D;
    	    this.createTexture();
    	// cube map
    	} else {
    	    this.textureType = GL.TEXTURE_CUBE_MAP;
    	    this.itemsToLoad = 0;
    	    for( var c in cubeSideOffsets ) {
    	        if( this.data[ c ] !== undefined ) {
    	            if( typeof( this.data[ c ] ) === "string" ) {
    	                this.itemsToLoad++;
    	            }
	            } else {
	                console.error( "GLOW.Texture.init: data type error. Did you forget cube map " + c + "? If not, the data type is not supported" );
	            }
    	    }
    	    
    	    if( this.itemsToLoad === 0 ) {
    	        this.createTexture();
    	    } else {
        	    for( var c in cubeSideOffsets ) {
    	            if( typeof( this.data[ c ] ) === "string" ) {
        	            var originalURL  = this.data[ c ];
                    	var lowerCaseURL = originalURL.toLowerCase();
                    	if( lowerCaseURL.indexOf( ".jpg" ) !== -1 || 
                            lowerCaseURL.indexOf( ".png" ) !== -1 ||
                            lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                            lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                            this.data[ c ] = new Image();
                	        this.data[ c ].scope = this;
                    	    this.data[ c ].onload = this.onLoadCubeImage;
                    	    this.data[ c ].src = originalURL;
                        } else {
                            if( this.autoUpdate !== undefined ) {
                                this.autoUpdate[ c ] = this.autoUpdate[ c ] !== undefined ? this.autoUpdate[ c ] : true;
                            } else {
                                this.autoUpdate = {};
                                this.autoUpdate[ c ] = true;
                            }
                            this.data[ c ] = document.createElement( "video" );
                	        this.data[ c ].scope = this;
                    		this.data[ c ].addEventListener( "loadeddata", this.onLoadCubeVideo, false );
                    	    this.data[ c ].src = originalURL;
                        }
    	            }
        	    }
    	    }
    	}
    };
    
    GLOWTexture.prototype.createTexture = function() {
       	this.texture = GL.createTexture();
    	GL.bindTexture( this.textureType, this.texture );

    	if( this.textureType === GL.TEXTURE_2D ) {
        	if( this.data instanceof Uint8Array ) {
        	    if( this.width !== undefined && this.height !== undefined ) {
                	GL.texImage2D( this.textureType, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.data );
        	    } else {
        	        console.error( "GLOW.Texture.createTexture: Textures of type Uint8Array requires width and height parameters. Quitting." );
        	        return;
        	    }
        	} else {
            	GL.texImage2D( this.textureType, 0, this.internalFormat, this.format, this.type, this.data );
        	}
    	} else {
    	    for( var c in cubeSideOffsets ) {
    	        if( this.data[ c ] instanceof Uint8Array || this.data[ c ] instanceof Float32Array ) {
            	    if( this.width !== undefined && this.height !== undefined ) {
                    	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.data[ c ] );
            	    } else {
            	        console.error( "GLOW.Texture.createTexture: Textures of type Uint8Array/Float32Array requires width and height parameters. Quitting." );
            	        return;
            	    }
    	        } else {
                	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], 0, this.internalFormat, this.format, this.type, this.data[ c ] );
    	        }
    	    }
    	}

    	GL.texParameteri( this.textureType, GL.TEXTURE_WRAP_S, this.wrapS );
    	GL.texParameteri( this.textureType, GL.TEXTURE_WRAP_T, this.wrapT );
	    GL.texParameteri( this.textureType, GL.TEXTURE_MIN_FILTER, this.minFilter );
    	GL.texParameteri( this.textureType, GL.TEXTURE_MAG_FILTER, this.magFilter );

    	if( this.minFilter !== GL.NEAREST && this.minFilter !== GL.LINEAR ) {
    	    GL.generateMipmap( this.textureType );
	    }
    };
    
    GLOWTexture.prototype.updateTexture = function( parameters ) {
        parameters = parameters !== undefined ? parameters : {};
        
        var level = parameters.level !== undefined ? parameters.level : 0;
        var xOffset = parameters.xOffset !== undefined ? parameters.xOffset : 0;
        var yOffset = parameters.yOffset !== undefined ? parameters.yOffset : 0;
        var updateMipmap = parameters.updateMipmap !== undefined ? parameters.updateMipmap : true;
        
        if( !GLOW.currentContext.cache.textureCached( this )) {
            GL.bindTexture( this.textureType, this.texture );
        }

        if( this.textureType == GL.TEXTURE_2D ) {
            if( this.data instanceof Uint8Array ) {
                GL.texSubImage2D( this.textureType, level, xOffset, yOffset, this.width, this.height, this.format, this.type, this.data );
            } else {
                GL.texSubImage2D( this.textureType, level, xOffset, yOffset, this.format, this.type, this.data );
            }
        } else {
            for( var c in parameters ) {
                if( cubeSideOffsets[ c ] !== undefined ) {
    	            if( this.data[ c ] instanceof Uint8Array ) {
                    	GL.texSubImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], level, xOffset, yOffset, this.width, this.height, this.format, this.type, this.data[ c ] );
        	        } else { 
                	    GL.texSubImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], level, xOffset, yOffset, this.format, this.type, this.data[ c ] );
        	        }
                }
            }
        }

    	if( this.minFilter !== GL.NEAREST && this.minFilter !== GL.LINEAR && updateMipmap === true ) {
    	    GL.generateMipmap( this.textureType );
	    }
    }

    GLOWTexture.prototype.onLoadImage = function() {
    	this.scope.createTexture();
    };
    
    GLOWTexture.prototype.onLoadCubeImage = function() {
        this.scope.itemsToLoad--;
        if( this.scope.itemsToLoad === 0 ) {
            this.scope.createTexture();
        }
    }
    
    GLOWTexture.prototype.onLoadVideo = function() {
		this.removeEventListener( "loadeddata", this.scope.onLoadVideo, false );
        this.scope.createTexture();
    }

    GLOWTexture.prototype.onLoadCubeVideo = function() {
		this.removeEventListener( "loadeddata", this.scope.onLoadVideo, false );
        this.scope.itemsToLoad--;
        if( this.scope.itemsToLoad === 0 ) {
            this.scope.createTexture();
        }
    }
    
    GLOWTexture.prototype.play = function() {
        if( this.textureType === GL.TEXTURE_2D ) {
            if( this.data instanceof HTMLVideoElement ) {
                this.data.play();
            }
        } else {
            for( var c in cubeSideOffsets ) {
                if( this.data[ c ] instanceof HTMLVideoElement ) {
                    this.data[ c ].play();
                }
            }
        }
    }
    
	return GLOWTexture;
})();
/*
* Shader.js
* Parameters:
* use: GLOW.ShaderCompiledData
* except: object, holding data that should be overwritten in GLOW.ShaderCompiledData
* vertexShader: string, vertex shader code
* fragmentShader: string, fragment shader code
* data: attributes and uniforms
* elements: elements (array or UInt16Array)
*/

GLOW.Shader = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function GLOWShader( parameters ) {
        this.id = GLOW.uniqueId();
        this.compiledData = parameters.use ? parameters.use.clone( parameters.except ) : GLOW.Compiler.compile( parameters );
        this.attachData();
    }

    // methods
    GLOWShader.prototype.attachData = function() {
        var u, a, i;

        this.uniforms = this.compiledData.uniforms;
        this.elements = this.compiledData.elements;
        this.program = this.compiledData.program;

        for( u in this.compiledData.uniforms ) {
            if( this[ u ] === undefined) {
                this[ u ] = this.compiledData.uniforms[ u ].data;
            } else {
                console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on uniform " + u + ", not attaching for easy access. Please use Shader.uniforms." + u + ".data to access data." );
            }
        }

        for( a in this.compiledData.attributes ) {
            if( this.attributes === undefined ) {
                this.attributes = this.compiledData.attributes;
            }
            if( this[ a ] === undefined ) {
                this[ a ] = this.compiledData.attributes[ a ];
            } else {
                console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " + a + ", not attaching for easy access. Please use Shader.attributes." + a + ".data to access data." );
            }
        }
        
        for( i in this.compiledData.interleavedAttributes ) {
            if( this.interleavedAttributes === undefined ) {
                this.interleavedAttributes = this.compiledData.interleavedAttributes;
            }
            if( this[ i ] === undefined ) {
                this[ i ] = this.compiledData.interleavedAttributes[ i ];
            } else {
                console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on interleavedAttribute " + a + ", not attaching for easy access. Please use Shader.interleavedAttributes." + a + ".data to access data." )
            }
        }
    };

    GLOWShader.prototype.draw = function() {
        var compiledData = this.compiledData;
        var cache = GLOW.currentContext.cache;

        if( !cache.programCached( compiledData.program )) {
            GL.useProgram( compiledData.program );
            var diff = cache.setProgramHighestAttributeNumber( compiledData.program );
            if( diff ) {
                // enable / disable attribute streams
                var highestAttrib = compiledData.program.highestAttributeNumber;
                var current = highestAttrib - diff + 1;

                if( diff > 0 ) {
                    for( ; current <= highestAttrib; current++ ) {
                        GL.enableVertexAttribArray( current );
                    }
                } else {
                    for( current--; current > highestAttrib; current-- ) {
                        GL.disableVertexAttribArray( current ); 
                    }
                }
            }
        }
        
        for( var a in compiledData.attributes ) {
            if( compiledData.attributes[ a ].interleaved === false ) {
                if( !cache.attributeCached( compiledData.attributes[ a ] )) {
                    compiledData.attributes[ a ].bind();
                }
            }
        }

        for( var a in compiledData.interleavedAttributes ) {
            compiledData.interleavedAttributes[ a ].bind();
        }
        
        for( var u in compiledData.uniforms ) {
            if( !cache.uniformCached( compiledData.uniforms[ u ] )) {
                compiledData.uniforms[ u ].load();
            }
        }

        if( compiledData.preDrawCallback ) compiledData.preDrawCallback( this );
        
        compiledData.elements.draw();

        if( compiledData.postDrawCallback ) compiledData.postDrawCallback( this );
    };

    GLOWShader.prototype.clone = function(except) {
        return new GLOW.Shader( { use: this.compiledData, except: except } );
    };

    GLOWShader.prototype.dispose = function() {
        // TODO
    };

    return GLOWShader;
})();



/*
* GLOW.Elements
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Elements = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function GLOWElements( data, type, usage ) {
        this.id = GLOW.uniqueId();
        this.elements = GL.createBuffer();
        this.length = data.length;
        this.type = type !== undefined ? type : GL.TRIANGLES;

        GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
        GL.bufferData( GL.ELEMENT_ARRAY_BUFFER, data, usage ? usage : GL.STATIC_DRAW );
    }

    // methods
    GLOWElements.prototype.draw = function() {
        if( !GLOW.currentContext.cache.elementsCached( this )) {
             GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.elements );
        }
        GL.drawElements( this.type, this.length, GL.UNSIGNED_SHORT, 0 );
    };
    
    GLOWElements.prototype.dispose = function() {
        // TODO
    };
    

    return GLOWElements;
})();
GLOW.Uniform = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here
    var once = false;
    var setFunctions = [];

    function lazyInit() {
        setFunctions[ GL.INT ] = function() { GL.uniform1iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT ] = function() { GL.uniform1fv( this.location, this.getNativeValue()); };
        setFunctions[ GL.INT_VEC2 ] = function() { GL.uniform2iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.INT_VEC3 ] = function() { GL.uniform3iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.INT_VEC4 ] = function() { GL.uniform4iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_VEC2 ] = function() { GL.uniform2fv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_VEC3 ] = function() { GL.uniform3fv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_VEC4 ] = function() { GL.uniform4fv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_MAT2 ] = function() { GL.uniformMatrix2fv( this.location, false, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_MAT3 ] = function() { GL.uniformMatrix3fv( this.location, false, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_MAT4 ] = function() { GL.uniformMatrix4fv( this.location, false, this.getNativeValue()); };
        setFunctions[ GL.SAMPLER_2D ] = function() {
            if( this.data.texture !== undefined && this.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached( this.textureUnit, this.data )) {
                GL.uniform1i( this.location, this.textureUnit );
                GL.activeTexture( GL.TEXTURE0 + this.textureUnit );
                GL.bindTexture( GL.TEXTURE_2D, this.data.texture );
                if( this.data.autoUpdate ) {
                    this.data.updateTexture( this.data.autoUpdate );
                }
            }
        };
        setFunctions[ GL.SAMPLER_CUBE ] = function() {
            if( this.data.texture !== undefined && this.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached( this.textureUnit, this.data )) {
                GL.uniform1i( this.location, this.textureUnit );
                GL.activeTexture( GL.TEXTURE0 + this.textureUnit );
                GL.bindTexture( GL.TEXTURE_CUBE_MAP, this.data.texture );
                if( this.data.autoUpdate ) {
                    this.data.updateTexture( this.data.autoUpdate );
                }
            }
        };
    }

    // constructor
    function GLOWUniform( parameters, data ) {
        if( !once ) {
            once = true;
            lazyInit();
        }

        this.id = GLOW.uniqueId();
        this.data = data;
        this.name = parameters.name;
        this.length = parameters.length;
        this.type = parameters.type;
        this.location = parameters.location;
        this.locationNumber = parameters.locationNumber;
        this.textureUnit = -1;
        this.load = parameters.loadFunction || setFunctions[ this.type ];
    }

    // methods
    // default data converter
    GLOWUniform.prototype.getNativeValue = function() {
        return this.data.value;
    };

    return GLOWUniform;
})();
GLOW.Attribute = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here
    var once = false;
    var sizes = [];
    function lazyInit() {
        // lazy initialization so we know we got GL bound to a context
        sizes[GL.INT] = 1;
        sizes[GL.INT_VEC2] = 2;
        sizes[GL.INT_VEC3] = 3;
        sizes[GL.INT_VEC4] = 4;
        sizes[GL.FLOAT] = 1;
        sizes[GL.FLOAT_VEC2] = 2;
        sizes[GL.FLOAT_VEC3] = 3;
        sizes[GL.FLOAT_VEC4] = 4;
        sizes[GL.FLOAT_MAT2] = 4;
        sizes[GL.FLOAT_MAT3] = 9;
        sizes[GL.FLOAT_MAT4] = 16;
    }

    // constructor
    function GLOWAttribute( parameters, data, usage, interleaved ) {
        if( !once ) {
            once = true;
            lazyInit();
        }

        this.id = GLOW.uniqueId();
        this.data = data;
        this.location = parameters.location;
        this.locationNumber = parameters.locationNumber;
        this.stride = 0;
        this.offset = 0;
        this.usage = usage !== undefined ? usage : GL.STATIC_DRAW;
        this.interleaved = interleaved !== undefined ? interleaved : false;
        this.size = sizes[ parameters.type ];
        this.name = parameters.name;
        this.type = parameters.type;

        if( this.interleaved === false ) {
            if( this.data instanceof Float32Array ) {
                this.bufferData( this.data, this.usage );
            } else {
                console.error( "GLOW.Attribute.constructor: Data for attribute " + this.name + " not in Float32Array format. Please fix. Quitting." );
            }
        }
    }

    // methods
    GLOWAttribute.prototype.setupInterleave = function( offset, stride ) {
        this.interleaved = true;
        this.offset = offset;
        this.stride = stride;
    };

    GLOWAttribute.prototype.bufferData = function( data, usage ) {
        if( data !== undefined && this.data !== data ) this.data = data;
        if( usage !== undefined && this.usage !== usage ) this.usage = usage;
        if( this.buffer === undefined ) this.buffer = GL.createBuffer();
        
        GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
        GL.bufferData( GL.ARRAY_BUFFER, this.data, this.usage );
    };

    GLOWAttribute.prototype.bind = function() {
        if( this.interleaved === false ) {
            GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
        }
        GL.vertexAttribPointer( this.location, this.size, GL.FLOAT, false, this.stride, this.offset );
    };
    
    GLOWAttribute.prototype.clone = function( except ) {
        if( this.interleaved ) {
            console.error( "GLOW.Attribute.clone: Cannot clone interleaved attribute. Please check your interleave setup." );
            return;
        }
        
        var clone = new GLOW.Attribute( this, this.data, this.usage, this.interleaved )
    }
    
    GLOWAttribute.prototype.dispose = function() {
        // TODO
    }

    return GLOWAttribute;
})();
GLOW.InterleavedAttributes = (function() {
    "use strict"; "use restrict";

    // constructor
    function GLOWInterleavedAttributes( attributes ) {
        this.id = GLOW.uniqueId();
        this.attributes = attributes;
        
        // interleave data from the attributes
        var l, ll = attributes[ 0 ].data.length / attributes[ 0 ].size;
        var a, al = attributes.length;
        var b, bl;
        var i, indices = [];
        var attributeData, interleavedData = [];
        
        for( a = 0; a < al; a++ ) {
            indices[ a ] = 0;
        }
        
        for( l = 0; l < ll; l++ ) {
            for( a = 0; a < al; a++ ) {
                attributeData = attributes[ a ].data;
                i = indices[ a ];
                for( b = 0, bl = attributes[ a ].size; b < bl; b++ ) {
                    interleavedData.push( attributeData[ i++ ] );
                }
                indices[ a ] = i;
            }
        }
        this.data = new Float32Array( interleavedData );

        // match usage from the attributes
        this.usage = attributes[ 0 ].usage;
        for( a = 0; a < al; a++ ) {
            if( this.usage !== attributes[ a ].usage ) {
                console.warn( "GLOW.InterleavedAttributes.construct: Attribute " + attributes[ a ].name + " has different usage, defaulting to STATIC_DRAW." );
                this.usage = GL.STATIC_DRAW;
                break;
            }
        }
 
        this.bufferData( this.data, this.usage );
        
        
        // setup stride and offset for each attribute
        var stride = 0;
        for( a = 0; a < al; a++ ) {
            stride += attributes[ a ].size * 4;
        }
        
        var currentOffset = 0;
        for( a = 0; a < al; a++ ) {
            attributes[ a ].setupInterleave( currentOffset, stride );
            currentOffset += attributes[ a ].size * 4;
        }
    }
    
    // methods
    GLOWInterleavedAttributes.prototype.bufferData = function( data, usage ) {
        if( data !== undefined && this.data !== data ) this.data = data;
        if( this.buffer === undefined ) this.buffer = GL.createBuffer();

        GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
        GL.bufferData( GL.ARRAY_BUFFER, this.data, usage ? usage : GL.STATIC_DRAW );
    };

    GLOWInterleavedAttributes.prototype.bind = function() {
        GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
        
        var a, al = this.attributes.length;
        for( a = 0; a < al; a++ ) {
            this.attributes[ a ].bind();
        }
    };
    
    
    return GLOWInterleavedAttributes;
})();