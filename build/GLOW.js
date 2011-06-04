// GLOW.js r1 - http://github.com/empaempa/GLOW
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
		return context;
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
	
	var compiler = {};
	var compiledCode = [];
	
	//--- compile ------------------------------------------
	// vertexShaderCode = string, the vertex shader code
	// fragmentShaderCode = string, the framgnet shader code
	// uniformsAndAttributes = object, for example { transform: GLOW.Matrix4 }
	// elements = array or UInt16Array with elements
	
	compiler.compile = function( vertexShaderCode, fragmentShaderCode, uniformAndAttributeData, elements ) {
		
		var c, cl = compiledCode.length;
		var code;
		var program;
		
		for( c = 0; c < cl; c++ ) {
			
			code = compiledCode[ c ];
			
			if( vertexShaderCode   === code.vertexShaderCode &&
				fragmentShaderCode === code.fragmentShaderCode ) { break; }
		}

		if( c === cl ) {
			
			program = compiler.linkProgram( compiler.compileVertexShader  ( vertexShaderCode   ),
			                                compiler.compileFragmentShader( fragmentShaderCode ));

			compiledCode.push( { vertexShaderCode: vertexShaderCode, 
				                 fragmentShaderCode: fragmentShaderCode,
				                 program: program } );

		} else {
			
			program = code.program;
		}
		
		return new GLOW.CompiledData( program, 
			                          compiler.createUniforms  ( compiler.extractUniforms  ( program ), uniformAndAttributeData ),
			                          compiler.createAttributes( compiler.extractAttributes( program ), uniformAndAttributeData ),
			                          compiler.createElements  ( elements ));
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

		while( true ) {

			uniform = GL.getActiveUniform( program, locationNumber );

			if( uniform !== null && uniform !== -1 && uniform !== undefined ) {

				uniform.name           = uniform.name.split( "[" )[ 0 ];
				uniform.location       = GL.getUniformLocation( program, uniform.name );
				uniform.locationNumber = locationNumber;
			
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

		while( true ) {

			attribute = GL.getActiveAttrib( program, locationNumber );

			if( attribute !== null && attribute !== -1 && attribute !== undefined ) {

				attribute.location       = GL.getAttribLocation( program, attribute.name );
				attribute.locationNumber = locationNumber;
				
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

				console.warning( "GLOW.Compiler.createAttributes: missing declaration for attribute " + name );

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
			return;

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
	
}());/*
* Shader Compiled Data
* @author: Mikael Emtinger, gomo.se
*/

GLOW.CompiledData = function( program, uniforms, attributes, elements ) {
	
	this.program = program;
	this.uniforms = uniforms !== undefined ? uniforms : {};
	this.attributes = attributes !== undefined ? attributes : {};
	this.elements = elements;
}

GLOW.CompiledData.prototype.clone = function( except ) {
	
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
}/*
* Cache
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Cache = function() {
    "use strict"; "use restrict";

    this.highestAttributeNumber = -1;
    this.uniformByLocation = [];
    this.attributeByLocation = [];
    this.textureByLocation = [];
    this.elementId = -1;
    this.programId = -1;
};

(function() {
    "use strict"; "use restrict";

    GLOW.Cache.prototype.programCached = function( program ) {
        if( program.id === this.programId ) return true;
        this.programId = program.id;
        return false;
    };

    GLOW.Cache.prototype.setProgramHighestAttributeNumber = function( program ) {
        var saveHighestAttributeNumber = this.highestAttributeNumber;
        this.highestAttributeNumber = program.highestAttributeNumber;
        return program.highestAttributeNumber - saveHighestAttributeNumber;
    };

    GLOW.Cache.prototype.uniformCached = function( uniform ) {
        if( this.uniformByLocation[ uniform.locationNumber ] === uniform.id ) return true;
        this.uniformByLocation[ uniform.locationNumber ] = uniform.id
        return false;
    };

    GLOW.Cache.prototype.attributeCached = function( attribute ) {
        if( this.attributeByLocation[ attribute.locationNumber ] === attribute.id ) return true;
        this.attributeByLocation[ attribute.locationNumber ] = attribute.id
        return false;
    };

    GLOW.Cache.prototype.textureCached = function( texture ) {
        if( this.textureByLocation[ texture.textureUnit ] === texture.id ) return true;
        this.textureByLocation[ texture.textureUnit ] = texture.id
        return false;
    };

    GLOW.Cache.prototype.elementsCached = function( elements ) {
        if( elements.id === this.elementId ) return true;
        this.elementId = elements.id;
        return false;
    };

    GLOW.Cache.prototype.clear = function() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation.length = 0;
        this.attributeByLocation.length = 0;
        this.textureByLocation.length = 0;
        this.elementId = -1;
        this.programId = -1;
    };
})();
GLOW.FBO = function( width, height, parameters ) {
	
	"use strict";
	
	this.id     = GLOW.uniqueId();
	this.width  = width  !== undefined ? width  : window.innerWidth;
	this.height = height !== undefined ? height : window.innerHeight;
	
	parameters = parameters !== undefined ? parameters : {};

	var wrapS     = parameters.wrapS     !== undefined ? parameters.wrapS     : GL.CLAMP_TO_EDGE;
	var wrapT     = parameters.wrapT     !== undefined ? parameters.wrapT     : GL.CLAMP_TO_EDGE;
	var magFilter = parameters.magFilter !== undefined ? parameters.magFilter : GL.LINEAR;
	var minFilter = parameters.minFilter !== undefined ? parameters.minFilter : GL.LINEAR;
	var format    = parameters.format    !== undefined ? parameters.format    : GL.RGBA;
	var depth     = parameters.depth     !== undefined ? parameters.depth     : true;
	var stencil   = parameters.stencil   !== undefined ? paramaters.stencil   : false;

	this.frameBuffer  = GL.createFramebuffer();
	this.renderBuffer = GL.createRenderbuffer();
	this.texture      = GL.createTexture();
	this.textureUnit  = -1;
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
		} else if( !renderTexture.depthBuffer && renderTexture.stencilBuffer ) {

			GL.renderbufferStorage( GL.RENDERBUFFER, GL.STENCIL_INDEX8, width, height );
			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.STENCIL_ATTACHMENT, GL.RENDERBUFFER, renderBuffer );
		*/
		} else if( depth && stencil ) {

			GL.renderbufferStorage( GL.RENDERBUFFER, GL.DEPTH_STENCIL, this.width, this.height );
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
		return;
	}
}

/*
* Prototypes
*/

GLOW.FBO.prototype.init = function( textureUnit ) {
	
	this.textureUnit = textureUnit;
}


GLOW.FBO.prototype.bind = function() {
	
	// TODO: add cache
	
	GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffer );
	GL.viewport( this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height );
	
	return this;
}


