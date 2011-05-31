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
