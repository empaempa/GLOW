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

    	this.textureUnit  = -1;
        this.textureType  = parameters.cube !== true ? GL.TEXTURE_2D : GL.TEXTURE_CUBE_MAP;
    	this.viewport     = { x: 0, y: 0, width: this.width, height: this.height };

    	// setup texture
    	this.texture = GL.createTexture();
    	GL.bindTexture  ( this.textureType, this.texture );
    	GL.texParameteri( this.textureType, GL.TEXTURE_WRAP_S, wrapS );
    	GL.texParameteri( this.textureType, GL.TEXTURE_WRAP_T, wrapT );
    	GL.texParameteri( this.textureType, GL.TEXTURE_MAG_FILTER, magFilter );
    	GL.texParameteri( this.textureType, GL.TEXTURE_MIN_FILTER, minFilter );

        if( this.textureType === GL.TEXTURE_2D ) {
        	GL.texImage2D( this.textureType, 0, internalFormat, this.width, this.height, 0, format, type, null );
        } else {
            for( var t = 0; t < 6; t++ ) {
            	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + t, 0, internalFormat, this.width, this.height, 0, format, type, null );
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

    GLOWFBO.prototype.bind = function( side ) {
    	// TODO: add cache
        if( this.textureType === GL.TEXTURE_2D ) {
        	GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffer );
        } else {
            side = side !== undefined ? side : "posX";
        	GL.bindFramebuffer( GL.FRAMEBUFFER, this.frameBuffers[ side ] );
        }
    	GL.viewport( this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height );
    	return this;
    };

    GLOWFBO.prototype.unbind = function() {
    	// TODO: add cache
    	GL.bindFramebuffer( GL.FRAMEBUFFER, null );
    	GL.viewport( 0, 0, GLOW.currentContext.width, GLOW.currentContext.height );
    	return this;
    };

    GLOWFBO.prototype.setupViewport = function( setup ) {
    	this.viewport.x = setup.x !== undefined ? setup.x : 0;
    	this.viewport.y = setup.y !== undefined ? setup.y : 0;
    	this.viewport.width = setup.width !== undefined ? setup.width : window.innerWidth;
    	this.viewport.height = setup.height !== undefined ? setup.height : window.innerHeight;
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
