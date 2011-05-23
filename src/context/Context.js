/*
* GLOW Context
*/

GLOW.Context = function( parameters ) {
	
	// construct
	
	var that = {};
	
	that.id 					= parameters.id        				!== undefined ? parameters.id 		 				: "Context" + GLOW.uniqueId();
	that.alpha      			= parameters.alpha      			!== undefined ? parameters.alpha     				: true;
	that.depth      			= parameters.depth      			!== undefined ? parameters.depth     				: true;
	that.antialias 				= parameters.antialias 				!== undefined ? parameters.antialias 				: true;
	that.stencil 				= parameters.stencil 				!== undefined ? parameters.stencil 	 				: false;
	that.premultipliedAlpha 	= parameters.premultipliedAlpha 	!== undefined ? parameters.premultipliedAlpha		: true;
	that.preserveDrawingBuffer	= parameters.preserveDrawingBuffer	!== undefined ?	parameters.preserveDrawingBuffer	: false;
	that.width                  = parameters.width					!== undefined ? parameters.width					: window.innerWidth;
	that.height					= parameters.height					!== undefined ? parmaeters.height					: window.innerHeight;
	
	
	// create canvas and webgl context and register
	
	try {
		
		that.domElement	= document.createElement( 'canvas' );
		that.GL 		= that.canvas.getContext( 'webgl', { alpha: 				that.alpha, 
			 											 	 depth: 				that.depth, 
														 	 antialias: 			that.antialias,
														 	 stencil: 				that.stencil,
														 	 premultipliedAlpha: 	that.premultipliedAlpha,
														 	 preserveDrawingBuffer: that.preserveDrawingBuffer } );

		that.domElement.width  = that.width;
		that.domElement.height = that.height;
		
		that.GL.viewport( 0, 0, that.width, that.height );

	} catch( error ) {

		console.error( error );
		return;
		
	}

	GLOW.registerContext( that );
	
	
	//--- setup clear color ---
	
	that.setupClearColor = function( setup ) {
		
		var r = setup.red   !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : 0; 
		var g = setup.green !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : 0; 
		var b = setup.blue  !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : 0; 
		var a = setup.alpha !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : 0; 
		
		GL.clearColor( r, g, b, a );
		
		return that;
	}
	

	//--- enable blend ---
	
	that.enableBlend = function( flag, setup ) {
		
		if( flag ) {
			
			GL.enable( GL.BLEND );
			
			if( setup ) {
				
				that.setupBlend( setup );
				
			}
			
		} else {
			
			GL.disable( GL.BLEND );
		}
		
		return that;
	}
	
	
	//--- setup blend ---
	
	that.setupBlend = function( setup ) {
		
		if( setup.equationRGB ) {
			
			try {
				
				if( setup.equationAlpha ) GL.blendEquationSeparate( setup.equationRGB, setup.equationAlpha );
				if( setup.srcRGB        ) GL.blendFuncSeparate( setup.srcRGB, setup.dstRGB, setup.srcAlpha, setup.dstAlpha );
				
			} catch( error ) {
				
				console.error( "GLOW.Context.setupBlend: " + error );
				
			}
			
			
		} else {
			
			try {
				
				if( setup.equation ) GL.blendEquation( setup.equation );
				if( setup.src      ) GL.blendFunc( setup.src, setup.dst );
				
			} catch( error ) {
				
				console.error( "GLOW.Context.setupBlend: " + error );

			}
			
		}
		
		return that;
		
	}
	
	
	//--- enable depth test ---
	
	that.enableDepthTest = function( flag, setup ) {
		
		if( flag ) {
			
			GL.enable( GL.DEPTH_TEST );
			
			if( setup ) {
				
				that.setupDepthTest( setup );
				
			}
			
		} else {
			
			GL.disable( GL.DEPTH_TEST );
			
		}
		
		return that;
	}
	
	
	//--- setup depth test ---
	
	that.setupDepthTest = function( setup ) {
		
		try {
			
			// TODO
			
		} catch( error ) {
			
			console.log( "GLOW.Context.setupDepthTest: " + error );
			
		}
		
		return that;
	
	}
	
	
	//--- enable stencil test ---
	
	that.enableStencilTest = function( flag, setup ) {
		
		if( flag ) {
			
			GL.enable( GL.STENCIL_TEST );
			
			if( setup ) {
				
				that.setupStencilTest( setup );
				
			}
			
		} else {
			
			GL.disable( GL.STENCIL_TEST );
			
		}
		
		return that;
	}
	
	
	//--- setup stencil test ---
	
	that.setupStencilTest = function( setup ) {
		
		try {
			
			// TODO
			
		} catch( error ) {
			
			console.log( "GLOW.Context.setupStencilTest: " + error );
			
		}
		
		return that;
	
	}
	
	
	//--- enable culling ---
	
	that.enableCulling = function( flag, setup ) {
		
		if( flag ) {
			
			GL.enable( GL.CULL_FACE );
			
			if( setup ) {
				
				that.setupCulling( setup );
				
			}
			
		} else {
			
			GL.disable( GL.CULL_FACE );
			
		}
		
		return that;
	}


	//--- setup culling ---
	
	that.setupCulling = function( setup ) {
		
		try {
			
			if( setup.frontFace ) GL.frontFace( setup.frontFace );
			if( setup.cullFace  ) GL.cullFace ( setup.cullFace  );
			
		} catch( error ) {
			
			console.error( "GLOW.Context.setupCulling: " + error );
			
		}
		
		return that;
	
	}


	//--- enable scissor test ---

	that.enableScissorTest = function( flag, setup ) {
		
		if( flag ) {
	
			GL.enable( GL.SCISSOR_TEST );
			
			if( setup ) {
				
				that.setupScissorTest( setup );
				
			}
			
		} else {
			
			GL.disable( GL.SCISSOR_TEST );
		}
		
		return that;
		
	}


	//--- setup scissor test ---
	
	that.setupScissorTest = function( setup ) {
		
		// TODO
		
		return that;
		
	}


	//--- return public ---

	return that;
}


/*
* Context ID counter
*/

GLOW.ContextId = 0;