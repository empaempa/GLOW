GLOW.FBO = function( width, height, parameters ) {
	
	FBO = {};
	
	width  = width  !== undefined ? width  : window.innerWidth;
	height = height !== undefined ? height : window.innerHeight;
	
	parameters = parameters !== undefined ? parameters : {};

	var wrapS     = parameters.wrapS     !== undefined ? parameters.wrapS     : GL.CLAMP_TO_EDGE;
	var wrapT     = parameters.wrapT     !== undefined ? parameters.wrapT     : GL.CLAMP_TO_EDGE;
	var magFilter = parameters.magFilter !== undefined ? parameters.magFilter : GL.LINEAR;
	var minFilter = parameters.minFilter !== undefined ? parameters.minFilter : GL.LINEAR;
	var format    = parameters.format    !== undefined ? parameters.format    : GL.RGBA;
	var depth     = parameters.depth     !== undefined ? parameters.depth     : true;
	var stencil   = parameters.stencil   !== undefined ? paramaters.stencil   : false;

	var frameBuffer  = GL.createFramebuffer();
	var renderBuffer = GL.createRenderbuffer();
	var texture      = GL.createTexture();
	var viewport     = { x: 0, y: 0, width: width, height: height };

	try {
		
		// setup texture

		GL.bindTexture( GL.TEXTURE_2D, texture );
		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrapS );
		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrapT );
		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, magFilter );
		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, minFilter );
		GL.texImage2D( GL.TEXTURE_2D, 0, format, width, height, 0, format, GL.UNSIGNED_BYTE, null );


		// setup buffers

		GL.bindRenderbuffer( GL.RENDERBUFFER, renderBuffer );
		GL.bindFramebuffer( GL.FRAMEBUFFER, frameBuffer );

		GL.framebufferTexture2D( GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0 );

		if( depth && !stencil ) {

			GL.renderbufferStorage( GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height );
			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, renderBuffer );

		/* For some reason combination !depth and stencil is not working. Defaulting to RGBA4.	
		} else if( !renderTexture.depthBuffer && renderTexture.stencilBuffer ) {

			GL.renderbufferStorage( GL.RENDERBUFFER, GL.STENCIL_INDEX8, width, height );
			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.STENCIL_ATTACHMENT, GL.RENDERBUFFER, renderBuffer );
		*/
		} else if( depth && stencil ) {

			GL.renderbufferStorage( GL.RENDERBUFFER, GL.DEPTH_STENCIL, width, height );
			GL.framebufferRenderbuffer( GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, renderBuffer );

		} else {

			GL.renderbufferStorage( GL.RENDERBUFFER, GL.RGBA4, width, height );
		}

		// release

		GL.bindTexture( GL.TEXTURE_2D, null );
		GL.bindRenderbuffer( GL.RENDERBUFFER, null );
		GL.bindFramebuffer( GL.FRAMEBUFFER, null);

	} catch( error ) {
		
		console.error( "GLOW.FBO.construct: " + error );
		return;
	}


	//--- init ---
	
	function init( textureUnit ) {
		
		FBO.textureUnit = textureUnit;
	}


	//--- bind ---
	
	function bind() {
		
		GL.bindFramebuffer( GL.FRAMEBUFFER, frameBuffer );
		GL.viewport( viewport.x, viewport.y, viewport.width, viewport.height );
		
		return FBO;
	}
	
	
	//--- unbind ---

	function unbind() {
		
		GL.bindFramebuffer( GL.FRAMEBUFFER, null );
		GL.viewport( 0, 0, GLOW.currentContext.width, GLOW.currentContext.height );
		
		return FBO;
	}

	//--- set viewport ---
	
	function setupViewport( x, y, w, h ) {
		
		viewport.x = x;
		viewport.y = y;
		viewport.width = w;
		viewport.height = h;
		
		return FBO;
	}


	//--- resize ---
	
	function resize() {
		
		// TODO
		
		return FBO;
	}
	
	//--- generate mip maps ---
	
	function generateMipMaps() {

		GL.bindTexture( GL.TEXTURE_2D, texture );
		GL.generateMipmap( GL.TEXTURE_2D );
		GL.bindTexture( GL.TEXTURE_2D, null );
		
		return FBO;
	}


	//--- public ---

	FBO.id = GLOW.uniqueId();
	FBO.texture = texture;
	FBO.textureUnit = -1;
	FBO.viewport = viewport;
	FBO.init = init;
	FBO.bind = bind;
	FBO.unbind = unbind;
	FBO.resize = resize;
	FBO.generateMipMaps = generateMipMaps;

	return FBO;
}
