GLOW.Texture = (function() {
	
	"use strict"; "use restrict";
	
	// constructor
	function texture( parameters ) {
    	if( parameters.url ) {
        	this.url = parameters.url;
        	var lowerCase = this.url.toLowerCase();
        	if( lowerCase.indexOf( ".jpg" ) !== undefined || 
                lowerCase.indexOf( ".png" ) !== undefined ||
                lowerCase.indexOf( ".jpeg" ) !== undefined ) {
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
    	}
    	
    	this.id = GLOW.uniqueId();
    	this.wrapS = parameters.wrapS !== undefined ? parameters.wrapS : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.wrapT = parameters.wrapT !== undefined ? parameters.wrapT : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.magFilter = parameters.magFilter !== undefined ? parameters.magFilter : GL.LINEAR;
    	this.minFilter = parameters.minFilter !== undefined ? parameters.minFilter : GL.LINEAR_MIPMAP_LINEAR;
    	this.mipmap = parameters.mipmap !== undefined ? parameters.mipmap : true;
    	this.textureUnit = -1;
    	this.texture = undefined;
	}

	// methods
    texture.prototype.init = function( textureUnit ) {
    	this.textureUnit = textureUnit;
    	if( this.image ) {
        	this.image.onload = this.onLoad;
        	this.image.src = this.url;
    	} else if( this.video ) {
    	    // TODO
    	} else if( this.canvas ) {
    	    this.createTexture();
    	}
    };
    
    texture.prototype.createTexture = function() {
    	this.texture = GL.createTexture();
    	GL.bindTexture( GL.TEXTURE_2D, this.texture );

    	if( this.image ) {
        	GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.image );
    	} else if( this.video ) {
        	GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.video );
    	} else if( this.canvas ) {
        	GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.canvas );
    	}

    	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, this.wrapS );
    	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, this.wrapT );
    	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, this.minFilter );
        if( this.mipmap ) {
        	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, this.magFilter );
        	GL.generateMipmap( GL.TEXTURE_2D );
        }
    };

    texture.prototype.onLoad = function() {
    	this.scope.createTexture();
    };

	return texture;
})();
