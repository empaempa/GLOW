GLOW.Texture = function( url ) {
	
	"use strict";
	
	// TODO: add wrapping, min- mag filter options
	
	this.url = url;
	this.id = GLOW.uniqueId();
	this.image = new Image();
	this.textureUnit = -1;
	this.texture = undefined;
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
	
	this.texture = GL.createTexture();
	
	GL.bindTexture( GL.TEXTURE_2D, this.texture );
	GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.image );

	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT );
	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT );

	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR );
	GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR );

	GL.generateMipmap( GL.TEXTURE_2D );
}
