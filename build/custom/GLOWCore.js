// GLOWCore.js r1 - http://github.com/empaempa/GLOW
/*
* GLOW - Just-Above-Low-Level WebGL API
*/

var GLOW = (function() {
    "use strict"; "use restrict";

    var glow = {};
    var contexts = {};
    var uniqueIdCounter = -1;

    glow.currentContext = {};

    //--- register context ---
    glow.registerContext = function( context ) {
        contexts[ context.id ] = context;
        glow.enableContext( context );
    };

    //--- get context by id ---
    glow.getContextById = function( id ) {
        if( contexts[ id ] ) {
            return contexts[ id ];
        }
        console.error( "Couldn't find context id " + id + ", returning current with id " + glow.currentContext.id );
        return glow.currentContext;
    };

    //--- enable context ---
    glow.enableContext = function( contextOrId ) {
        if( typeof( contextOrId ) === 'string' ) {
            glow.currentContext = getContextById(contextOrId);
        } else {
            glow.currentContext = contextOrId;
        }
        GL = glow.GL = glow.currentContext.GL;
    };

    //--- unique id ---
    glow.uniqueId = function() {
        return ++uniqueIdCounter;
    };

    //--- return public ---
    return glow;
}());

/*
* Current GL - set to latest registered or enabled GL context 
*/
var GL = {};
/*
* GLOW Context
*/

GLOW.Context = function( parameters ) {
	
	"use strict";
	
	if( parameters === undefined ) parameters = {};
	
	this.id                     = parameters.id                    !== undefined ? parameters.id                    : GLOW.uniqueId();
	this.alpha                  = parameters.alpha                 !== undefined ? parameters.alpha                 : true;
	this.depth                  = parameters.depth                 !== undefined ? parameters.depth                 : true;
	this.antialias              = parameters.antialias             !== undefined ? parameters.antialias             : true;
	this.stencil                = parameters.stencil               !== undefined ? parameters.stencil               : false;
	this.premultipliedAlpha     = parameters.premultipliedAlpha    !== undefined ? parameters.premultipliedAlpha    : true;
	this.preserveDrawingBuffer  = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;
	this.width                  = parameters.width                 !== undefined ? parameters.width                 : window.innerWidth;
	this.height                 = parameters.height                !== undefined ? parmaeters.height                : window.innerHeight;
	
	// create canvas and webgl context and register
	
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
		this.GL.viewport( 0, 0, this.width, this.height );	// TODO: move into setupViewport
	} catch( error ) {
		console.error( "GLOW.Context.construct: " + error );
	}

	GLOW.registerContext( this );

	this.cache = new GLOW.Cache();

	this.enableCulling( false );
	this.enableDepthTest( true, { func: GL.LEQUAL, write: true, zNear: 0, zFar: 1 } );
	this.enableBlend( false );
	this.setupClear( { clearBits: GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT } );
	this.clear();
}

/*
* Prototypes
*/

GLOW.Context.prototype.setupClear = function( setup ) {
	
	var r = setup.red   !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : 0; 
	var g = setup.green !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : 0; 
	var b = setup.blue  !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : 0; 
	var a = setup.alpha !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : 1;
	var d = setup.depth !== undefined ? Math.min( 1, Math.max( 0, setup.depth )) : 1;
	 
	GL.clearColor( r, g, b, a );
	GL.clearDepth( d );
	
	this.clearBits = setup.clearBits !== undefined ? setup.clearBits : this.clearBits;

	return this;
}

GLOW.Context.prototype.clear = function( bits ) {
	
	if( bits === undefined ) { bits = this.clearBits };
	GL.clear( bits );

	return this;
}

GLOW.Context.prototype.enableBlend = function( flag, setup ) {
	
	if( flag ) {

		GL.enable( GL.BLEND );
		if( setup ) this.setupBlend( setup );
		
	} else GL.disable( GL.BLEND );
	
	return this;
}

