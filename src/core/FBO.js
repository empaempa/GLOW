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
    GLOWFBO.prototype.init = function( textureUnit ) {
    	this.textureUnit = textureUnit;
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

    GLOWFBO.prototype.unbind = function() {
    	// TODO: add cache
    	if( this.isBound ) {
    	    this.isBound = false;
        	GL.bindFramebuffer( GL.FRAMEBUFFER, null );
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