GLOW.FBO.prototype.unbind = function() {
	
	// TODO: add cache
	
	GL.bindFramebuffer( GL.FRAMEBUFFER, null );
	GL.viewport( 0, 0, GLOW.currentContext.width, GLOW.currentContext.height );
	
	return this;
}

GLOW.FBO.prototype.setupViewport = function( setup ) {
	
	this.viewport.x = setup.x !== undefined ? setup.x : 0;
	this.viewport.y = setup.y !== undefined ? setup.y : 0;
	this.viewport.width = setup.width !== undefined ? setup.width : window.innerWidth;
	this.viewport.height = setup.height !== undefined ? setup.height : window.innerHeight;
	
	return this;
}

GLOW.FBO.prototype.resize = function() {
	
	// TODO
	
	return this;
}

GLOW.FBO.prototype.generateMipMaps = function() {

	GL.bindTexture( GL.TEXTURE_2D, this.texture );
	GL.generateMipmap( GL.TEXTURE_2D );
	GL.bindTexture( GL.TEXTURE_2D, null );
	
	return this;
}
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
            GLOW.Compiler.compile(parameters.vertexShader, parameters.fragmentShader, parameters.data, parameters.elements);

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

        if (!GLOW.currentContext.cache.programCached(compiledData.program)) {
            var diff = GLOW.currentContext.cache.setProgramHighestAttributeNumber(compiledData.program);
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
            compiledData.uniforms[u].set();
        }
        
        for (var a in compiledData.attributes) {
            compiledData.attributes[a].bind();
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
    var setvFunctions = [];

    function lazyInit() {
        // lazy initialization so we know we got GL bound to a context

        // TODO: support other types of data than GLOW.Matrix/Vector
        setFunctions[GL.INT] = function() { GL.uniform1i(this.location, this.value()); };
        setFunctions[GL.INT_VEC2] = function() { GL.uniform2i(this.location, this.value(0), this.value(1)); };
        setFunctions[GL.INT_VEC3] = function() { GL.uniform3i(this.location, this.value(0), this.value(1), this.value(2)); };
        setFunctions[GL.INT_VEC4] = function() { GL.uniform4i(this.location, this.value(0), this.value(1), this.value(2), this.value(3)); };
        setFunctions[GL.FLOAT] = function() { GL.uniform1f(this.location, this.value()); };
        setFunctions[GL.FLOAT_VEC2] = function() { GL.uniform2f(this.location, this.value(0), this.value(1)); };
        setFunctions[GL.FLOAT_VEC3] = function() { GL.uniform3f(this.location, this.value(0), this.value(1), this.value(2)); };
        setFunctions[GL.FLOAT_VEC4] = function() { GL.uniform4f(this.location, this.value(0), this.value(1), this.value(2), this.value(3)); };

        setFunctions[GL.FLOAT_MAT2] = function() { GL.uniformMatrix2fv(this.location, this.transposeUniform(), this.value()); };
        setFunctions[GL.FLOAT_MAT3] = function() { GL.uniformMatrix3fv(this.location, this.transposeUniform(), this.value()); };
        setFunctions[GL.FLOAT_MAT4] = function() { GL.uniformMatrix4fv(this.location, this.transposeUniform(), this.value()); };
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

        setvFunctions[GL.INT] = function() { GL.uniform1iv(this.location, this.value()); };
        setvFunctions[GL.INT_VEC2] = function() { GL.uniform2iv(this.location, this.value()); };
        setvFunctions[GL.INT_VEC3] = function() { GL.uniform3iv(this.location, this.value()); };
        setvFunctions[GL.INT_VEC4] = function() { GL.uniform4iv(this.location, this.value()); };
        setvFunctions[GL.FLOAT] = function() { GL.uniform1fv(this.location, this.value()); };
        setvFunctions[GL.FLOAT_VEC2] = function() { GL.uniform2fv(this.location, this.value()); };
        setvFunctions[GL.FLOAT_VEC3] = function() { GL.uniform3fv(this.location, this.value()); };
        setvFunctions[GL.FLOAT_VEC4] = function() { GL.uniform4fv(this.location, this.value()); };
    }

    // constructor
    function uniform(parameters, data) {
        if (!once) {
            once = true;
            lazyInit();
        }

        this.id = GLOW.uniqueId();
        this.data = data;
        this.location = parameters.location;
        this.locationNumber = parameters.locationNumber;

        // todo should all of these really get stored?
        this.name = parameters.name;
        this.length = parameters.length;
        this.type = parameters.type;

        if (parameters.set) {
            this.uniformFunction = parameters.set;
        }
        else {
            this.uniformFunction = (this.length !== undefined && this.length > 1) ?
                setvFunctions[this.type] : setFunctions[this.type];
        }
    }

    // methods
    uniform.prototype.set = function() {
        if (!GLOW.currentContext.cache.uniformCached(this)) {
            this.uniformFunction();
        }
    };

    // default data converters
    uniform.prototype.value = function(element) {
        return element === undefined ? this.data.value : this.data.value[element];
    };
    uniform.prototype.transposeUniform = function() {
        return this.data.transposeUniform;
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
        if (!GLOW.currentContext.cache.attributeCached(this)) {
            GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
            GL.vertexAttribPointer(this.location, this.size, GL.FLOAT, false, this.stride, this.offset);
        }
    };

    return attribute;
})();
/*
* GLOW.Float
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Float = function( value ) {
	
	"use strict";
	this.value = value !== undefined ? value : 0;
}
/*
* GLOW.Int
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Int = function( value ) {

	"use strict";
	this.value = value !== undefined ? value : 0;
}
/**
 * GLOW.Vector3 Based upon THREE.Vector3 by
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Vector3 = function( x, y, z ) {

	"use strict";

	this.value = new Float32Array( 3 );
	this.value[ 0 ] = x !== undefined ? x : 0;
	this.value[ 1 ] = y !== undefined ? y : 0;
	this.value[ 2 ] = z !== undefined ? z : 0;
};

/*
* Prototypes
*/