GLOW.Context.prototype.setupBlend = function( setup ) {
	
	if( setup.equationRGB ) {

		try {

			if( setup.equationAlpha ) GL.blendEquationSeparate( setup.equationRGB, setup.equationAlpha );
			if( setup.srcRGB        ) GL.blendFuncSeparate( setup.srcRGB, setup.dstRGB, setup.srcAlpha, setup.dstAlpha );

		} catch( error ) { console.error( "GLOW.Context.setupBlend: " + error ); }
		
	} else {
		
		try {
		
			if( setup.equation ) GL.blendEquation( setup.equation );
			if( setup.src      ) GL.blendFunc( setup.src, setup.dst );
		
		} catch( error ) { console.error( "GLOW.Context.setupBlend: " + error ); }
	}
	
	return this;
}

GLOW.Context.prototype.enableDepthTest = function( flag, setup ) {
	
	if( flag ) {
		
		GL.enable( GL.DEPTH_TEST );
		if( setup ) this.setupDepthTest( setup );
	
	} else GL.disable( GL.DEPTH_TEST );
	
	return this;
}

GLOW.Context.prototype.setupDepthTest = function( setup ) {
	
	try {
		
		if( setup.func  !== undefined ) GL.depthFunc( setup.func );
		if( setup.write !== undefined ) GL.depthMask( setup.write );

		if( setup.zNear !== undefined && setup.zFar !== undefined && setup.zNear <= setup.zFar ) {
			GL.depthRange( Math.max( 0, Math.min( 1, setup.zNear )), Math.max( 0, Math.min( 1, setup.zFar )));
		}

	} catch( error ) { console.log( "GLOW.Context.setupDepthTest: " + error ); }
	
	return this;
}


GLOW.Context.prototype.enableStencilTest = function( flag, setup ) {
	
	if( flag ) {
		
		GL.enable( GL.STENCIL_TEST );
		if( setup ) this.setupStencilTest( setup );
	
	} else GL.disable( GL.STENCIL_TEST );
	
	return this;
}

GLOW.Context.prototype.setupStencilTest = function( setup ) {
	
	// TODO
	
	return this;
}

GLOW.Context.prototype.enableCulling = function( flag, setup ) {
	
	if( flag ) {

		GL.enable( GL.CULL_FACE );
		if( setup ) this.setupCulling( setup );

	} else GL.disable( GL.CULL_FACE );
	
	return this;
}

GLOW.Context.prototype.setupCulling = function( setup ) {
	
	try {

		if( setup.frontFace ) GL.frontFace( setup.frontFace );
		if( setup.cullFace  ) GL.cullFace ( setup.cullFace  );

	} catch( error ) {

		console.error( "GLOW.Context.setupCulling: " + error );
	}
	
	return this;
}

GLOW.Context.prototype.enableScissorTest = function( flag, setup ) {
	
	if( flag ) {

		GL.enable( GL.SCISSOR_TEST );
		if( setup ) this.setupScissorTest( setup );

	} else {
		
		GL.disable( GL.SCISSOR_TEST );
	}
	
	return this;
}

GLOW.Context.prototype.setupScissorTest = function( setup ) {
	
	// TODO
	
	return this;
}

GLOW.Context.prototype.setupViewport = function( setup ) {
	
	// TODO
	
	return this;
}
/*
* GLOW.Compiler
* @author: Mikael Emtinger, gomo.se
* Compiles vertex- and fragementshader, uniforms, attributes and elements into a GLOW.CompiledData
*/

