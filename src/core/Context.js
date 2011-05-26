/*
* GLOW Context
*/

GLOW.Context = function( parameters ) {
	
	// construct
	
	var context = {};

	if( parameters === undefined ) parameters = {};
	
	context.id                     = parameters.id                     !== undefined ? parameters.id                       : "Context" + GLOW.uniqueId();
	context.alpha                  = parameters.alpha                  !== undefined ? parameters.alpha                    : true;
	context.depth                  = parameters.depth                  !== undefined ? parameters.depth                    : true;
	context.antialias              = parameters.antialias              !== undefined ? parameters.antialias                : true;
	context.stencil                = parameters.stencil                !== undefined ? parameters.stencil                  : false;
	context.premultipliedAlpha     = parameters.premultipliedAlpha     !== undefined ? parameters.premultipliedAlpha       : true;
	context.preserveDrawingBuffer  = parameters.preserveDrawingBuffer  !== undefined ? parameters.preserveDrawingBuffer    : false;
	context.width                  = parameters.width                  !== undefined ? parameters.width                    : window.innerWidth;
	context.height                 = parameters.height                 !== undefined ? parmaeters.height                   : window.innerHeight;
	
	
	// create canvas and webgl context and register
	
	try {
		
		context.domElement	= document.createElement( 'canvas' );
		context.GL         = context.domElement.getContext( 'experimental-webgl', { alpha:                 context.alpha, 
                                                                                    depth:                 context.depth, 
                                                                                    antialias:             context.antialias,
                                                                                    stencil:               context.stencil,
                                                                                    premultipliedAlpha:    context.premultipliedAlpha,
                                                                                    preserveDrawingBuffer: context.preserveDrawingBuffer } );

		context.domElement.width  = context.width;
		context.domElement.height = context.height;
		context.GL.viewport( 0, 0, context.width, context.height );

	} catch( error ) {

		console.error( "GLOW.Context.construct: " + error );
		return context;
		
	}

	GLOW.registerContext( context );
	
	
	//--- setup clear color ---
	
	context.setupClearColor = function( setup ) {
		
		var r = setup.red   !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : 0; 
		var g = setup.green !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : 0; 
		var b = setup.blue  !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : 0; 
		var a = setup.alpha !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : 1; 
		
		GL.clearColor( r, g, b, a );
		
		return context;
	}
	
	
	//--- clear ---
	
	context.clear = function() {
		
		GL.clear( GL.COLOR_BUFFER_BIT | GL.STENCIL_BUFFER_BIT | GL.DEPTH_BUFFER_BIT )
	}
	

	//--- enable blend ---
	
	context.enableBlend = function( flag, setup ) {
		
		if( flag ) {

			GL.enable( GL.BLEND );
			if( setup ) context.setupBlend( setup );
			
		} else GL.disable( GL.BLEND );
		
		return context;
	}
	
	
	//--- setup blend ---
	
	context.setupBlend = function( setup ) {
		
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
		
		return context;
	}
	
	
	//--- enable depth test ---
	
	context.enableDepthTest = function( flag, setup ) {
		
		if( flag ) {
			
			GL.enable( GL.DEPTH_TEST );
			if( setup ) context.setupDepthTest( setup );
		
		} else GL.disable( GL.DEPTH_TEST );
		
		return context;
	}
	
	
	//--- setup depth test ---
	
	context.setupDepthTest = function( setup ) {
		
		try {
			
			// TODO
			
		} catch( error ) { console.log( "GLOW.Context.setupDepthTest: " + error ); }
		
		return context;
	
	}
	
	
	//--- enable stencil test ---
	
	context.enableStencilTest = function( flag, setup ) {
		
		if( flag ) {
			
			GL.enable( GL.STENCIL_TEST );
			if( setup ) context.setupStencilTest( setup );
		
		} else GL.disable( GL.STENCIL_TEST );
		
		return context;
	}
	
	
	//--- setup stencil test ---
	
	context.setupStencilTest = function( setup ) {
		
		try {
			
			// TODO
			
		} catch( error ) { console.log( "GLOW.Context.setupStencilTest: " + error ); }
		
		return context;
	
	}
	
	
	//--- enable culling ---
	
	context.enableCulling = function( flag, setup ) {
		
		if( flag ) {

			GL.enable( GL.CULL_FACE );
			if( setup ) context.setupCulling( setup );

		} else GL.disable( GL.CULL_FACE );
		
		return context;
	}


	//--- setup culling ---
	
	context.setupCulling = function( setup ) {
		
		try {

			if( setup.frontFace ) GL.frontFace( setup.frontFace );
			if( setup.cullFace  ) GL.cullFace ( setup.cullFace  );

		} catch( error ) {

			console.error( "GLOW.Context.setupCulling: " + error );

		}
		
		return context;
	}


	//--- enable scissor test ---

	context.enableScissorTest = function( flag, setup ) {
		
		if( flag ) {
	
			GL.enable( GL.SCISSOR_TEST );
			if( setup ) context.setupScissorTest( setup );

		} else {
			
			GL.disable( GL.SCISSOR_TEST );
		}
		
		return context;
		
	}


	//--- setup scissor test ---
	
	context.setupScissorTest = function( setup ) {
		
		// TODO
		
		return context;
		
	}


	//--- return public ---

	return context;
}

