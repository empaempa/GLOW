GLOW.Texture = (function() {
	
	"use strict"; "use restrict";
	
	// constructor
	function texture( url ) {
    	this.url = url;
    	this.id = GLOW.uniqueId();
    	this.textureUnit = -1;
    	this.texture = undefined;
    	this.image = new Image();
    	this.image.scope = this;
	}

	// methods
    texture.prototype.init = function( textureUnit ) {
    	this.textureUnit = textureUnit;
    	this.image.onload = this.onLoad;
    	this.image.src = this.url;
    }

    texture.prototype.onLoad = function() {
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

	return texture;
})();