GLOW.Vector3.prototype.set = function( x, y, z ) {

	this.value[ 0 ] = x;
	this.value[ 1 ] = y;
	this.value[ 2 ] = z;

	return this;
}

GLOW.Vector3.prototype.copy = function ( v ) {

	this.set( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );

	return this;
}

GLOW.Vector3.prototype.add = function ( a, b ) {

	a = a.value;
	b = b.value;

	this.value[ 0 ] = a[ 0 ] + b[ 0 ];
	this.value[ 1 ] = a[ 1 ] + b[ 1 ];
	this.value[ 2 ] = a[ 2 ] + b[ 2 ];

	return this;
}

GLOW.Vector3.prototype.addSelf = function ( a ) {

	a = a.value;

	this.value[ 0 ] = this.value[ 0 ] + a[ 0 ];
	this.value[ 1 ] = this.value[ 1 ] + a[ 1 ];
	this.value[ 2 ] = this.value[ 2 ] + a[ 2 ];

	return this;
}

GLOW.Vector3.prototype.addScalar = function ( s ) {

	this.value[ 0 ] += s;
	this.value[ 1 ] += s;
	this.value[ 2 ] += s;

	return this;
}


GLOW.Vector3.prototype.sub = function ( a, b ) {

	a = a.value;
	b = b.value;

	this.value[ 0 ] = a[ 0 ] - b[ 0 ];
	this.value[ 1 ] = a[ 1 ] - b[ 1 ];
	this.value[ 2 ] = a[ 2 ] - b[ 2 ];
	
	return this;
}