GLOW.Compiler = (function() {
	
	"use strict"; 
	"use restrict";
	
	var compiler = {};
	var compiledCode = [];
	
	//--- compile ------------------------------------------
	// parameter object containing:
	//  vertexShaderCode = string, the vertex shader code
	//  fragmentShaderCode = string, the framgnet shader code
	//  uniformsAndAttributes = object, for example { transform: GLOW.Matrix4 }
	//  elements = array or UInt16Array with elements
	
	compiler.compile = function( parameters ) {
		var c, cl = compiledCode.length;
		var code;
		var program;
		
		for( c = 0; c < cl; c++ ) {
			code = compiledCode[ c ];
			if( parameters.vertexShader   === code.vertexShader &&
				parameters.fragmentShader === code.fragmentShader ) { break; }
		}

		if( c === cl ) {
			program = compiler.linkProgram( compiler.compileVertexShader  ( parameters.vertexShader   ),
			                                compiler.compileFragmentShader( parameters.fragmentShader ));

			compiledCode.push( { vertexShader: parameters.vertexShader, 
				                 fragmentShader: parameters.fragmentShader,
				                 program: program } );
		} else {
			program = code.program;
		}
		
		return new GLOW.CompiledData( program, 
			                          compiler.createUniforms  ( compiler.extractUniforms  ( program ), parameters.data ),
			                          compiler.createAttributes( compiler.extractAttributes( program ), parameters.data ),
			                          compiler.createElements  ( parameters.elements ));
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

				if( uniforms[ name ].type === GL.SAMPLER_2D ) {
					uniforms[ name ].data.init( textureUnit++ );
				}
			}
		}
		
		return uniforms;
	}


	//--- create attributes ---

	compiler.createAttributes = function( attributeInformation, data ) {

		var a;
		var attribute, name;
		var attributes = {};

		for( a in attributeInformation ) {

			attribute = attributeInformation[ a ];
			name      = attribute.name;
			
			if( data[ name ] === undefined ) {
				console.warn( "GLOW.Compiler.createAttributes: missing declaration for attribute " + name );
			} else if( data[ name ] instanceof GLOW.Attribute ) {
				attributes[ name ] = data[ name ];
			} else {
				attributes[ name ] = new GLOW.Attribute( attribute, data[ name ] );
			}
		}

		return attributes;
	}
	
	
	//--- create elements ---
	
	compiler.createElements = function( data ) {

		var elements;

		if( !data ) {
			console.error( "GLOW.Compiler.createElements: missing 'elements' in supplied data. Quitting." );
		} else if( data instanceof GLOW.Elements ) {
			elements = data;
		} else {
			if( !( data instanceof Uint16Array )) {
				data = new Uint16Array( data );
			}

			elements = new GLOW.Elements( data );
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
    
    function compiledData( program, uniforms, attributes, elements ) {
	    this.program = program;
	    this.uniforms = uniforms !== undefined ? uniforms : {};
	    this.attributes = attributes !== undefined ? attributes : {};
	    this.elements = elements;
    }


    compiledData.prototype.clone = function( except ) {
    	var clone = new GLOW.CompiledData();

    	var u;
    	for( u in this.uniforms ) {
    		if( except[ u ] ) {
    			clone.uniforms[ u ] = new GLOW.Uniform( this.uniforms[ u ], except[ u ] );
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

    	if( except.elements ) {
    		clone.elements = new GLOW.Elements( except.elements );
    	} else {
    		clone.elements = this.elements;
    	}

    	clone.program = this.program;
    	return clone;
    };
    
    return compiledData;
})();

/*
* Cache
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Cache = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function cache() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation = [];
        this.attributeByLocation = [];
        this.textureByLocation = [];
        this.elementId = -1;
        this.programId = -1;
    }

    // methods
    cache.prototype.programCached = function( program ) {
        if( program.id === this.programId ) return true;
        this.programId = program.id;
        return false;
    };

    cache.prototype.setProgramHighestAttributeNumber = function( program ) {
        var saveHighestAttributeNumber = this.highestAttributeNumber;
        this.highestAttributeNumber = program.highestAttributeNumber;
        return program.highestAttributeNumber - saveHighestAttributeNumber;
    };

    cache.prototype.uniformCached = function( uniform ) {
        if( this.uniformByLocation[ uniform.locationNumber ] === uniform.id ) return true;
        this.uniformByLocation[ uniform.locationNumber ] = uniform.id
        return false;
    };

    cache.prototype.attributeCached = function( attribute ) {
        if( this.attributeByLocation[ attribute.locationNumber ] === attribute.id ) return true;
        this.attributeByLocation[ attribute.locationNumber ] = attribute.id
        return false;
    };

    cache.prototype.textureCached = function( texture ) {
        if( this.textureByLocation[ texture.textureUnit ] === texture.id ) return true;
        this.textureByLocation[ texture.textureUnit ] = texture.id
        return false;
    };

    cache.prototype.elementsCached = function( elements ) {
        if( elements.id === this.elementId ) return true;
        this.elementId = elements.id;
        return false;
    };

    cache.prototype.clear = function() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation.length = 0;
        this.attributeByLocation.length = 0;
        this.textureByLocation.length = 0;
        this.elementId = -1;
        this.programId = -1;
    };
    
    return cache;
})();
GLOW.FBO = (function() {
    
    "use strict"; "use restrict";

	// constructor
	function fbo( parameters ) {

    	parameters = parameters !== undefined ? parameters : {};

    	this.id       = GLOW.uniqueId();
    	this.width    = parameters.width     !== undefined ? parameters.width     : window.innerWidth;
    	this.height   = parameters.height    !== undefined ? parameters.height    : window.innerHeight;
    	var wrapS     = parameters.wrapS     !== undefined ? parameters.wrapS     : GL.CLAMP_TO_EDGE;
    	var wrapT     = parameters.wrapT     !== undefined ? parameters.wrapT     : GL.CLAMP_TO_EDGE;
    	var magFilter = parameters.magFilter !== undefined ? parameters.magFilter : GL.LINEAR;
    	var minFilter = parameters.minFilter !== undefined ? parameters.minFilter : GL.LINEAR;
    	var format    = parameters.format    !== undefined ? parameters.format    : GL.RGBA;
    	var depth     = parameters.depth     !== undefined ? parameters.depth     : true;
    	var stencil   = parameters.stencil   !== undefined ? paramaters.stencil   : false;

    	this.textureUnit  = -1;
    	this.frameBuffer  = GL.createFramebuffer();
    	this.renderBuffer = GL.createRenderbuffer();
    	this.texture      = GL.createTexture();
    	this.viewport     = { x: 0, y: 0, width: this.width, height: this.height };

    	try {
    		// setup texture
    		GL.bindTexture( GL.TEXTURE_2D, this.texture );
    		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrapS );
    		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrapT );
    		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, magFilter );
    		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, minFilter );
    		GL.texImage2D( GL.TEXTURE_2D, 0, format, this.width, this.height, 0, format, GL.UNSIGNED_BYTE, null );

    		// setup buffers
    		GL.bindRenderbuffer( GL.RENDERBUFFER, this.renderBuffer );
    		GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffer );
    		GL.framebufferTexture2D( GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.texture, 0 );

    		if( depth && !stencil ) {
    			GL.renderbufferStorage( GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.width, this.height );
    			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
    		/* For some reason combination !depth and stencil is not working. Defaulting to RGBA4.	
    		} else if( !depth && stencil ) {
    			GL.renderbufferStorage( GL.RENDERBUFFER, GL.STENCIL_INDEX8, width, height );
    			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
    		*/
    		} else if( depth && stencil ) {
    			GL.renderbufferStorage( GL.RENDERBUFFER, GL.DEPTH_STENCIL, width, height );
    			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer );
    		} else {
    			GL.renderbufferStorage( GL.RENDERBUFFER, GL.RGBA4, this.width, this.height );
    		}

    		// release
    		GL.bindTexture( GL.TEXTURE_2D, null );
    		GL.bindRenderbuffer( GL.RENDERBUFFER, null );
    		GL.bindFramebuffer( GL.FRAMEBUFFER, null);

    	} catch( error ) {
    		console.error( "GLOW.FBO.construct: " + error );
    	}
	}

    // methods
    fbo.prototype.init = function( textureUnit ) {
    	this.textureUnit = textureUnit;
    }

    fbo.prototype.bind = function() {
    	// TODO: add cache
    	GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffer );
    	GL.viewport( this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height );
    	return this;
    }

    fbo.prototype.unbind = function() {
    	// TODO: add cache
    	GL.bindFramebuffer( GL.FRAMEBUFFER, null );
    	GL.viewport( 0, 0, GLOW.currentContext.width, GLOW.currentContext.height );
    	return this;
    }

    fbo.prototype.setupViewport = function( setup ) {
    	this.viewport.x = setup.x !== undefined ? setup.x : 0;
    	this.viewport.y = setup.y !== undefined ? setup.y : 0;
    	this.viewport.width = setup.width !== undefined ? setup.width : window.innerWidth;
    	this.viewport.height = setup.height !== undefined ? setup.height : window.innerHeight;
    	return this;
    }

    fbo.prototype.resize = function() {
    	// TODO
    	return this;
    }

    fbo.prototype.generateMipMaps = function() {
    	GL.bindTexture( GL.TEXTURE_2D, this.texture );
    	GL.generateMipmap( GL.TEXTURE_2D );
    	GL.bindTexture( GL.TEXTURE_2D, null );
    	return this;
    }
    
    return fbo;
})();
GLOW.Texture = function( url ) {
	
	"use strict";
	
	// TODO: add wrapping, min- mag filter options
	
	this.url = url;
	this.id = GLOW.uniqueId();
	this.textureUnit = -1;
	this.texture = undefined;
	this.image = new Image();
	this.image.scope = this;
}

