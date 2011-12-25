// GLOW.js r1.1 - http://github.com/empaempa/GLOW
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
        	} catch( error ) {
        		console.error( "GLOW.Context.construct: " + error );
        	}

            if( this.GL !== null ) {
            	GLOW.registerContext( this );

        		this.domElement.width  = this.width;
        		this.domElement.height = this.height;

            	if( parameters.viewport ) {
            	    this.viewport = {
            	        x:      parameters.viewport.x      !== undefined ? parameters.viewport.x      : 0,
            	        y:      parameters.viewport.y      !== undefined ? parameters.viewport.y      : 0,
            	        width:  parameters.viewport.width  !== undefined ? parameters.viewport.width  : this.width,
            	        height: parameters.viewport.height !== undefined ? parameters.viewport.height : this.height
            	    }
            	} else {
                	this.viewport = { x: 0, y: 0, width: this.width, height: this.height };
            	}

            	if( parameters.clear ) {
            	    this.clearSettings = {
            	        r:     parameters.clear.red   !== undefined ? parameters.clear.red   : 0,
            	        g:     parameters.clear.green !== undefined ? parameters.clear.green : 0,
            	        b:     parameters.clear.blue  !== undefined ? parameters.clear.blue  : 0,
            	        a:     parameters.clear.alpha !== undefined ? parameters.clear.alpha : 1,
            	        depth: parameters.clear.depth !== undefined ? parameters.clear.depth : 1,
            	        bits:  parameters.clear.bits  !== undefined ? parameters.clear.bits  : -1
        	        }

        	        if( this.clearSettings.bits === -1 ) {
                    	this.clearSettings.bits  = GL.COLOR_BUFFER_BIT;
                    	this.clearSettings.bits |= this.depth   ? GL.DEPTH_BUFFER_BIT   : 0;
                        this.clearSettings.bits |= this.stencil ? GL.STENCIL_BUFFER_BIT : 0;
        	        }
            	} else {
                	this.clearSettings = { r: 0, g: 0, b: 0, a: 1, depth: 1, bits: 0 };
                	this.clearSettings.bits  = GL.COLOR_BUFFER_BIT;
                	this.clearSettings.bits |= this.depth   ? GL.DEPTH_BUFFER_BIT   : 0;
                    this.clearSettings.bits |= this.stencil ? GL.STENCIL_BUFFER_BIT : 0;
            	}

            	this.enableCulling( true, { frontFace: GL.CCW, cullFace: GL.BACK } );
            	this.enableDepthTest( true, { func: GL.LEQUAL, write: true, zNear: 0, zFar: 1 } );
            	this.enableBlend( false );
            	this.setViewport();
            	this.clear();
            } else {
                console.error( "GLOW.Context.construct: unable to initialize WebGL" );
            }
    	}
    }
	
	
	// methods
	
    GLOWContext.prototype.setupClear = function( setup ) {
    	if( setup !== undefined ) {
        	this.clearSettings.r     = setup.red   !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : this.clearSettings.r; 
        	this.clearSettings.g     = setup.green !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : this.clearSettings.g; 
        	this.clearSettings.b     = setup.blue  !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : this.clearSettings.b; 
        	this.clearSettings.a     = setup.alpha !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : this.clearSettings.a;
        	this.clearSettings.depth = setup.depth !== undefined ? Math.min( 1, Math.max( 0, setup.depth )) : this.clearSettings.depth;
        	this.clearSettings.bits  = setup.bits  !== undefined ? setup.bits : this.clearSettings.bits;
    	}

    	GL.clearColor( this.clearSettings.r, this.clearSettings.g, this.clearSettings.b, this.clearSettings.a );
    	GL.clearDepth( this.clearSettings.depth );
    	return this;
    };

    GLOWContext.prototype.clear = function( setup ) {
        this.setupClear( setup );
        GL.clear( this.clearSettings.bits );
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
    
    GLOWContext.prototype.getParameter = function( parameter ) {
        return GL.getParameter( parameter );
    };
    
    GLOWContext.prototype.maxVertexTextureImageUnits = function() {
        return this.getParameter( GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
    }
	
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
				console.warn( "GLOW.Compiler.createAttributes: missing data for attribute " + name );
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
					clone.uniforms[ u ].data.init();
					clone.uniforms[ u ].textureUnit = this.uniforms[ u ].textureUnit; 
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
// This really needs some cleaning up... somehow.
//    	        clone.interleavedAttributes[ i ] = new GLOW.InterleavedAttributes( except[ i ] );
    	        clone.interleavedAttributes[ i ] = except[ i ];
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
    	
    	if( parameters.viewport ) {
    	    this.viewport = {
    	        x:      parameters.viewport.x      !== undefined ? parameters.viewport.x      : 0,
    	        y:      parameters.viewport.y      !== undefined ? parameters.viewport.y      : 0,
    	        width:  parameters.viewport.width  !== undefined ? parameters.viewport.width  : this.width,
    	        height: parameters.viewport.height !== undefined ? parameters.viewport.height : this.height
    	    }
    	} else {
        	this.viewport = { x: 0, y: 0, width: this.width, height: this.height };
    	}
    	
    	if( parameters.clear ) {
    	    this.clearSettings = {
    	        r:     parameters.clear.red   !== undefined ? parameters.clear.red   : 0,
    	        g:     parameters.clear.green !== undefined ? parameters.clear.green : 0,
    	        b:     parameters.clear.blue  !== undefined ? parameters.clear.blue  : 0,
    	        a:     parameters.clear.alpha !== undefined ? parameters.clear.alpha : 1,
    	        depth: parameters.clear.depth !== undefined ? parameters.clear.depth : 1,
    	        bits:  parameters.clear.bits  !== undefined ? parameters.clear.bits  : -1
	        }
	        
	        if( this.clearSettings.bits === -1 ) {
            	this.clearSettings.bits  = GL.COLOR_BUFFER_BIT;
            	this.clearSettings.bits |= depth   ? GL.DEPTH_BUFFER_BIT   : 0;
                this.clearSettings.bits |= stencil ? GL.STENCIL_BUFFER_BIT : 0;
	        }
    	} else {
        	this.clearSettings = { r: 0, g: 0, b: 0, a: 1, depth: 1, bits: 0 };
        	this.clearSettings.bits  = GL.COLOR_BUFFER_BIT;
        	this.clearSettings.bits |= depth   ? GL.DEPTH_BUFFER_BIT   : 0;
            this.clearSettings.bits |= stencil ? GL.STENCIL_BUFFER_BIT : 0;
    	}

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
        	this.clearSettings.r     = setup.red   !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : this.clearSettings.r; 
        	this.clearSettings.g     = setup.green !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : this.clearSettings.g; 
        	this.clearSettings.b     = setup.blue  !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : this.clearSettings.b; 
        	this.clearSettings.a     = setup.alpha !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : this.clearSettings.a;
        	this.clearSettings.depth = setup.depth !== undefined ? Math.min( 1, Math.max( 0, setup.depth )) : this.clearSettings.depth;
        	this.clearSettings.bits  = setup.bits  !== undefined ? setup.bits : this.clearSettings.bits;
    	}

    	GL.clearColor( this.clearSettings.r, this.clearSettings.g, this.clearSettings.b, this.clearSettings.a );
    	GL.clearDepth( this.clearSettings.depth );
    	return this;
    };

    GLOWFBO.prototype.clear = function( setup ) {
        if( this.isBound ) {
            this.setupClear( setup );
        	GL.clear( this.clearSettings.bits );
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
        if( this.data === undefined && 
            this.width !== undefined && 
            this.height !== undefined ) {
                
            if( this.type === GL.UNSIGNED_BYTE ) 
                this.data = new Uint8Array( this.width * this.height * ( this.format === GL.RGBA ? 4 : 3 ));
            else
                this.data = new Float32Array( this.width * this.height * ( this.format === GL.RGBA ? 4 : 3 ));
            
        } else if( typeof( this.data ) === "string" ) {
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
    	           this.data instanceof Uint8Array ||
    	           this.data instanceof Float32Array ) {
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
        
        GL.bindTexture( this.textureType, this.texture );

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

        if( compiledData.preDrawCallback ) compiledData.preDrawCallback( this );
        
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
    function GLOWElements( data, type, usage, offset ) {
        this.id = GLOW.uniqueId();
        this.type = type !== undefined ? type : GL.TRIANGLES;
        this.offset = offset !== undefined ? offset : 0;

        if( typeof( data ) === "number" ) {
            this.length = data;
        } else {
    		if( !( data instanceof Uint16Array )) {
    			data = new Uint16Array( data );
    		}

            this.length = data.length;
            this.elements = GL.createBuffer();
            GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
            GL.bufferData( GL.ELEMENT_ARRAY_BUFFER, data, usage ? usage : GL.STATIC_DRAW );
        }
    }

    // methods
    GLOWElements.prototype.draw = function() {
        if( this.elements !== undefined ) {
            if( !GLOW.currentContext.cache.elementsCached( this )) {
                 GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.elements );
            }
            GL.drawElements( this.type, this.length, GL.UNSIGNED_SHORT, this.offset );
        } else {
            GL.drawArrays( this.type, this.offset, this.length );
        }
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

        if( this.data.length / this.size > 65536 ) {
            console.warn( "GLOW.Attribute.constructor: Unreachable attribute. Elements cannot reach attribute data beyond index 65535. Please split into several shaders." );
        }

        if( this.data.constructor.toString().indexOf( " Array()") !== -1 ) {
            this.data = new Float32Array( this.data );
        }

        if( this.interleaved === false ) {
            this.bufferData( this.data, this.usage );
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
})();/*
* GLOW.Float
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Float = (function() {
	
	"use strict";
	
    // constructor
	function float( value ) {
    	this.value = new Float32Array( 1 );
    	this.value[ 0 ] = value !== undefined ? value : 0;
	}

    // methods
    float.prototype.set = function( value ) {
        this.value[ 0 ] = value;
        return this;
    }

    float.prototype.add = function( value ) {
        this.value[ 0 ] += value;
        return this;
    }

    float.prototype.sub = function( value ) {
        this.value[ 0 ] -= value;
        return this;
    }

    float.prototype.multiply = function( value ) {
        this.value[ 0 ] *= value;
        return this;
    }

    float.prototype.divide = function( value ) {
        this.value[ 0 ] /= value;
        return this;
    }

    float.prototype.modulo = function( value ) {
        this.value[ 0 ] %= value;
        return this;
    }
    
	return float;
})();
/*
* GLOW.Int
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Int = function( value ) {

	"use strict";
	
    // constructor
	function int( value ) {
    	this.value = new int32Array( 1 );
    	this.value[ 0 ] = value !== undefined ? value : 0;
	}

    // methods
    int.prototype.set = function( value ) {
        this.value[ 0 ] = value;
        return this;
    }

    int.prototype.add = function( value ) {
        this.value[ 0 ] += value;
        return this;
    }

    int.prototype.sub = function( value ) {
        this.value[ 0 ] -= value;
        return this;
    }

    int.prototype.multiply = function( value ) {
        this.value[ 0 ] *= value;
        return this;
    }

    int.prototype.divide = function( value ) {
        this.value[ 0 ] /= value;
        return this;
    }

    int.prototype.modulo = function( value ) {
        this.value[ 0 ] %= value;
        return this;
    }
    	
	return int;
}
/**
 * GLOW.Vector2 Based upon THREE.Vector2 by
 * @author mr.doob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 */

GLOW.Vector2 = (function() {

    "use strict"; "use restrict";

    // constructor
    function vector2( x, y ) {
        this.value = new Float32Array( 2 );
        this.value[ 0 ] = x !== undefined ? x : 0;
        this.value[ 1 ] = y !== undefined ? y : 0;
    }


    // methods
	vector2.prototype.set = function ( x, y ) {
		this.value[ 0 ] = x;
		this.value[ 1 ] = y;
		return this;
	};

	vector2.prototype.copy = function ( v ) {
		this.value[ 0 ] = v.value[ 0 ];
		this.value[ 1 ] = v.value[ 1 ];
		return this;
	};

	vector2.prototype.addSelf = function ( v ) {
	    this.value[ 0 ] += v.value[ 0 ];
	    this.value[ 1 ] += v.value[ 1 ];
		return this;
	};

	vector2.prototype.add = function ( v1, v2 ) {
	    this.value[ 0 ] = v1.value[ 0 ] + v2.value[ 0 ];
	    this.value[ 1 ] = v1.value[ 1 ] + v2.value[ 1 ];
		return this;
	};

	vector2.prototype.subSelf = function ( v ) {
		this.value[ 0 ] -= v.x,
		this.value[ 1 ] -= v.y
		return this;
	};

	vector2.prototype.sub = function ( v1, v2 ) {
	    this.value[ 0 ] = v1.value[ 0 ] - v2.value[ 0 ];
	    this.value[ 1 ] = v1.value[ 1 ] - v2.value[ 1 ];
		return this;
	};

	vector2.prototype.multiplySelf = function ( v ) {
	    this.value[ 0 ] *= v.value[ 0 ];
	    this.value[ 1 ] *= v.value[ 1 ];
		return this;
	};

	vector2.prototype.multiply = function ( v1, v2 ) {
	    this.value[ 0 ] = v1.value[ 0 ] * v2.value[ 0 ];
	    this.value[ 1 ] = v1.value[ 1 ] * v2.value[ 1 ];
		return this;
	};

	vector2.prototype.multiplyScalar = function ( s ) {
		this.value[ 0 ] *= s;
		this.value[ 1 ] *= s;
		return this;
	},

	vector2.prototype.negate = function() {
		this.value[ 0 ] = -this.value[ 0 ];
		this.value[ 1 ] = -this.value[ 1 ];
		return this;
	},

	vector2.prototype.normalize = function () {
		this.multiplyScalar( 1 / this.length() );
		return this;
	};

	vector2.prototype.length = function () {
		return Math.sqrt( this.lengthSq() );
	};

	vector2.prototype.lengthSq = function () {
		return this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ];
	};

	vector2.prototype.clone = function () {
		return new GLOW.Vector2( this.value[ 0 ], this.value[ 1 ] );
	};

    return vector2;
})();

/**
 * GLOW.Vector3 Based upon THREE.Vector3 by
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Vector3 = (function( x, y, z ) {

	"use strict"; "use restrict";

    // constructor
    function vector3( x, y, z ) {
    	this.value = new Float32Array( 3 );
    	this.value[ 0 ] = x !== undefined ? x : 0;
    	this.value[ 1 ] = y !== undefined ? y : 0;
    	this.value[ 2 ] = z !== undefined ? z : 0;
    }

    // methods
    vector3.prototype.set = function( x, y, z ) {
    	this.value[ 0 ] = x;
    	this.value[ 1 ] = y;
    	this.value[ 2 ] = z;
    	return this;
    }

    vector3.prototype.copy = function ( v ) {
    	this.set( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );
    	return this;
    }

    vector3.prototype.add = function ( a, b ) {
    	a = a.value;
    	b = b.value;
    	this.value[ 0 ] = a[ 0 ] + b[ 0 ];
    	this.value[ 1 ] = a[ 1 ] + b[ 1 ];
    	this.value[ 2 ] = a[ 2 ] + b[ 2 ];
    	return this;
    }

    vector3.prototype.addSelf = function ( a ) {
    	a = a.value;
    	this.value[ 0 ] = this.value[ 0 ] + a[ 0 ];
    	this.value[ 1 ] = this.value[ 1 ] + a[ 1 ];
    	this.value[ 2 ] = this.value[ 2 ] + a[ 2 ];
    	return this;
    }

    vector3.prototype.addScalar = function ( s ) {
    	this.value[ 0 ] += s;
    	this.value[ 1 ] += s;
    	this.value[ 2 ] += s;
    	return this;
    }


    vector3.prototype.sub = function ( a, b ) {
    	a = a.value;
    	b = b.value;
    	this.value[ 0 ] = a[ 0 ] - b[ 0 ];
    	this.value[ 1 ] = a[ 1 ] - b[ 1 ];
    	this.value[ 2 ] = a[ 2 ] - b[ 2 ];
    	return this;
    }

    vector3.prototype.subSelf = function ( a ) {
    	a = a.value;
    	this.value[ 0 ] -= a[ 0 ];
    	this.value[ 1 ] -= a[ 1 ];
    	this.value[ 2 ] -= a[ 2 ];
    	return this;
    }

    vector3.prototype.cross = function ( a, b ) {
    	a = a.value;
    	b = b.value;
    	this.value[ 0 ] = a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ];
    	this.value[ 1 ] = a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ];
    	this.value[ 2 ] = a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ];
    	return this;
    }

    vector3.prototype.crossSelf = function ( a ) {
    	a = a.value;
    	var ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ];
    	var vx = this.value[ 0 ], vy = this.value[ 1 ], vz = this.value[ 2 ];
    	this.value[ 0 ] = ay * vz - az * vy;
    	this.value[ 1 ] = az * vx - ax * vz;
    	this.value[ 2 ] = ax * vy - ay * vx;
    	return this;
    }

    vector3.prototype.multiply = function( a, b ) {
    	a = a.value;
    	b = b.value;
    	this.value[ 0 ] = a[ 0 ] * b[ 0 ];
    	this.value[ 1 ] = a[ 1 ] * b[ 1 ];
    	this.value[ 2 ] = a[ 2 ] * b[ 2 ];
    	return this;
    }

    vector3.prototype.multiplySelf = function( a ) {
    	a = a.value;
    	this.value[ 0 ] *= a[ 0 ];
    	this.value[ 1 ] *= a[ 1 ];
    	this.value[ 2 ] *= a[ 2 ];
    	return this;
    }

    vector3.prototype.multiplyScalar = function( s ) {
    	this.value[ 0 ] *= s;
    	this.value[ 1 ] *= s;
    	this.value[ 2 ] *= s;
    	return this;
    }

    vector3.prototype.divideSelf = function( a ) {
    	a = a.value;
    	this.value[ 0 ] /= a[ 0 ];
    	this.value[ 1 ] /= a[ 1 ];
    	this.value[ 2 ] /= a[ 2 ];
    	return this;
    }

    vector3.prototype.divideScalar = function( s ) {
    	this.value[ 0 ] /= s;
    	this.value[ 1 ] /= s;
    	this.value[ 2 ] /= s;
    	return this;
    }

    vector3.prototype.negate = function() {
    	this.value[ 0 ] = -this.value[ 0 ];
    	this.value[ 1 ] = -this.value[ 1 ];
    	this.value[ 2 ] = -this.value[ 2 ];
    	return this;
    }

    vector3.prototype.dot = function( a ) {
    	a = a.value;
    	return this.value[ 0 ] * a[ 0 ] + this.value[ 1 ] * a[ 1 ] + this.value[ 2 ] * a[ 2 ];
    }

    vector3.prototype.distanceTo = function ( a ) {
    	return Math.sqrt( this.distanceToSquared( a ) );
    }

    vector3.prototype.distanceToSquared = function( a ) {
    	a = a.value;
    	var dx = this.value[ 0 ] - a[ 0 ], dy = this.value[ 1 ] - a[ 1 ], dz = this.value[ 2 ] - a[ 2 ];
    	return dx * dx + dy * dy + dz * dz;
    }

    vector3.prototype.length = function() {
    	return Math.sqrt( this.lengthSq() );
    }

    vector3.prototype.lengthSq = function() {
    	return this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ];
    }

    vector3.prototype.lengthManhattan = function() {
    	return this.value[ 0 ] + this.value[ 1 ] + this.value[ 2 ];
    }

    vector3.prototype.normalize = function() {
    	var l = Math.sqrt( this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ] );
    	l > 0 ? this.multiplyScalar( 1 / l ) : this.set( 0, 0, 0 );
    	return this;
    }

    vector3.prototype.setPositionFromMatrix = function( m ) {
    	m = m.value;
    	this.value[ 0 ] = m[ 12 ];
    	this.value[ 1 ] = m[ 13 ];
    	this.value[ 2 ] = m[ 14 ];
    }

    vector3.prototype.setLength = function( l ) {
    	return this.normalize().multiplyScalar( l );
    }

    vector3.prototype.isZero = function() {
    	var almostZero = 0.0001;
    	return ( Math.abs( this.value[ 0 ] ) < almostZero ) && ( Math.abs( this.value[ 1 ] ) < almostZero ) && ( Math.abs( this.value[ 2 ] ) < almostZero );
    }

    vector3.prototype.clone = function() {
    	return GLOW.Vector3( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );
    }

    return vector3;
})();
/**
 * GLOW.Vector3 Based upon THREE.Vector3 by
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Vector4 = (function() {

    "use strict"; "use restrict";
    
    // constructor
    function vector4( x, y, z, w ) {
        this.value = new Float32Array( 4 );
        this.value[ 0 ] = x !== undefined ? x : 0;
        this.value[ 1 ] = y !== undefined ? y : 0;
        this.value[ 2 ] = z !== undefined ? z : 0;
        this.value[ 3 ] = w !== undefined ? w : 0;
    }
    
    // methods
	vector4.prototype.set = function ( x, y, z, w ) {
		this.value[ 0 ] = x;
		this.value[ 1 ] = y;
		this.value[ 2 ] = z;
		this.value[ 3 ] = w;
		return this;
	};

	vector4.prototype.copy = function ( v ) {
		this.value[ 0 ] = v.value[ 0 ];
		this.value[ 1 ] = v.value[ 1 ];
		this.value[ 2 ] = v.value[ 2 ];
		this.value[ 3 ] = v.value[ 3 ];
		return this;
	};

	vector4.prototype.add = function ( v1, v2 ) {
		this.value[ 0 ] = v1.value[ 0 ] + v2.value[ 0 ];
		this.value[ 1 ] = v1.value[ 1 ] + v2.value[ 1 ];
		this.value[ 2 ] = v1.value[ 2 ] + v2.value[ 2 ];
		this.value[ 3 ] = v1.value[ 3 ] + v2.value[ 3 ];
		return this;
	};

	vector4.prototype.addSelf = function ( v ) {
		this.value[ 0 ] += v.value[ 0 ];
		this.value[ 1 ] += v.value[ 1 ];
		this.value[ 2 ] += v.value[ 2 ];
		this.value[ 3 ] += v.value[ 3 ];
		return this;
	};

	vector4.prototype.sub = function ( v1, v2 ) {
		this.value[ 0 ] = v1.value[ 0 ] - v2.value[ 0 ];
		this.value[ 1 ] = v1.value[ 1 ] - v2.value[ 1 ];
		this.value[ 2 ] = v1.value[ 2 ] - v2.value[ 2 ];
		this.value[ 3 ] = v1.value[ 3 ] - v2.value[ 3 ];
		return this;
	};

	vector4.prototype.subSelf = function ( v ) {
		this.value[ 0 ] -= v.value[ 0 ];
		this.value[ 1 ] -= v.value[ 1 ];
		this.value[ 2 ] -= v.value[ 2 ];
		this.value[ 3 ] -= v.value[ 3 ];
		return this;
	};

	vector4.prototype.multiplyScalar = function ( s ) {
		this.value[ 0 ] *= s;
		this.value[ 1 ] *= s;
		this.value[ 2 ] *= s;
		this.value[ 3 ] *= s;
		return this;
	};

	vector4.prototype.divideScalar = function ( s ) {
		this.value[ 0 ] /= s;
		this.value[ 1 ] /= s;
		this.value[ 2 ] /= s;
		this.value[ 3 ] /= s;
		return this;
	};

	vector4.prototype.lerpSelf = function ( v, alpha ) {
		this.value[ 0 ] += (v.x - this.value[ 0 ]) * alpha;
		this.value[ 1 ] += (v.y - this.value[ 1 ]) * alpha;
		this.value[ 2 ] += (v.z - this.value[ 2 ]) * alpha;
		this.value[ 3 ] += (v.w - this.value[ 3 ]) * alpha;
	    return this;
	};

	vector4.prototype.clone = function () {
		return new GLOW.Vector4( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ], this.value[ 3 ] );
	};

    return vector4;
})();
/*
* GLOW.Matrix3
* Based upon THREE.Matrix3 by @mr.doob
*/

GLOW.Matrix3 = (function() {

	"use strict"; "use restrict";

    // constructor
    function matrix3() {
    	this.value = new Float32Array( 9 );
    	this.identity();
    }

    // methods
    matrix3.prototype.set = function( m11, m12, m13, m21, m22, m23, m31, m32, m33 ) {
    	this.value[ 0 ] = m11; this.value[ 4 ] = m12; this.value[ 8 ] = m13;
    	this.value[ 1 ] = m21; this.value[ 5 ] = m22; this.value[ 9 ] = m23;
    	this.value[ 2 ] = m31; this.value[ 6 ] = m32; this.value[ 10 ] = m33;
    	return this;
    }

    matrix3.prototype.identity = function () {
    	this.set( 1, 0, 0, 0, 1, 0, 0, 0, 1	);
    	return this;
    }
    
    matrix3.prototype.getValueAsFloat32Array = function() {
        this.float32Array[ 0 ] = this.value[ 0 ];
        this.float32Array[ 1 ] = this.value[ 1 ];
        this.float32Array[ 2 ] = this.value[ 2 ];
        this.float32Array[ 3 ] = this.value[ 3 ];
        this.float32Array[ 4 ] = this.value[ 4 ];
        this.float32Array[ 5 ] = this.value[ 5 ];
        this.float32Array[ 6 ] = this.value[ 6 ];
        this.float32Array[ 7 ] = this.value[ 7 ];
        this.float32Array[ 8 ] = this.value[ 8 ];
        return this.float32Array;
    }

    return matrix3;
})();


/**
 * GLOW.Matrix4. Based upon THREE.Matrix4 by:
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Matrix4 = (function() {

	"use strict"; "use restrict"

    //constructor
    function matrix4() {
    	this.value = new Float32Array( 16 );
    	this.rotation = new GLOW.Vector3();
    	this.position = new GLOW.Vector3();
    	this.columnX  = new GLOW.Vector3();
    	this.columnY  = new GLOW.Vector3();
    	this.columnZ  = new GLOW.Vector3();
    	this.identity();
    }


    // methods
    matrix4.prototype.set = function( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ) {
    	this.value[ 0 ] = m11; this.value[ 4 ] = m12; this.value[ 8 ] = m13; this.value[ 12 ] = m14;
    	this.value[ 1 ] = m21; this.value[ 5 ] = m22; this.value[ 9 ] = m23; this.value[ 13 ] = m24;
    	this.value[ 2 ] = m31; this.value[ 6 ] = m32; this.value[ 10 ] = m33; this.value[ 14 ] = m34;
    	this.value[ 3 ] = m41; this.value[ 7 ] = m42; this.value[ 11 ] = m43; this.value[ 15 ] = m44;
    	return this;
    }

    matrix4.prototype.identity = function () {
    	this.set( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );
    	return this;
    }

    matrix4.prototype.copy = function( a ) {
    	a = a.value;
    	this.set(
    		a[ 0 ], a[ 4 ], a[ 8  ], a[ 12 ],
    		a[ 1 ], a[ 5 ], a[ 9  ], a[ 13 ],
    		a[ 2 ], a[ 6 ], a[ 10 ], a[ 14 ],
    		a[ 3 ], a[ 7 ], a[ 11 ], a[ 15 ]
    	);
    	return this;
    }

    matrix4.prototype.lookAt = function( focus, up ) {
    	var x = GLOW.Matrix4.tempVector3A, 
    	    y = GLOW.Matrix4.tempVector3B, 
    	    z = GLOW.Matrix4.tempVector3C;
    	var eye = this.getPosition();	

    	eye.value[ 0 ] = this.value[ 12 ];
    	eye.value[ 1 ] = this.value[ 13 ];
    	eye.value[ 2 ] = this.value[ 14 ];

    	z.sub( eye, focus ).normalize();

    	if( z.length() === 0 ) {
    		z.value[ 3 ] = 1;
    	}

    	x.cross( up, z ).normalize();

    	if( x.length() === 0 ) {
    		z.value[ 0 ] += 0.0001;
    		x.cross( up, z ).normalize();
    	}

    	y.cross( z, x ).normalize();

    	x = x.value;
    	y = y.value;
    	z = z.value;

    	this.value[ 0 ] = x[ 0 ]; this.value[ 4 ] = y[ 0 ]; this.value[  8 ] = z[ 0 ];
    	this.value[ 1 ] = x[ 1 ]; this.value[ 5 ] = y[ 1 ]; this.value[  9 ] = z[ 1 ];
    	this.value[ 2 ] = x[ 2 ]; this.value[ 6 ] = y[ 2 ]; this.value[ 10 ] = z[ 2 ];

    	return this;
    }

    matrix4.prototype.multiplyVector3 = function ( v ) {
  	    var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ],
    	d = 1 / ( this.value[ 3 ] * vx + this.value[ 7 ] * vy + this.value[ 11 ] * vz + this.value[ 15 ] );

    	v.value[ 0 ] = ( this.value[ 0 ] * vx + this.value[ 4 ] * vy + this.value[ 8 ] * vz + this.value[ 12 ] ) * d;
    	v.value[ 1 ] = ( this.value[ 1 ] * vx + this.value[ 5 ] * vy + this.value[ 9 ] * vz + this.value[ 13 ] ) * d;
    	v.value[ 2 ] = ( this.value[ 2 ] * vx + this.value[ 6 ] * vy + this.value[ 10 ] * vz + this.value[ 14 ] ) * d;
    	return v;
    }

    matrix4.prototype.multiplyVector4 = function ( v ) {
    	var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ], vw = v.value[ 3 ];
    	v.value[ 0 ] = this.value[ 0 ] * vx + this.value[ 4 ] * vy + this.value[ 8 ] * vz + this.value[ 12 ] * vw;
    	v.value[ 1 ] = this.value[ 1 ] * vx + this.value[ 5 ] * vy + this.value[ 9 ] * vz + this.value[ 13 ] * vw;
    	v.value[ 2 ] = this.value[ 2 ] * vx + this.value[ 6 ] * vy + this.value[ 10 ] * vz + this.value[ 14 ] * vw;
    	v.value[ 3 ] = this.value[ 3 ] * vx + this.value[ 7 ] * vy + this.value[ 11 ] * vz + this.value[ 15 ] * vw;

    	return v;
    }

    matrix4.prototype.rotateAxis = function ( v ) {
    	var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ];
    	v.value[ 0 ] = vx * this.value[ 0 ] + vy * this.value[ 4 ] + vz * this.value[ 8 ];
    	v.value[ 1 ] = vx * this.value[ 1 ] + vy * this.value[ 5 ] + vz * this.value[ 9 ];
    	v.value[ 2 ] = vx * this.value[ 2 ] + vy * this.value[ 6 ] + vz * this.value[ 10 ];
    	v.normalize();
    	return v;
    }

    matrix4.prototype.crossVector = function ( a ) {
    	var v = GLOW.Vector4();
    	var ax = a.value[ 0 ], ay = a.value[ 1 ], az = a.value[ 2 ], aw = a.value[ 3 ];
    	v.value[ 0 ] = this.value[ 0 ] * ax + this.value[ 4 ] * ay + this.value[ 8 ] * az + this.value[ 12 ] * aw;
    	v.value[ 1 ] = this.value[ 1 ] * ax + this.value[ 5 ] * ay + this.value[ 9 ] * az + this.value[ 13 ] * aw;
    	v.value[ 2 ] = this.value[ 2 ] * ax + this.value[ 6 ] * ay + this.value[ 10 ] * az + this.value[ 14 ] * aw;
    	v.value[ 3 ] = ( aw ) ? this.value[ 3 ] * ax + this.value[ 7 ] * ay + this.value[ 11 ] * az + this.value[ 15 ] * aw : 1;
    	return v;
    }

    matrix4.prototype.multiply = function ( a, b ) {
    	a = a.value;
    	b = b.value;
    	var a11 = a[ 0 ], a12 = a[ 4 ], a13 = a[ 8 ], a14 = a[ 12 ],
    	    a21 = a[ 1 ], a22 = a[ 5 ], a23 = a[ 9 ], a24 = a[ 13 ],
    	    a31 = a[ 2 ], a32 = a[ 6 ], a33 = a[ 10 ], a34 = a[ 14 ],
    	    a41 = a[ 3 ], a42 = a[ 7 ], a43 = a[ 11 ], a44 = a[ 15 ],
    	b11 = b[ 0 ], b12 = b[ 4 ], b13 = b[ 8 ], b14 = b[ 12 ],
    	b21 = b[ 1 ], b22 = b[ 5 ], b23 = b[ 9 ], b24 = b[ 13 ],
    	b31 = b[ 2 ], b32 = b[ 6 ], b33 = b[ 10 ], b34 = b[ 14 ],
    	b41 = b[ 3 ], b42 = b[ 7 ], b43 = b[ 11 ], b44 = b[ 15 ];
    	this.value[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
    	this.value[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32;
    	this.value[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33;
    	this.value[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14;
    	this.value[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
    	this.value[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32;
    	this.value[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33;
    	this.value[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24;
    	this.value[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
    	this.value[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32;
    	this.value[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33;
    	this.value[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34;
    	this.value[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31;
    	this.value[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32;
    	this.value[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33;
    	this.value[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44;
    	return this;
    }

    matrix4.prototype.multiplySelf = function ( a ) {
    	this.multiply( m, a );
    	return this;
    }

    matrix4.prototype.multiplyScalar = function ( s ) {
    	this.value[ 0 ] *= s; this.value[ 4 ] *= s; this.value[ 8 ] *= s; this.value[ 12 ] *= s;
    	this.value[ 1 ] *= s; this.value[ 5 ] *= s; this.value[ 9 ] *= s; this.value[ 13 ] *= s;
    	this.value[ 2 ] *= s; this.value[ 6 ] *= s; this.value[ 10 ] *= s; this.value[ 14 ] *= s;
    	this.value[ 3 ] *= s; this.value[ 7 ] *= s; this.value[ 11 ] *= s; this.value[ 15 ] *= s;
    	return this;
    }

    matrix4.prototype.determinant = function () {
    	var n11 = this.value[ 0 ], n12 = this.value[ 4 ], n13 = this.value[ 8 ], n14 = this.value[ 12 ],
    	n21 = this.value[ 1 ], n22 = this.value[ 5 ], n23 = this.value[ 9 ], n24 = this.value[ 13 ],
    	n31 = this.value[ 2 ], n32 = this.value[ 6 ], n33 = this.value[ 10 ], n34 = this.value[ 14 ],
    	n41 = this.value[ 3 ], n42 = this.value[ 7 ], n43 = this.value[ 11 ], n44 = this.value[ 15 ];
    	return (
    		n14 * n23 * n32 * n41-
    		n13 * n24 * n32 * n41-
    		n14 * n22 * n33 * n41+
    		n12 * n24 * n33 * n41+
    		n13 * n22 * n34 * n41-
    		n12 * n23 * n34 * n41-
    		n14 * n23 * n31 * n42+
    		n13 * n24 * n31 * n42+
    		n14 * n21 * n33 * n42-
    		n11 * n24 * n33 * n42-
    		n13 * n21 * n34 * n42+
    		n11 * n23 * n34 * n42+
    		n14 * n22 * n31 * n43-
    		n12 * n24 * n31 * n43-
    		n14 * n21 * n32 * n43+
    		n11 * n24 * n32 * n43+
    		n12 * n21 * n34 * n43-
    		n11 * n22 * n34 * n43-
    		n13 * n22 * n31 * n44+
    		n12 * n23 * n31 * n44+
    		n13 * n21 * n32 * n44-
    		n11 * n23 * n32 * n44-
    		n12 * n21 * n33 * n44+
    		n11 * n22 * n33 * n44
    	);
    }

    matrix4.prototype.transpose = function () {
    	var tmp;
    	tmp = this.value[ 1 ]; this.value[ 1 ] = this.value[ 4 ]; this.value[ 4 ] = tmp;
    	tmp = this.value[ 2 ]; this.value[ 2 ] = this.value[ 8 ]; this.value[ 8 ] = tmp;
    	tmp = this.value[ 6 ]; this.value[ 6 ] = this.value[ 9 ]; this.value[ 9 ] = tmp;
    	tmp = this.value[ 3 ]; this.value[ 3 ] = this.value[ 12 ]; this.value[ 12 ] = tmp;
    	tmp = this.value[ 7 ]; this.value[ 7 ] = this.value[ 13 ]; this.value[ 13 ] = tmp;
    	tmp = this.value[ 11 ]; this.value[ 11 ] = this.value[ 14 ]; this.value[ 11 ] = tmp;
    	return this;
    }

    matrix4.prototype.clone = function () {
    	var clone = new GLOW.Matrix4();
    	clone.value = new Float32Array( this.value );
    	return clone;
    }


    matrix4.prototype.setPosition = function( x, y, z ) {
    	this.value[ 12 ] = x;
    	this.value[ 13 ] = y;
    	this.value[ 14 ] = z;
    	return this;
    }

    matrix4.prototype.addPosition = function( x, y, z ) {
    	this.value[ 12 ] += x;
    	this.value[ 13 ] += y;
    	this.value[ 14 ] += z;
    }

    matrix4.prototype.setRotation = function( x, y, z ) {
    	this.rotation.set( x, y, z );
    	var a = Math.cos( x ), b = Math.sin( x ),
    	    c = Math.cos( y ), d = Math.sin( y ),
    	    e = Math.cos( z ), f = Math.sin( z ),
    	    ad = a * d, bd = b * d;
    	this.value[ 0 ] = c * e;
    	this.value[ 4 ] = - c * f;
    	this.value[ 8 ] = d;
    	this.value[ 1 ] = bd * e + a * f;
    	this.value[ 5 ] = - bd * f + a * e;
    	this.value[ 9 ] = - b * c;
    	this.value[ 2 ] = - ad * e + b * f;
    	this.value[ 6 ] = ad * f + b * e;
    	this.value[ 10 ] = a * c;
    	return this;
    }

    matrix4.prototype.addRotation = function( x, y, z ) {
    	this.rotation.value[ 0 ] += x;
    	this.rotation.value[ 1 ] += y;
    	this.rotation.value[ 2 ] += z;
    	this.setRotation( this.rotation.value[ 0 ], this.rotation.value[ 1 ], this.rotation.value[ 2 ] );
    }

    matrix4.prototype.getPosition = function() {
    	this.position.set( this.value[ 12 ], this.value[ 13 ], this.value[ 14 ] );
    	return this.position;
    }

    matrix4.prototype.getColumnX = function() {
    	this.columnX.set( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );
    	return this.columnX;
    }

    matrix4.prototype.getColumnY = function() {
    	this.columnY.set( this.value[ 4 ], this.value[ 5 ], this.value[ 6 ] );
    	return this.columnY;
    }

    matrix4.prototype.getColumnZ = function() {
    	this.columnZ.set( this.value[ 8 ], this.value[ 9 ], this.value[ 10 ] );
    	return this.columnZ;
    }

    matrix4.prototype.scale = function( v, y, z ) {
    	var x;
    	if( y !== undefined && z !== undefined ) {
    		x = v;
    	} else {
    		x = v.value[ 0 ];
    		y = v.value[ 1 ];
    		z = v.value[ 2 ];
    	}

    	this.value[ 0 ] *= x; this.value[ 4 ] *= y; this.value[ 8 ] *= z;
    	this.value[ 1 ] *= x; this.value[ 5 ] *= y; this.value[ 9 ] *= z;
    	this.value[ 2 ] *= x; this.value[ 6 ] *= y; this.value[ 10 ] *= z;
    	this.value[ 3 ] *= x; this.value[ 7 ] *= y; this.value[ 11 ] *= z;
    	return this;
    }

    return matrix4;
})();





/*
* Helpers
*/

GLOW.Matrix4.makeInverse = function ( m1, m2 ) {

	// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

	if( m2 === undefined ) m2 = new GLOW.Matrix4();

	var m1v = m1.value;
	var m2v = m2.value;

	var n11 = m1v[ 0 ], n12 = m1v[ 4 ], n13 = m1v[ 8  ], n14 = m1v[ 12 ],
	    n21 = m1v[ 1 ], n22 = m1v[ 5 ], n23 = m1v[ 9  ], n24 = m1v[ 13 ],
	    n31 = m1v[ 2 ], n32 = m1v[ 6 ], n33 = m1v[ 10 ], n34 = m1v[ 14 ],
	    n41 = m1v[ 3 ], n42 = m1v[ 7 ], n43 = m1v[ 11 ], n44 = m1v[ 15 ];

	m2v[ 0  ] = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
	m2v[ 1  ] = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
	m2v[ 2  ] = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
	m2v[ 3  ] = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
	m2v[ 4  ] = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
	m2v[ 5  ] = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
	m2v[ 6  ] = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
	m2v[ 7  ] = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
	m2v[ 8  ] = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
	m2v[ 9  ] = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
	m2v[ 10 ] = n13*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
	m2v[ 11 ] = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
	m2v[ 12 ] = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
	m2v[ 13 ] = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
	m2v[ 14 ] = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
	m2v[ 15 ] = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;
	
	m2.multiplyScalar( 1 / m1.determinant());

	return m2;

};

/*THREE.Matrix4.makeInvert3x3 = function ( m1 ) {

	// input:  THREE.Matrix4, output: THREE.Matrix3
	// ( based on http://code.google.com/p/webgl-mjs/ )

	var m33 = m1.m33, m33m = m33.m,
	a11 =   m1.n33 * m1.n22 - m1.n32 * m1.n23,
	a21 = - m1.n33 * m1.n21 + m1.n31 * m1.n23,
	a31 =   m1.n32 * m1.n21 - m1.n31 * m1.n22,
	a12 = - m1.n33 * m1.n12 + m1.n32 * m1.n13,
	a22 =   m1.n33 * m1.n11 - m1.n31 * m1.n13,
	a32 = - m1.n32 * m1.n11 + m1.n31 * m1.n12,
	a13 =   m1.n23 * m1.n12 - m1.n22 * m1.n13,
	a23 = - m1.n23 * m1.n11 + m1.n21 * m1.n13,
	a33 =   m1.n22 * m1.n11 - m1.n21 * m1.n12,

	det = m1.n11 * a11 + m1.n21 * a12 + m1.n31 * a13,

	idet;

	// no inverse
	if (det == 0) {
		throw "matrix not invertible";
	}
	
	idet = 1.0 / det;

	m33this.value[ 0 ] = idet * a11; m33this.value[ 1 ] = idet * a21; m33this.value[ 2 ] = idet * a31;
	m33this.value[ 3 ] = idet * a12; m33this.value[ 4 ] = idet * a22; m33this.value[ 5 ] = idet * a32;
	m33this.value[ 6 ] = idet * a13; m33this.value[ 7 ] = idet * a23; m33this.value[ 8 ] = idet * a33;

	return m33;

}
*/

GLOW.Matrix4.makeFrustum = function ( left, right, bottom, top, near, far ) {

	var m, mv, x, y, a, b, c, d;

	m = new GLOW.Matrix4();
	x = 2 * near / ( right - left );
	y = 2 * near / ( top - bottom );
	a = ( right + left ) / ( right - left );
	b = ( top + bottom ) / ( top - bottom );
	c = - ( far + near ) / ( far - near );
	d = - 2 * far * near / ( far - near );

	mv = m.value;
	mv[ 0 ] = x;  mv[ 4 ] = 0;  mv[ 8  ] = a;   mv[ 12 ] = 0;
	mv[ 1 ] = 0;  mv[ 5 ] = y;  mv[ 9  ] = b;   mv[ 13 ] = 0;
	mv[ 2 ] = 0;  mv[ 6 ] = 0;  mv[ 10 ] = c;   mv[ 14 ] = d;
	mv[ 3 ] = 0;  mv[ 7 ] = 0;  mv[ 11 ] = - 1; mv[ 15 ] = 0;

	return m;

};

GLOW.Matrix4.makeProjection = function ( fov, aspect, near, far ) {

	var ymax, ymin, xmin, xmax;

	ymax = near * Math.tan( fov * Math.PI / 360 );
	ymin = - ymax;
	xmin = ymin * aspect;
	xmax = ymax * aspect;

	return GLOW.Matrix4.makeFrustum( xmin, xmax, ymin, ymax, near, far );

};

GLOW.Matrix4.makeOrtho = function( left, right, top, bottom, near, far ) {

	var m, mv, x, y, z, w, h, p;

	m = new GLOW.Matrix4();
	w = right - left;
	h = top - bottom;
	p = far - near;
	x = ( right + left ) / w;
	y = ( top + bottom ) / h;
	z = ( far + near ) / p;

	mv = m.value;

	mv[ 0 ] = 2 / w; mv[ 4 ] = 0;     mv[ 8  ] = 0;      mv[ 12 ] = -x;
	mv[ 1 ] = 0;     mv[ 5 ] = 2 / h; mv[ 9  ] = 0;      mv[ 13 ] = -y;
	mv[ 2 ] = 0;     mv[ 6 ] = 0;     mv[ 10 ] = -2 / p; mv[ 14 ] = -z;
	mv[ 3 ] = 0;     mv[ 7 ] = 0;     mv[ 11 ] = 0;      mv[ 15 ] = 1;

	return m;

};


GLOW.Matrix4.tempVector3A = new GLOW.Vector3();
GLOW.Matrix4.tempVector3B = new GLOW.Vector3();
GLOW.Matrix4.tempVector3C = new GLOW.Vector3();
GLOW.Matrix4.tempVector3D = new GLOW.Vector3();
GLOW.Geometry = {
	
	randomVector3Array: function( amount, factor ) {
		factor = factor !== undefined ? factor : 1;
		
		var a, array = [];
		var doubleFactor = factor * 2;
		for( a = 0; a < amount; a++ ) {
			array.push( GLOW.Vector3( Math.random() * doubleFactor - factor, 
									  Math.random() * doubleFactor - factor, 
									  Math.random() * doubleFactor - factor ));
		}
		return array;
	},
	
	randomArray: function( length, base, factor, repeat ) {
	    var array = [];
	    var value = 0;
	    var r, l;
	    for( l = 0; l < length / repeat; l++ ) {
	        value = base + Math.random() * factor;
	        for( r = 0; r < repeat; r++ ) {
	            array.push( value );
	        }
	    }
	    return array;
	},
	
	triangles: function( amount ) {
	    return this.elements( amount );
	},
	
	elements: function( amount ) {
		var i = 0, a, array = new Uint16Array( amount * 3 );
		for( a = 0; a < amount; a++ ) {
			array[ i ] = i++;
			array[ i ] = i++;
			array[ i ] = i++;
		}
		return array;
	},
	
	faceNormals: function( vertices, elements ) {
		var normals = new Float32Array( vertices.length );
		var e, el = elements.length;
		var a, b, c;
		var av = new GLOW.Vector3();
		var bv = new GLOW.Vector3();
		var cv = new GLOW.Vector3();
		var nv = new GLOW.Vector3();
		for( e = 0; e < el; ) {
			
			a = elements[ e++ ] * 3;
			b = elements[ e++ ] * 3;
			c = elements[ e++ ] * 3;
			
			av.set( vertices[ a + 0 ], vertices[ a + 1 ], vertices[ a + 2 ] );
			bv.set( vertices[ b + 0 ], vertices[ b + 1 ], vertices[ b + 2 ] );
			cv.set( vertices[ c + 0 ], vertices[ c + 1 ], vertices[ c + 2 ] );
			
			bv.subSelf( av );
			cv.subSelf( av );
			
			nv.cross( cv, bv ).normalize();
			
			normals[ a + 0 ] = nv.value[ 0 ]; normals[ a + 1 ] = nv.value[ 1 ]; normals[ a + 2 ] = nv.value[ 2 ];
			normals[ b + 0 ] = nv.value[ 0 ]; normals[ b + 1 ] = nv.value[ 1 ]; normals[ b + 2 ] = nv.value[ 2 ];
			normals[ c + 0 ] = nv.value[ 0 ]; normals[ c + 1 ] = nv.value[ 1 ]; normals[ c + 2 ] = nv.value[ 2 ];
		}

		return normals;
	},
	
	/*
	* Flatshade a shader config object
	* shaderConfig:
	*   .triangles: vertex shaded triangles
	*   .data.xyz: attribute arrays
	* attributeSizes:
	*   .xyz: size of attribute (2 for vec2, 3 for vec3 etc.)
	*
	* Please note that attribute data need to be 
	* untyped array (ordinary Arrray, not Float32Array for example)
	*/
	
	flatShade: function( shaderConfig, attributeSizes ) {
	    
	    if( shaderConfig.triangles === undefined || 
	        shaderConfig.data      === undefined ) {
	        console.error( "GLOW.Geometry.flatShade: missing .data and/or .triangles in shader config object. Quitting." );
	        return;
	    }
	    
	    if( attributeSizes === undefined ) {
	        console.error( "GLOW.Geometry.flatShade: missing attribute data sizes. Quitting." );
	        return;
	    }
	    
	    var triangles = shaderConfig.triangles;
	    var numTriangles =  triangles.length / 3;
	    var vertexShadedData = shaderConfig.data;
	    var flatShadedTriangles = [];
	    var flatShadedData, vertexShadedAttribute, size;
	    var d, i, il, n, nl;
	    
	    for( d in attributeSizes ) {
	        if( vertexShadedData[ d ] ) {
    	        vertexShadedAttribute = vertexShadedData[ d ];
    	        flatShadedAttribute   = [];
    	        size                  = attributeSizes[ d ];

                for( i = 0, il = numTriangles * 3; i < il; i++ ) {
                    for( n = 0, nl = size; n < nl; n++ ) {
                        flatShadedAttribute.push( vertexShadedAttribute[ triangles[ i ] * size + n ] );
                    }
                }

        	    vertexShadedAttribute.length = 0;
        	    for( i = 0, il = flatShadedAttribute.length; i < il; i++ ) 
        	        vertexShadedAttribute[ i ] = flatShadedAttribute[ i ];
	        }
	    }
	    
	    for( i = 0, il = numTriangles, n = 0; i < il; i++ ) {
	        flatShadedTriangles[ n ] = n++;
	        flatShadedTriangles[ n ] = n++;
	        flatShadedTriangles[ n ] = n++;
	    }
	    
	    shaderConfig.triangles = flatShadedTriangles;
	}
}

GLOW.Geometry.Cube = {
	
	vertices: function( size ) {

		var a = new Float32Array( 6 * 4 * 3 );
		var i = 0;

		size = size !== undefined ? size * 0.5 : 5;

		// front

		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 

		// back

		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 

		// left

		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 

		// right

		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 

		// up

		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 

		// down

		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 

		return a;
	},

	elements: function() {

		var a = new Uint16Array( 6 * 2 * 3 );
		var i = 0;

		a[ i++ ] = 0; a[ i++ ] = 1; a[ i++ ] = 2;
		a[ i++ ] = 0; a[ i++ ] = 2; a[ i++ ] = 3;

		a[ i++ ] = 4; a[ i++ ] = 5; a[ i++ ] = 6;
		a[ i++ ] = 4; a[ i++ ] = 6; a[ i++ ] = 7;

		a[ i++ ] = 8; a[ i++ ] = 9; a[ i++ ] = 10;
		a[ i++ ] = 8; a[ i++ ] = 10; a[ i++ ] = 11;

		a[ i++ ] = 12; a[ i++ ] = 13; a[ i++ ] = 14;
		a[ i++ ] = 12; a[ i++ ] = 14; a[ i++ ] = 15;

		a[ i++ ] = 16; a[ i++ ] = 17; a[ i++ ] = 18;
		a[ i++ ] = 16; a[ i++ ] = 18; a[ i++ ] = 19;

		a[ i++ ] = 20; a[ i++ ] = 21; a[ i++ ] = 22;
		a[ i++ ] = 20; a[ i++ ] = 22; a[ i++ ] = 23;

		return a;
	},
	
	uvs: function() {
		
		var a = new Float32Array( 6 * 4 * 2 );
		var i = 0;
		
		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;
		
		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;

		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;

		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;
		
		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;

		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 0; a[ i++ ] = 0;

		return a;
	}
}


GLOW.Geometry.Plane = {
	
	vertices: function( size ) {

		var a = new Float32Array( 4 * 3 );
		var i = 0;

		size = size !== undefined ? size * 0.5 : 1.0;

		// front

		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = 0; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = 0; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = 0; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = 0; 

		return a;
	},

	elements: function() {

		var a = new Uint16Array( 2 * 3 );
		var i = 0;

		a[ i++ ] = 0; a[ i++ ] = 1; a[ i++ ] = 2;
		a[ i++ ] = 0; a[ i++ ] = 2; a[ i++ ] = 3;

		return a;
	},
	
	uvs: function() {
		
		var a = new Float32Array( 4 * 2 );
		var i = 0;
		
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 0; a[ i++ ] = 1;
		a[ i++ ] = 0; a[ i++ ] = 0;
		
		return a;
	}
}/*
* GLOW.Node
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Node = function( shader ) {
	
	"use strict";
	
	this.localMatrix  = new GLOW.Matrix4();
	this.globalMatrix = new GLOW.Matrix4();
	this.viewMatrix   = new GLOW.Matrix4();
	
	this.useXYZStyleTransform = false;
	this.position = { x: 0, y: 0, z: 0 };
	this.rotation = { x: 0, y: 0, z: 0 };
	this.scale    = { x: 1, y: 1, z: 1 };

	this.children = [];
	this.parent   = undefined;
	
	if( shader ) {
		this.shader = shader;
		this.draw = shader.draw;
	}
}

/* 
* Prototype
*/ 

GLOW.Node.prototype.update = function( parentGlobalMatrix, cameraInverseMatrix ) {
	
	if( this.useXYZStyleTransform ) {
		
		this.localMatrix.setPosition( this.position.x, this.position.y, this.position.z );
		this.localMatrix.setRotation( this.rotation.x, this.rotation.y, this.rotation.z );
		this.localMatrix.scale( this.scale.x, this.scale.y, this.scale.z );
	}
	
	if( parentGlobalMatrix ) {

		this.globalMatrix.multiply( parentGlobalMatrix, this.localMatrix );

	} else {

		this.globalMatrix.copy( this.localMatrix );
	}
	
	
	if( cameraInverseMatrix ) {
		
		this.viewMatrix.multiply( cameraInverseMatrix, this.globalMatrix );
	}
	

	var c, cl = this.children.length;

	for( c = 0; c < cl; c++ ) {
		
		this.children[ c ].update( this.globalMatrix, cameraInverseMatrix );
	}
	
	return this;
}

GLOW.Node.prototype.addChild = function( child ) {
	
	if( this.children.indexOf( child ) === -1 ) {
		
		this.children.push( child );
		
		if( child.parent ) {
			
			child.parent.removeChild( child );
		}
		
		child.parent = this;
	}
	
	return this;
}


GLOW.Node.prototype.removeChild = function( child ) {
	
	var index = this.children.indexOf( child );
	
	if( index !== -1 ) {
		
		this.children.splice( 1, index );
		child.parent = undefined;
	}
	
	return this;
}

/*
* GLOW.Camera
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Camera = function( parameters ) {

	"use strict";
	GLOW.Node.call( this );

	parameters = parameters !== undefined ? parameters : {};

	var fov    = parameters.fov    !== undefined ? parameters.fov    : 40;
	var aspect = parameters.aspect !== undefined ? parameters.aspect : window.innerWidth / window.innerHeight;
	var near   = parameters.near   !== undefined ? parameters.near   : 0.1;
	var far    = parameters.far    !== undefined ? parameters.far    : 10000;

	this.useTarget  = parameters.useTarget !== undefined ? parameters.useTarget : true;
	
	if( parameters.ortho !== undefined )
	    this.projection = GLOW.Matrix4.makeOrtho( parameters.ortho.left, parameters.ortho.right, parameters.ortho.top, parameters.ortho.bottom, near, far );
	else
	    this.projection = GLOW.Matrix4.makeProjection( fov, aspect, near, far );

	this.inverse    = new GLOW.Matrix4();
	this.target     = new GLOW.Vector3( 0, 0, -100 );
	this.up         = new GLOW.Vector3( 0, 1, 0 );
	
	this.update();
}

/*
* Prototype
*/

GLOW.Camera.prototype = new GLOW.Node();
GLOW.Camera.prototype.constructor = GLOW.Camera;
GLOW.Camera.prototype.supr = GLOW.Node.prototype;

GLOW.Camera.prototype.update = function( parentGlobalMatrix, cameraInverseMatrix ) {

	if( this.useXYZStyleTransform ) {
		this.localMatrix.setPosition( this.position.x, this.position.y, this.position.z );

		if( this.useTarget ) {
			this.localMatrix.lookAt( this.target, this.up );
		} else {
			this.localMatrix.setRotation( this.rotation.x, this.rotation.y, this.rotation.z );
		}
		
		this.localMatrix.scale( this.scale.x, this.scale.y, this.scale.z );
	} else if( this.useTarget ) {
		this.localMatrix.lookAt( this.target, this.up );
	}
	
	if( parentGlobalMatrix ) {
		this.globalMatrix.multiply( parentGlobalMatrix, this.localMatrix );
	} else {
		this.globalMatrix.copy( this.localMatrix );
	}
	
	GLOW.Matrix4.makeInverse( this.globalMatrix, this.inverse );

	var c, cl = this.children.length;

	for( c = 0; c < cl; c++ ) {
		this.children[ c ].update( this.globalMatrix, cameraInverseMatrix );
	}
}



/*
* Create default camera
*/

GLOW.defaultCamera = new GLOW.Camera();

GLOW.ShaderUtils = {
	
	/*
	* Creates multiple shaders if element indices exceed 65535 (Uint16Array)
	* Note that the method used is quite stupid and just splits so each
	* element get their own attribute - sharing of attributes is no more
	* after this, thus potentially taking up more memory than before
	*/

	createMultiple: function( originalShaderConfig, attributeSizes ) {

        if( originalShaderConfig.triangles === undefined ||
            originalShaderConfig.data      === undefined ) {
	        console.error( "GLOW.ShaderUtils.createMultiple: missing .data and/or .triangles in shader config object. Quitting." );
	        return;
        }

        var triangles, originalTriangles = originalShaderConfig.triangles;
        var data, originalData = originalShaderConfig.data;
        var except, excepts = [];
        var originalAttribute, newAttribute;
        var t, s, n, nl, ii, i = 0, il = originalTriangles.length;
        
        
        do {
//            shaderConfigs.push( shaderConfig = {} );
//            if( originalShaderConfig.interleave !== undefined ) shaderConfig.interleave = originalShaderConfig.interleave;
//            if( originalShaderConfig.usage      !== undefined ) shaderConfig.usage      = originalShaderConfig.usage;

            excepts.push( except = { elements: [] } );
            triangles = except.elements;
            
            for( s in attributeSizes ) {
                if( originalData[ s ] ) {
                    except[ s ] = [];
                } else {
    	            console.error( "GLOW.ShaderUtils.createMultiple: attribute " + d + " doesn't exist in originalShaderConfig.data. Quitting." );
    	            return;
                }
            }
            
            for( t = 0; i < il; i += 3 ) {
                if( t > 65536 - 3 ) {
                    i -= 3;
                    break;
                }

                triangles[ t ] = t++;
                triangles[ t ] = t++;
                triangles[ t ] = t++;

        	    for( s in attributeSizes ) {
        	        originalAttribute = originalData[ s ];
        	        newAttribute      = except[ s ];
        	        size              = attributeSizes[ s ];

                    for( ii = 0; ii < 3; ii++ ) {
                        for( n = 0, nl = size; n < nl; n++ ) {
                            except[ s ].push( originalAttribute[ originalTriangles[ i + ii ] * size + n ] );
                        }
                    }
        	    }
            }
        } while( i < il );
        
        // create first shader...
        
        for( s in attributeSizes )
            originalShaderConfig.data[ s ] = excepts[ 0 ][ s ];
    
        originalShaderConfig.triangles = excepts[ 0 ].elements;
  
        var shader  = new GLOW.Shader( originalShaderConfig );
        var shaders = [ shader ];
        var attributes;
        var interleavedAttributes;
        
        // ...then clone it

        for( i = 1; i < excepts.length; i++ ) {
            for( s in attributeSizes )
                originalShaderConfig.data[ s ] = excepts[ i ][ s ];
                
    		attributes            = GLOW.Compiler.createAttributes( GLOW.Compiler.extractAttributes( shader.compiledData.program ), originalShaderConfig.data, originalShaderConfig.usage, originalShaderConfig.interleave );
    		interleavedAttributes = GLOW.Compiler.interleaveAttributes( attributes, originalShaderConfig.interleave );

            for( n in interleavedAttributes )
                excepts[ i ][ n ] = interleavedAttributes[ n ];

            shaders[ i ] = shader.clone( excepts[ i ] );
        }
        
	    return shaders;
	}
};


