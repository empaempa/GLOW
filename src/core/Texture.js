GLOW.Texture = (function() {
	
	"use strict"; "use restrict";
	
	// constructor
	function texture( parameters ) {
    	if( parameters.url ) {
        	this.url = parameters.url;
        	var lowerCaseURL = this.url.toLowerCase();
        	if( lowerCaseURL.indexOf( ".jpg" ) !== -1 || 
                lowerCaseURL.indexOf( ".png" ) !== -1 ||
                lowerCaseURL.indexOf( ".jpeg" ) !== -1 ) {
                this.image = new Image();
                this.image.scope = this;    
            } else {
                this.video = document.createElement( "video" );
                this.video.scope = this;
            }
    	} else if( parameters.image ) {
    	    this.image = parameters.image;
    	} else if( parameters.canvas ) {
    	    this.canvas = parameters.canvas;
    	} else if( parameters.video ) {
    	    this.video = parameters.video;
    	} else if( parameters.buffer ) {
    	    this.buffer = parameters.buffer;
    	    this.width  = parameters.width;
    	    this.height = parameters.height;
    	}
    	
    	this.id = GLOW.uniqueId();
    	this.internalFormat = parameters.internalFormat !== undefined ? parameters.internalFormat : GL.RGBA;
    	this.format = parameters.format !== undefined ? parameters.format : GL.RGBA;
    	this.type = parameters.type !== undefined ? parameters.type : GL.UNSIGNED_BYTE;
    	this.wrapS = parameters.wrapS !== undefined ? parameters.wrapS : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.wrapT = parameters.wrapT !== undefined ? parameters.wrapT : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.magFilter = parameters.magFilter !== undefined ? parameters.magFilter : GL.LINEAR;
    	this.minFilter = parameters.minFilter !== undefined ? parameters.minFilter : GL.LINEAR_MIPMAP_LINEAR;
    	this.textureUnit = -1;
    	this.texture = undefined;
	}

	// methods
    texture.prototype.init = function( textureUnit ) {
    	this.textureUnit = textureUnit;
    	if( this.url ) {
    	    if( this.image ) {
        	    this.image.onload = this.onLoadImage;
        	    this.image.src = this.url;
    	    } else {
        		this.video.addEventListener( "loadeddata", this.onLoadVideo, false );
        	    this.video.src = this.url;
    	    }
    	} else {
    	    this.createTexture();
    	}
    };
    
    texture.prototype.createTexture = function() {
    	this.texture = GL.createTexture();
    	GL.bindTexture( GL.TEXTURE_2D, this.texture );

    	if( this.image ) {
        	GL.texImage2D( GL.TEXTURE_2D, 0, this.internalFormat, this.format, this.type, this.image );
    	} else if( this.video ) {
        	GL.texImage2D( GL.TEXTURE_2D, 0, this.internalFormat, this.format, this.type, this.video );
    	} else if( this.canvas ) {
        	GL.texImage2D( GL.TEXTURE_2D, 0, this.internalFormat, this.format, this.type, this.canvas );
    	} else if( this.buffer ) {
        	GL.texImage2D( GL.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.buffer );
    	}

    	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, this.wrapS );
    	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, this.wrapT );
	    GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, this.minFilter );
    	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, this.magFilter );
    	if( this.minFilter !== GL.NEAREST && this.minFilter !== GL.LINEAR ) {
    	    GL.generateMipmap( GL.TEXTURE_2D );
	    }
    };
    
    texture.prototype.updateTexture = function( parameters ) {
        var level = 0;
        var xOffset = 0;
        var yOffset = 0;
        if( parameters ) {
            level = parameters.level !== undefined ? parameters.level : level;
            xOffset = parameters.xOffset !== undefined ? parameters.level : xOffset;
            yOffset = parameters.yOffset !== undefined ? parameters.level : yOffset;
        } 
        
        if( !GLOW.currentContext.cache.textureCached( this )) {
            GL.bindTexture( GL.TEXTURE_2D, this.texture );
        }

        if( this.video ) {
            GL.texSubImage2D( GL.TEXTURE_2D, level, xOffset, yOffset, this.format, this.type, this.video );
        } else if( this.canvas ) {
            GL.texSubImage2D( GL.TEXTURE_2D, level, xOffset, yOffset, this.format, this.type, this.canvas );
        } else if( this.buffer ) {
            GL.texSubImage2D( GL.TEXTURE_2D, level, xOffset, yOffset, this.width, this.height, this.format, this.type, this.buffer );
        } else if( this.image ) {
            GL.texSubImage2D( GL.TEXTURE_2D, level, xOffset, yOffset, this.format, this.type, this.image );
        }

    	if( this.minFilter !== GL.NEAREST && this.minFilter !== GL.LINEAR ) {
    	    GL.generateMipmap( GL.TEXTURE_2D );
	    }
    }

    texture.prototype.onLoadImage = function() {
    	this.scope.createTexture();
    };
    
    texture.prototype.onLoadVideo = function() {
		this.removeEventListener( "loadeddata", this.onLoadVideo, false );
        this.scope.createTexture();
    }

	return texture;
})();
