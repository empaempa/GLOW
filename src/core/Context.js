/*
* GLOW Context
*/

GLOW.Context = function( parameters ) {
	
	"use strict";
	
	if( parameters === undefined ) parameters = {};
	
	this.id                     = parameters.id                    !== undefined ? parameters.id                    : GLOW.uniqueId();
	this.alpha                  = parameters.alpha                 !== undefined ? parameters.alpha                 : true;
	this.depth                  = parameters.depth                 !== undefined ? parameters.depth                 : true;
	this.antialias              = parameters.antialias             !== undefined ? parameters.antialias             : true;
	this.stencil                = parameters.stencil               !== undefined ? parameters.stencil               : false;
	this.premultipliedAlpha     = parameters.premultipliedAlpha    !== undefined ? parameters.premultipliedAlpha    : true;
	this.preserveDrawingBuffer  = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;
	this.width                  = parameters.width                 !== undefined ? parameters.width                 : window.innerWidth;
	this.height                 = parameters.height                !== undefined ? parmaeters.height                : window.innerHeight;
	
	// create canvas and webgl context and register
	
	try {
		
		this.domElement = document.createElement( 'canvas' );
		this.GL         = this.domElement.getContext( 'experimental-webgl', { alpha:                 this.alpha, 
                                                                              depth:                 this.depth, 
                                                                              antialias:             this.antialias,
                                                                              stencil:               this.stencil,
                                                                              premultipliedAlpha:    this.premultipliedAlpha,
                                                                              preserveDrawingBuffer: this.preserveDrawingBuffer } );

		this.domElement.width  = this.width;
		this.domElement.height = this.height;
		this.GL.viewport( 0, 0, this.width, this.height );	// TODO: move into setupViewport

	} catch( error ) {

		console.error( "GLOW.Context.construct: " + error );
		return context;
	}

	GLOW.registerContext( this );

	this.cache = new GLOW.Cache();

	this.enableCulling( false );
	this.enableDepthTest( true, { func: GL.LEQUAL, write: true, zNear: 0, zFar: 1 } );
	this.enableBlend( false );
	this.setupClear( { clearBits: GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT } );
	this.clear();
}

/*
* Prototypes
*/

GLOW.Context.prototype.setupClear = function( setup ) {
	
	var r = setup.red   !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : 0; 
	var g = setup.green !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : 0; 
	var b = setup.blue  !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : 0; 
	var a = setup.alpha !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : 1;
	var d = setup.depth !== undefined ? Math.min( 1, Math.max( 0, setup.depth )) : 1;
	 
	GL.clearColor( r, g, b, a );
	GL.clearDepth( d );
	
	this.clearBits = setup.clearBits !== undefined ? setup.clearBits : this.clearBits;

	return this;
}

GLOW.Context.prototype.clear = function( bits ) {
	
	if( bits === undefined ) { bits = this.clearBits };
	GL.clear( bits );

	return this;
}

GLOW.Context.prototype.enableBlend = function( flag, setup ) {
	
	if( flag ) {

		GL.enable( GL.BLEND );
		if( setup ) this.setupBlend( setup );
		
	} else GL.disable( GL.BLEND );
	
	return this;
}

GLOW.Context.prototype.setupBlend = function( setup ) {
	
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
	
	return this;
}

GLOW.Context.prototype.enableDepthTest = function( flag, setup ) {
	
	if( flag ) {
		
		GL.enable( GL.DEPTH_TEST );
		if( setup ) this.setupDepthTest( setup );
	
	} else GL.disable( GL.DEPTH_TEST );
	
	return this;
}

GLOW.Context.prototype.setupDepthTest = function( setup ) {
	
	try {
		
		if( setup.func  !== undefined ) GL.depthFunc( setup.func );
		if( setup.write !== undefined ) GL.depthMask( setup.write );

		if( setup.zNear !== undefined && setup.zFar !== undefined && setup.zNear <= setup.zFar ) {
			GL.depthRange( Math.max( 0, Math.min( 1, setup.zNear )), Math.max( 0, Math.min( 1, setup.zFar )));
		}

	} catch( error ) { console.log( "GLOW.Context.setupDepthTest: " + error ); }
	
	return this;
}


GLOW.Context.prototype.enableStencilTest = function( flag, setup ) {
	
	if( flag ) {
		
		GL.enable( GL.STENCIL_TEST );
		if( setup ) this.setupStencilTest( setup );
	
	} else GL.disable( GL.STENCIL_TEST );
	
	return this;
}

GLOW.Context.prototype.setupStencilTest = function( setup ) {
	
	// TODO
	
	return this;
}

GLOW.Context.prototype.enableCulling = function( flag, setup ) {
	
	if( flag ) {

		GL.enable( GL.CULL_FACE );
		if( setup ) this.setupCulling( setup );

	} else GL.disable( GL.CULL_FACE );
	
	return this;
}

GLOW.Context.prototype.setupCulling = function( setup ) {
	
	try {

		if( setup.frontFace ) GL.frontFace( setup.frontFace );
		if( setup.cullFace  ) GL.cullFace ( setup.cullFace  );

	} catch( error ) {

		console.error( "GLOW.Context.setupCulling: " + error );
	}
	
	return this;
}

GLOW.Context.prototype.enableScissorTest = function( flag, setup ) {
	
	if( flag ) {

		GL.enable( GL.SCISSOR_TEST );
		if( setup ) this.setupScissorTest( setup );

	} else {
		
		GL.disable( GL.SCISSOR_TEST );
	}
	
	return this;
}

GLOW.Context.prototype.setupScissorTest = function( setup ) {
	
	// TODO
	
	return this;
}

GLOW.Context.prototype.setupViewport = function( setup ) {
	
	// TODO
	
	return this;
}