GLOW.Vector3.prototype.subSelf = function ( a ) {

	a = a.value;

	this.value[ 0 ] -= a[ 0 ];
	this.value[ 1 ] -= a[ 1 ];
	this.value[ 2 ] -= a[ 2 ];
	
	return this;
}

GLOW.Vector3.prototype.cross = function ( a, b ) {

	a = a.value;
	b = b.value;

	this.value[ 0 ] = a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ];
	this.value[ 1 ] = a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ];
	this.value[ 2 ] = a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ];

	return this;
}

GLOW.Vector3.prototype.crossSelf = function ( a ) {

	a = a.value;

	var ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ];
	var vx = this.value[ 0 ], vy = this.value[ 1 ], vz = this.value[ 2 ];

	this.value[ 0 ] = ay * vz - az * vy;
	this.value[ 1 ] = az * vx - ax * vz;
	this.value[ 2 ] = ax * vy - ay * vx;

	return this;

}

GLOW.Vector3.prototype.multiply = function( a, b ) {

	a = a.value;
	b = b.value;
	
	this.value[ 0 ] = a[ 0 ] * b[ 0 ];
	this.value[ 1 ] = a[ 1 ] * b[ 1 ];
	this.value[ 2 ] = a[ 2 ] * b[ 2 ];

	return this;
}

GLOW.Vector3.prototype.multiplySelf = function( a ) {

	a = a.value;
	
	this.value[ 0 ] *= a[ 0 ];
	this.value[ 1 ] *= a[ 1 ];
	this.value[ 2 ] *= a[ 2 ];

	return this;
}

GLOW.Vector3.prototype.multiplyScalar = function( s ) {

	this.value[ 0 ] *= s;
	this.value[ 1 ] *= s;
	this.value[ 2 ] *= s;

	return this;
}

GLOW.Vector3.prototype.divideSelf = function( a ) {

	a = a.value;

	this.value[ 0 ] /= a[ 0 ];
	this.value[ 1 ] /= a[ 1 ];
	this.value[ 2 ] /= a[ 2 ];

	return this;
}

GLOW.Vector3.prototype.divideScalar = function( s ) {

	this.value[ 0 ] /= s;
	this.value[ 1 ] /= s;
	this.value[ 2 ] /= s;

	return this;
}

GLOW.Vector3.prototype.negate = function() {

	this.value[ 0 ] = -this.value[ 0 ];
	this.value[ 1 ] = -this.value[ 1 ];
	this.value[ 2 ] = -this.value[ 2 ];

	return this;
}

GLOW.Vector3.prototype.dot = function( a ) {

	a = a.value;

	return this.value[ 0 ] * a[ 0 ] + this.value[ 1 ] * a[ 1 ] + this.value[ 2 ] * a[ 2 ];
}