/* 
* Prototype
*/ 

GLOW.Texture.prototype.init = function( textureUnit ) {
	
	this.textureUnit = textureUnit;
	this.image.onload = this.onLoad;
	this.image.src = this.url;
	
}

GLOW.Texture.prototype.onLoad = function() {

	var scope = this.scope;
	
	scope.texture = GL.createTexture();
	
	GL.bindTexture( GL.TEXTURE_2D, scope.texture );
	GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this );

	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT );
	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT );

	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR );
	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR );

	GL.generateMipmap( GL.TEXTURE_2D );
}
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
    function shader(parameters) {
        this.id = GLOW.uniqueId();

        this.compiledData = parameters.use ?
            parameters.use.clone(parameters.except) :
            GLOW.Compiler.compile(parameters);

        this.attachData();
    }

    // methods
    shader.prototype.attachData = function() {
        var u, a;

        for (u in this.compiledData.uniforms) {
            if (this[u] === undefined) {
                this[u] = this.compiledData.uniforms[u].data;
            }
            else {
                console.warn("GLOW.Shader.attachUniformAndAttributeData: name collision on uniform " + u + ", not attaching for easy access. Please use Shader.uniforms." + u + ".data to access data.");
            }
        }

        for (a in this.compiledData.attributes) {
            if (this[a] === undefined) {
                this[a] = this.compiledData.attributes[a].data;
            }
            else {
                console.warn("GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " + a + ", not attaching for easy access. Please use Shader.attributes." + a + ".data to access data.");
            }
        }
    };

    shader.prototype.draw = function() {
        var compiledData = this.compiledData;
        var cache = GLOW.currentContext.cache;

        if (!cache.programCached(compiledData.program)) {
            var diff = cache.setProgramHighestAttributeNumber(compiledData.program);
            if (diff) {
                // enable / disable attribute streams
                var highestAttrib = compiledData.program.highestAttributeNumber;
                var current = highestAttrib - diff + 1;

                if (diff > 0) {
                    for (; current <= highestAttrib; current++) {
                        GL.enableVertexAttribArray(current);
                    }
                }
                else {
                    for (; current >= highestAttrib; current--) {
                        GL.disableVertexAttribArray(current); 
                    }
                }
            }
            GL.useProgram(compiledData.program);
        }

        for (var u in compiledData.uniforms) {
            if (!cache.uniformCached(compiledData.uniforms[u])) {
                compiledData.uniforms[u].load();
            }
        }
        
        for (var a in compiledData.attributes) {
            if (!cache.attributeCached(compiledData.attributes[a])) {
                compiledData.attributes[a].bind();
            }
        }
        
        compiledData.elements.draw();
    };

    shader.prototype.clone = function(except) {
        return new GLOW.Shader({ use: this.compiledData, except: except });
    };

    shader.prototype.dispose = function() {
        // TODO
    };

    return shader;
})();



