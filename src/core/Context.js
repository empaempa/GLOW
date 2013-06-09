/*
* GLOW Context
*/

GLOW.Context = (function() {
    
    "use strict"; "use restrict";

    // constructor
    function GLOWContext( parameters ) {
        if( parameters === undefined ) parameters = {};

        this.id                     = parameters.id                    !== undefined ? parameters.id                    : GLOW.uniqueId();
        this.alpha                  = parameters.alpha                 !== undefined ? parameters.alpha                 : true;
        this.depth                  = parameters.depth                 !== undefined ? parameters.depth                 : true;
        this.antialias              = parameters.antialias             !== undefined ? parameters.antialias             : true;
        this.stencil                = parameters.stencil               !== undefined ? parameters.stencil               : false;
        this.premultipliedAlpha     = parameters.premultipliedAlpha    !== undefined ? parameters.premultipliedAlpha    : true;
        this.preserveDrawingBuffer  = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;
        this.width                  = parameters.width                 !== undefined ? parameters.width                 : window.innerWidth;
        this.height                 = parameters.height                !== undefined ? parameters.height                : window.innerHeight;
        this.cache                  = new GLOW.Cache();
        this.debug                  = parameters.debug                 !== undefined ? parameters.debug                 : false;
        
        if( parameters.context ) {
            this.GL = parameters.context;
            GLOW.registerContext( this );
        } else {
            try {
                this.domElement = document.createElement( 'canvas' );
                
                if( this.debug && window.WebGLDebugUtils ) {
                    this.domElement = WebGLDebugUtils.makeLostContextSimulatingCanvas( this.domElement );
                }
                
                this.GL = this.domElement.getContext( 'experimental-webgl', { alpha:                 this.alpha, 
                                                                              depth:                 this.depth, 
                                                                              antialias:             this.antialias,
                                                                              stencil:               this.stencil,
                                                                              premultipliedAlpha:    this.premultipliedAlpha,
                                                                              preserveDrawingBuffer: this.preserveDrawingBuffer } );
            } catch( error ) {
                GLOW.error( "GLOW.Context.construct: " + error );
            }

            if( this.GL !== null ) {
                GLOW.registerContext( this );

                this.domElement.width  = this.width;
                this.domElement.height = this.height;

                if( parameters.viewport ) {
                    this.viewport = {
                        x:      parameters.viewport.x      !== undefined ? parameters.viewport.x      : 0,
                        y:      parameters.viewport.y      !== undefined ? parameters.viewport.y      : 0,
                        width:  parameters.viewport.width  !== undefined ? parameters.viewport.width  : this.width,
                        height: parameters.viewport.height !== undefined ? parameters.viewport.height : this.height
                    };
                } else {
                    this.viewport = { x: 0, y: 0, width: this.width, height: this.height };
                }

                if( parameters.clear ) {
                    this.clearSettings = {
                        r:     parameters.clear.red   !== undefined ? parameters.clear.red   : 0,
                        g:     parameters.clear.green !== undefined ? parameters.clear.green : 0,
                        b:     parameters.clear.blue  !== undefined ? parameters.clear.blue  : 0,
                        a:     parameters.clear.alpha !== undefined ? parameters.clear.alpha : 1,
                        depth: parameters.clear.depth !== undefined ? parameters.clear.depth : 1,
                        bits:  parameters.clear.bits  !== undefined ? parameters.clear.bits  : -1
                    };

                    if( this.clearSettings.bits === -1 ) {
                        this.clearSettings.bits  = GL.COLOR_BUFFER_BIT;
                        this.clearSettings.bits |= this.depth   ? GL.DEPTH_BUFFER_BIT   : 0;
                        this.clearSettings.bits |= this.stencil ? GL.STENCIL_BUFFER_BIT : 0;
                    }
                } else {
                    this.clearSettings = { r: 0, g: 0, b: 0, a: 1, depth: 1, bits: 0 };
                    this.clearSettings.bits  = GL.COLOR_BUFFER_BIT;
                    this.clearSettings.bits |= this.depth   ? GL.DEPTH_BUFFER_BIT   : 0;
                    this.clearSettings.bits |= this.stencil ? GL.STENCIL_BUFFER_BIT : 0;
                }

                this.enableCulling( true, { frontFace: GL.CCW, cullFace: GL.BACK } );
                this.enableDepthTest( true, { func: GL.LEQUAL, write: true, zNear: 0, zFar: 1 } );
                this.enableBlend( false );
                this.setViewport();
                this.clear();
            } else {
                GLOW.error( "GLOW.Context.construct: unable to initialize WebGL" );
            }
        }
    }
    
    
    // methods
    
    GLOWContext.prototype.setupClear = function( setup ) {
        if( setup !== undefined ) {
            this.clearSettings.r     = setup.red   !== undefined ? Math.min( 1, Math.max( 0, setup.red   )) : this.clearSettings.r; 
            this.clearSettings.g     = setup.green !== undefined ? Math.min( 1, Math.max( 0, setup.green )) : this.clearSettings.g; 
            this.clearSettings.b     = setup.blue  !== undefined ? Math.min( 1, Math.max( 0, setup.blue  )) : this.clearSettings.b; 
            this.clearSettings.a     = setup.alpha !== undefined ? Math.min( 1, Math.max( 0, setup.alpha )) : this.clearSettings.a;
            this.clearSettings.depth = setup.depth !== undefined ? Math.min( 1, Math.max( 0, setup.depth )) : this.clearSettings.depth;
            this.clearSettings.bits  = setup.bits  !== undefined ? setup.bits : this.clearSettings.bits;
        }

        GL.clearColor( this.clearSettings.r, this.clearSettings.g, this.clearSettings.b, this.clearSettings.a );
        GL.clearDepth( this.clearSettings.depth );
        return this;
    };

    GLOWContext.prototype.clear = function( setup ) {
        this.setupClear( setup );
        GL.clear( this.clearSettings.bits );
        return this;
    };
    
    GLOWContext.prototype.enableBlend = function( flag, setup ) {
        if( flag ) {
            GL.enable( GL.BLEND );
            if( setup ) this.setupBlend( setup );
        } else GL.disable( GL.BLEND );
        return this;
    };

    GLOWContext.prototype.setupBlend = function( setup ) {
        if( setup.equationRGB ) {
            if( setup.equationAlpha ) GL.blendEquationSeparate( setup.equationRGB, setup.equationAlpha );
            if( setup.srcRGB        ) GL.blendFuncSeparate( setup.srcRGB, setup.dstRGB, setup.srcAlpha, setup.dstAlpha );
        } else {
            if( setup.equation ) GL.blendEquation( setup.equation );
            if( setup.src      ) GL.blendFunc( setup.src, setup.dst );
        }
        return this;
    };

    GLOWContext.prototype.enableDepthTest = function( flag, setup ) {
        if( flag ) {
            GL.enable( GL.DEPTH_TEST );
            if( setup ) this.setupDepthTest( setup );
        } else GL.disable( GL.DEPTH_TEST );
        return this;
    };

    GLOWContext.prototype.setupDepthTest = function( setup ) {
        if( setup.func  !== undefined ) GL.depthFunc( setup.func );
        if( setup.write !== undefined ) GL.depthMask( setup.write );
        if( setup.zNear !== undefined && setup.zFar !== undefined && setup.zNear <= setup.zFar ) {
            GL.depthRange( Math.max( 0, Math.min( 1, setup.zNear )), Math.max( 0, Math.min( 1, setup.zFar )));
        }
        return this;
    };

    GLOWContext.prototype.enablePolygonOffset = function( flag, setup ) {
        if( flag ) {
            GL.enable( GL.POLYGON_OFFSET_FILL );
            if( setup ) this.setupPolygonOffset( setup );
        } else GL.disable( GL.POLYGON_OFFSET_FILL );
        return this;
    };
    
    GLOWContext.prototype.setupPolygonOffset = function( setup ) {
        if( setup.factor && setup.units ) GL.polygonOffset( setup.factor, setup.units );
    };

    GLOWContext.prototype.enableStencilTest = function( flag, setup ) {
        if( flag ) {
            GL.enable( GL.STENCIL_TEST );
            if( setup ) this.setupStencilTest( setup );
        } else GL.disable( GL.STENCIL_TEST );
        return this;
    };

    GLOWContext.prototype.setupStencilTest = function( setup ) {
        if( setup.func && setup.funcFace ) {
            GL.stencilFuncSeparate( setup.funcFace, setup.func, setup.funcRef, setup.funcMask );
        } else if( setup.func ) {
            GL.stencilFunc( setup.func, setup.funcRef, setup.funcMask );
        }
        
        if( setup.mask && setup.maskFace ) {
            GL.stencilMaskSeparate( setup.maskFace, setup.mask );
        } else if( setup.mask ) {
            GL.stencilMask( setup.mask );
        }

        if( setup.opFail && setup.opFace ) {
            GL.stencilOpSeparate( setup.opFace, setup.opFail, setup.opZfail, setup.opZpass );
        } else if( setup.opFail ) {
            GL.stencilOp( setup.opFail, setup.opZfail, setup.opZpass );
        }
        return this;
    };

    GLOWContext.prototype.enableCulling = function( flag, setup ) {
        if( flag ) {
            GL.enable( GL.CULL_FACE );
            if( setup ) this.setupCulling( setup );
        } else GL.disable( GL.CULL_FACE );
        return this;
    };

    GLOWContext.prototype.setupCulling = function( setup ) {
        try {
            if( setup.frontFace ) GL.frontFace( setup.frontFace );
            if( setup.cullFace  ) GL.cullFace ( setup.cullFace  );
        } catch( error ) {
            GLOW.error( "GLOW.Context.setupCulling: " + error );
        }
        return this;
    };

    GLOWContext.prototype.enableScissor = function( flag, setup ) {
        if( flag ) {
            GL.enable( GL.SCISSOR_TEST );
            if( setup ) this.setupScissor( setup );
        } else {
            GL.disable( GL.SCISSOR_TEST );
        }
        return this;
    };

    GLOWContext.prototype.setupScissor = function( setup ) {
        try {
            GL.scissor( setup.x, setup.y, setup.width, setup.height );
        } catch( error ) {
            GLOW.error( "GLOW.Context.setupScissorTest: " + error );
        } 
        return this;
    };

    GLOWContext.prototype.setViewport = function() {
        this.setupViewport();
    };

    GLOWContext.prototype.setupViewport = function( setup ) {
        if( setup ) {
            this.viewport.x      = setup.x      !== undefined ? setup.x      : this.viewport.x;
            this.viewport.y      = setup.y      !== undefined ? setup.y      : this.viewport.y;
            this.viewport.width  = setup.width  !== undefined ? setup.width  : this.viewport.width;
            this.viewport.height = setup.height !== undefined ? setup.height : this.viewport.height;
        }
        GL.viewport( this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height );
        return this;
    };

    GLOWContext.prototype.availableExtensions = function() {
        return GL.getSupportedExtensions();
    };
    
    GLOWContext.prototype.enableExtension = function( extensionName ) {
        var availableExtensions = GL.getSupportedExtensions();
        for( var a = 0, al = availableExtensions.length; a < al; a++ ) {
            if( extensionName.toLowerCase() === availableExtensions[ a ].toLowerCase())
                break;
        }
                
        if( a !== al ) {
            return GL.getExtension( availableExtensions[ a ] );
        } else {
            return undefined;
        }
    };
    
    GLOWContext.prototype.getParameter = function( parameter ) {
        return GL.getParameter( parameter );
    };
    
    GLOWContext.prototype.maxVertexTextureImageUnits = function() {
        return this.getParameter( GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
    };

    GLOWContext.prototype.resize = function( newWidth, newHeight ) {

        var widthFactor  = newWidth  / this.width;
        var heightFactor = newHeight / this.height; 

        this.viewport.width  = this.viewport.width  * widthFactor;
        this.viewport.height = this.viewport.height * heightFactor; 

        this.domElement.width  = this.width  = newWidth;
        this.domElement.height = this.height = newHeight;
    };
    
    return GLOWContext;
})();