GLOW.Vector3.prototype.distanceTo = function ( a ) {

	return Math.sqrt( this.distanceToSquared( a ) );
}

GLOW.Vector3.prototype.distanceToSquared = function( a ) {
	
	a = a.value;

	var dx = this.value[ 0 ] - a[ 0 ], dy = this.value[ 1 ] - a[ 1 ], dz = this.value[ 2 ] - a[ 2 ];
	return dx * dx + dy * dy + dz * dz;
}

GLOW.Vector3.prototype.length = function() {

	return Math.sqrt( this.lengthSq() );
}

GLOW.Vector3.prototype.lengthSq = function() {

	return this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ];
}

GLOW.Vector3.prototype.lengthManhattan = function() {

	return this.value[ 0 ] + this.value[ 1 ] + this.value[ 2 ];
}

GLOW.Vector3.prototype.normalize = function() {

	var l = Math.sqrt( this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ] );

	l > 0 ? this.multiplyScalar( 1 / l ) : this.set( 0, 0, 0 );

	return this;
}

GLOW.Vector3.prototype.setPositionFromMatrix = function( m ) {

	m = m.value;

	this.value[ 0 ] = m[ 12 ];
	this.value[ 1 ] = m[ 13 ];
	this.value[ 2 ] = m[ 14 ];
}

GLOW.Vector3.prototype.setLength = function( l ) {

	return this.normalize().multiplyScalar( l );
}

GLOW.Vector3.prototype.isZero = function() {

	var almostZero = 0.0001;
	return ( Math.abs( this.value[ 0 ] ) < almostZero ) && ( Math.abs( this.value[ 1 ] ) < almostZero ) && ( Math.abs( this.value[ 2 ] ) < almostZero );
}

GLOW.Vector3.prototype.clone = function() {

	return GLOW.Vector3( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );
}
/*
* GLOW.Matrix3
* Based upon THREE.Matrix3 by @mr.doob
*/

GLOW.Matrix3 = function () {

	"use strict";

	this.value = new Float32Array( 9 );
	this.transposeUniform = false;
};

/*
* Prototype
*/

GLOW.Matrix3.prototype.set = function( m11, m12, m13, m21, m22, m23, m31, m32, m33 ) {

	this.value[ 0 ] = m11; this.value[ 4 ] = m12; this.value[ 8 ] = m13;
	this.value[ 1 ] = m21; this.value[ 5 ] = m22; this.value[ 9 ] = m23;
	this.value[ 2 ] = m31; this.value[ 6 ] = m32; this.value[ 10 ] = m33;

	return this;
}

GLOW.Matrix3.prototype.identity = function () {

	this.set( 1, 0, 0, 0, 1, 0, 0, 0, 1	);
	return this;
}
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

GLOW.Matrix4 = function() {

	"use strict";

	this.value = new Float32Array( 16 );
	this.transposeUniform = false;

	this.rotation = new GLOW.Vector3();
	this.position = new GLOW.Vector3();
	this.columnX  = new GLOW.Vector3();
	this.columnY  = new GLOW.Vector3();
	this.columnZ  = new GLOW.Vector3();
	
	this.identity();
}

/*
* Prototype
*/

GLOW.Matrix4.prototype.set = function( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ) {

	this.value[ 0 ] = m11; this.value[ 4 ] = m12; this.value[ 8 ] = m13; this.value[ 12 ] = m14;
	this.value[ 1 ] = m21; this.value[ 5 ] = m22; this.value[ 9 ] = m23; this.value[ 13 ] = m24;
	this.value[ 2 ] = m31; this.value[ 6 ] = m32; this.value[ 10 ] = m33; this.value[ 14 ] = m34;
	this.value[ 3 ] = m41; this.value[ 7 ] = m42; this.value[ 11 ] = m43; this.value[ 15 ] = m44;

	return this;
}

GLOW.Matrix4.prototype.identity = function () {

	this.set( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );
	return this;
}

GLOW.Matrix4.prototype.copy = function( a ) {

	a = a.value;

	this.set(
		a[ 0 ], a[ 4 ], a[ 8  ], a[ 12 ],
		a[ 1 ], a[ 5 ], a[ 9  ], a[ 13 ],
		a[ 2 ], a[ 6 ], a[ 10 ], a[ 14 ],
		a[ 3 ], a[ 7 ], a[ 11 ], a[ 15 ]
	);

	return this;
}