/*
* GLOW.Elements
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Elements = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function elements(data) {
        this.id = GLOW.uniqueId();
        this.elements = GL.createBuffer();
        this.length = data.length;

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.elements);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, data, GL.STATIC_DRAW);
    }

    // methods
    elements.prototype.draw = function() {
        if (!GLOW.currentContext.cache.elementsCached(this)) {
            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.elements);
        }
        GL.drawElements(GL.TRIANGLES, this.length, GL.UNSIGNED_SHORT, 0);
    };

    return elements;
})();
GLOW.Uniform = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here
    var once = false;
    var setFunctions = [];

    function lazyInit() {
        setFunctions[GL.INT] = function() { GL.uniform1iv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT] = function() { GL.uniform1fv(this.location, this.getNativeValue()); };
        setFunctions[GL.INT_VEC2] = function() { GL.uniform2iv(this.location, this.getNativeValue()); };
        setFunctions[GL.INT_VEC3] = function() { GL.uniform3iv(this.location, this.getNativeValue()); };
        setFunctions[GL.INT_VEC4] = function() { GL.uniform4iv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT_VEC2] = function() { GL.uniform2fv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT_VEC3] = function() { GL.uniform3fv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT_VEC4] = function() { GL.uniform4fv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT_MAT2] = function() { GL.uniformMatrix2fv(this.location, false, this.getNativeValue()); };
        setFunctions[GL.FLOAT_MAT3] = function() { GL.uniformMatrix3fv(this.location, false, this.getNativeValue()); };
        setFunctions[GL.FLOAT_MAT4] = function() { GL.uniformMatrix4fv(this.location, false, this.getNativeValue()); };
        setFunctions[GL.SAMPLER_2D] = function() {
            if (this.data.texture !== undefined && this.data.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached(this.data)) {
                GL.uniform1i(this.location, this.data.textureUnit);
                GL.activeTexture(GL.TEXTURE0 + this.data.textureUnit);
                GL.bindTexture(GL.TEXTURE_2D, this.data.texture);
            }
        };
        setFunctions[GL.SAMPLER_CUBE] = function() {
            /* TODO */
        };
    }

    // constructor
    function uniform(parameters, data) {
        if (!once) {
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
        this.load = parameters.loadFunction || setFunctions[this.type];
    }

    // methods
    // default data converter
    uniform.prototype.getNativeValue = function() {
        return this.data.value;
    };

    return uniform;
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
    function attribute(parameters, data, interleave) {
        if (!once) {
            once = true;
            lazyInit();
        }

        this.id = GLOW.uniqueId();
        this.data = data;
        this.location = parameters.location;
        this.locationNumber = parameters.locationNumber;
        this.stride = 0;
        this.offset = 0;
        this.size = sizes[parameters.type];
        this.buffer = GL.createBuffer();

        // todo should all of these really get stored?
        this.name = parameters.name;
        this.type = parameters.type;

        if (!interleave) {
            if (this.data instanceof Float32Array) {
                this.setData(this.data);
            }
            else {
                var al = this.data.length;
                var sl = this.size;
                var flat = new Float32Array(al * sl);
                var i = 0;
                for (var a = 0; a < al; a++) {
                    for(var s = 0; s < sl; s++) {
                        flat[i++] = data[a].value[s];
                    }
                }
                this.setData(flat);
            }
        }
    }

    // methods
    attribute.prototype.interleave = function(float32array, stride, offset) {
        this.stride = stride;
        this.offset = offset;
        // TODO
    };

    attribute.prototype.setData = function(data) {
        this.data = data;
        GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
        GL.bufferData(GL.ARRAY_BUFFER, this.data, GL.STATIC_DRAW);
    };

    attribute.prototype.bind = function() {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
        GL.vertexAttribPointer(this.location, this.size, GL.FLOAT, false, this.stride, this.offset);
    };

    return attribute;
})();