GLOW.Matrix4.prototype.lookAt = function( focus, up ) {

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

GLOW.Matrix4.prototype.multiplyVector3 = function ( v ) {

	var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ],
	d = 1 / ( this.value[ 3 ] * vx + this.value[ 7 ] * vy + this.value[ 11 ] * vz + this.value[ 15 ] );

	v.value[ 0 ] = ( this.value[ 0 ] * vx + this.value[ 4 ] * vy + this.value[ 8 ] * vz + this.value[ 12 ] ) * d;
	v.value[ 1 ] = ( this.value[ 1 ] * vx + this.value[ 5 ] * vy + this.value[ 9 ] * vz + this.value[ 13 ] ) * d;
	v.value[ 2 ] = ( this.value[ 2 ] * vx + this.value[ 6 ] * vy + this.value[ 10 ] * vz + this.value[ 14 ] ) * d;

	return v;
}

GLOW.Matrix4.prototype.multiplyVector4 = function ( v ) {

	var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ], vw = v.value[ 3 ];

	v.value[ 0 ] = this.value[ 0 ] * vx + this.value[ 4 ] * vy + this.value[ 8 ] * vz + this.value[ 12 ] * vw;
	v.value[ 1 ] = this.value[ 1 ] * vx + this.value[ 5 ] * vy + this.value[ 9 ] * vz + this.value[ 13 ] * vw;
	v.value[ 2 ] = this.value[ 2 ] * vx + this.value[ 6 ] * vy + this.value[ 10 ] * vz + this.value[ 14 ] * vw;
	v.value[ 3 ] = this.value[ 3 ] * vx + this.value[ 7 ] * vy + this.value[ 11 ] * vz + this.value[ 15 ] * vw;

	return v;
}

GLOW.Matrix4.prototype.rotateAxis = function ( v ) {

	var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ];

	v.value[ 0 ] = vx * this.value[ 0 ] + vy * this.value[ 4 ] + vz * this.value[ 8 ];
	v.value[ 1 ] = vx * this.value[ 1 ] + vy * this.value[ 5 ] + vz * this.value[ 9 ];
	v.value[ 2 ] = vx * this.value[ 2 ] + vy * this.value[ 6 ] + vz * this.value[ 10 ];

	v.normalize();

	return v;
}

GLOW.Matrix4.prototype.crossVector = function ( a ) {

	var v = GLOW.Vector4();
	var ax = a.value[ 0 ], ay = a.value[ 1 ], az = a.value[ 2 ], aw = a.value[ 3 ];

	v.value[ 0 ] = this.value[ 0 ] * ax + this.value[ 4 ] * ay + this.value[ 8 ] * az + this.value[ 12 ] * aw;
	v.value[ 1 ] = this.value[ 1 ] * ax + this.value[ 5 ] * ay + this.value[ 9 ] * az + this.value[ 13 ] * aw;
	v.value[ 2 ] = this.value[ 2 ] * ax + this.value[ 6 ] * ay + this.value[ 10 ] * az + this.value[ 14 ] * aw;
	v.value[ 3 ] = ( aw ) ? this.value[ 3 ] * ax + this.value[ 7 ] * ay + this.value[ 11 ] * az + this.value[ 15 ] * aw : 1;

	return v;
}

GLOW.Matrix4.prototype.multiply = function ( a, b ) {

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

GLOW.Matrix4.prototype.multiplySelf = function ( a ) {

	this.multiply( m, a );
	return this;
}

GLOW.Matrix4.prototype.multiplyScalar = function ( s ) {

	this.value[ 0 ] *= s; this.value[ 4 ] *= s; this.value[ 8 ] *= s; this.value[ 12 ] *= s;
	this.value[ 1 ] *= s; this.value[ 5 ] *= s; this.value[ 9 ] *= s; this.value[ 13 ] *= s;
	this.value[ 2 ] *= s; this.value[ 6 ] *= s; this.value[ 10 ] *= s; this.value[ 14 ] *= s;
	this.value[ 3 ] *= s; this.value[ 7 ] *= s; this.value[ 11 ] *= s; this.value[ 15 ] *= s;

	return this;
}

GLOW.Matrix4.prototype.determinant = function () {

	var n11 = this.value[ 0 ], n12 = this.value[ 4 ], n13 = this.value[ 8 ], n14 = this.value[ 12 ],
	n21 = this.value[ 1 ], n22 = this.value[ 5 ], n23 = this.value[ 9 ], n24 = this.value[ 13 ],
	n31 = this.value[ 2 ], n32 = this.value[ 6 ], n33 = this.value[ 10 ], n34 = this.value[ 14 ],
	n41 = this.value[ 3 ], n42 = this.value[ 7 ], n43 = this.value[ 11 ], n44 = this.value[ 15 ];

	//TODO: make this more efficient
	//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )
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

GLOW.Matrix4.prototype.transpose = function () {

	var tmp;

	tmp = this.value[ 1 ]; this.value[ 1 ] = this.value[ 4 ]; this.value[ 4 ] = tmp;
	tmp = this.value[ 2 ]; this.value[ 2 ] = this.value[ 8 ]; this.value[ 8 ] = tmp;
	tmp = this.value[ 6 ]; this.value[ 6 ] = this.value[ 9 ]; this.value[ 9 ] = tmp;

	tmp = this.value[ 3 ]; this.value[ 3 ] = this.value[ 12 ]; this.value[ 12 ] = tmp;
	tmp = this.value[ 7 ]; this.value[ 7 ] = this.value[ 13 ]; this.value[ 13 ] = tmp;
	tmp = this.value[ 11 ]; this.value[ 11 ] = this.value[ 14 ]; this.value[ 11 ] = tmp;

	return this;
}

GLOW.Matrix4.prototype.clone = function () {

	var clone = new GLOW.Matrix4();
	clone.value = new Float32Array( m );

	return clone;
}


GLOW.Matrix4.prototype.setPosition = function( x, y, z ) {

	this.value[ 12 ] = x;
	this.value[ 13 ] = y;
	this.value[ 14 ] = z;

	return this;
}

GLOW.Matrix4.prototype.addPosition = function( x, y, z ) {
	
	this.value[ 12 ] += x;
	this.value[ 13 ] += y;
	this.value[ 14 ] += z;
}

GLOW.Matrix4.prototype.setRotation = function( x, y, z ) {

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

GLOW.Matrix4.prototype.addRotation = function( x, y, z ) {
	
	this.rotation.value[ 0 ] += x;
	this.rotation.value[ 1 ] += y;
	this.rotation.value[ 2 ] += z;
	
	this.setRotation( this.rotation.value[ 0 ], this.rotation.value[ 1 ], this.rotation.value[ 2 ] );
}

GLOW.Matrix4.prototype.getPosition = function() {
	
	this.position.set( this.value[ 12 ], this.value[ 13 ], this.value[ 14 ] );
	return this.position;
}

GLOW.Matrix4.prototype.getColumnX = function() {
	
	this.columnX.set( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );
	return this.columnX;
}

GLOW.Matrix4.prototype.getColumnY = function() {
	
	this.columnY.set( this.value[ 4 ], this.value[ 5 ], this.value[ 6 ] );
	return this.columnY;
}

GLOW.Matrix4.prototype.getColumnZ = function() {
	
	this.columnZ.set( this.value[ 8 ], this.value[ 9 ], this.value[ 10 ] );
	return this.columnZ;
}


GLOW.Matrix4.prototype.scale = function( v, y, z ) {

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

	m = GLOW.Matrix4();
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
	}
}

GLOW.Geometry.Cube = {
	
	vertices: function( size ) {

		var a = new Float32Array( 6 * 4 * 3 );
		var i = 0;

		size = size !== undefined ? size * 0.5 : 5;

		// front

		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 

		// back

		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 

		// left

		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 

		// right

		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = +size; 

		// up

		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = +size; 
		a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = -size; 
		a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = -size; 

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
		
		a[ i++ ] = 0; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 0; a[ i++ ] = 1;
		
		a[ i++ ] = 0; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 0; a[ i++ ] = 1;

		a[ i++ ] = 0; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 0; a[ i++ ] = 1;

		a[ i++ ] = 0; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 0; a[ i++ ] = 1;
		
		a[ i++ ] = 0; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 0; a[ i++ ] = 1;

		a[ i++ ] = 0; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 0;
		a[ i++ ] = 1; a[ i++ ] = 1;
		a[ i++ ] = 0; a[ i++ ] = 1;

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

