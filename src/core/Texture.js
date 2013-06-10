GLOW.Texture = (function() {
    
    "use strict"; "use restrict";

    var cubeSideOffsets = { "posX":0, "negX":1, "posY":2, "negY":3, "posZ":4, "negZ":5 };
    
    // constructor
    function GLOWTexture( parameters ) {
        if( parameters.url !== undefined ) {
            parameters.data = parameters.url;
        }
        
        this.id             = GLOW.uniqueId();
        this.data           = parameters.data;
        this.autoUpdate     = parameters.autoUpdate;
        this.internalFormat = parameters.internalFormat || GL.RGBA;
        this.format         = parameters.format         || GL.RGBA;
        this.type           = parameters.type           || GL.UNSIGNED_BYTE;
        this.wrapS          = parameters.wrapS          || parameters.wrap || GL.REPEAT;
        this.wrapT          = parameters.wrapT          || parameters.wrap || GL.REPEAT;
        this.magFilter      = parameters.magFilter      || parameters.filter || GL.LINEAR;
        this.minFilter      = parameters.minFilter      || parameters.filter || GL.LINEAR_MIPMAP_LINEAR;
        this.width          = parameters.width;
        this.height         = parameters.height;
        this.onLoadComplete = parameters.onLoadComplete;
        this.onLoadError    = parameters.onLoadError;
        this.onLoadContext  = parameters.onLoadContext;
        this.texture        = undefined;
        this.flipY          = parameters.flipY || 0;    // default - no flip
	}

    // methods
    GLOWTexture.prototype.init = function() {
        if( this.texture !== undefined ) return this;

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, this.flipY);

        if( this.data === undefined && 
            this.width !== undefined && 
            this.height !== undefined ) {
                
            if( this.type === GL.UNSIGNED_BYTE ) 
                this.data = new Uint8Array( this.width * this.height * ( this.format === GL.RGBA ? 4 : 3 ));
            else
                this.data = new Float32Array( this.width * this.height * ( this.format === GL.RGBA ? 4 : 3 ));
            
        } else if( typeof( this.data ) === "string" ) {
            this.textureType = GL.TEXTURE_2D;
            var originalURL  = this.data;
            var lowerCaseURL = originalURL.toLowerCase();
            if( lowerCaseURL.indexOf( ".jpg" ) !== -1 || 
                lowerCaseURL.indexOf( ".png" ) !== -1 ||
                lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                this.data = new Image();
                this.data.scope = this;
                this.data.onerror = this.onLoadError;
                this.data.onload  = this.onLoadImage;
                this.data.src = originalURL;
            } else {
                if( this.autoUpdate === undefined ) {
                    this.autoUpdate = true;
                }
                this.data = document.createElement( "video" );
                this.data.scope = this;
                this.data.addEventListener( "loadeddata", this.onLoadVideo, false );
                this.data.src = originalURL;
            }
        } else if( this.data instanceof HTMLImageElement ||
                   this.data instanceof HTMLVideoElement ||
                   this.data instanceof HTMLCanvasElement ||
                   this.data instanceof Uint8Array ||
                   this.data instanceof Float32Array ) {
            this.textureType = GL.TEXTURE_2D;
            this.createTexture();
        // cube map
        } else {
            this.textureType = GL.TEXTURE_CUBE_MAP;
            this.itemsToLoad = 0;
            for( var c in cubeSideOffsets ) {
                if( this.data[ c ] !== undefined ) {
                    if( typeof( this.data[ c ] ) === "string" ) {
                        this.itemsToLoad++;
                    }
                } else {
                    GLOW.error( "GLOW.Texture.init: data type error. Did you forget cube map " + c + "? If not, the data type is not supported" );
                }
            }
            
            if( this.itemsToLoad === 0 ) {
                this.createTexture();
            } else {
                for( var c in cubeSideOffsets ) {
                    if( typeof( this.data[ c ] ) === "string" ) {
                        var originalURL  = this.data[ c ];
                        var lowerCaseURL = originalURL.toLowerCase();
                        if( lowerCaseURL.indexOf( ".jpg" ) !== -1 || 
                            lowerCaseURL.indexOf( ".png" ) !== -1 ||
                            lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                            lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                            this.data[ c ] = new Image();
                            this.data[ c ].scope = this;
                            this.data[ c ].onload = this.onLoadCubeImage;
                            this.data[ c ].src = originalURL;
                        } else {
                            if( this.autoUpdate !== undefined ) {
                                this.autoUpdate[ c ] = this.autoUpdate[ c ] !== undefined ? this.autoUpdate[ c ] : true;
                            } else {
                                this.autoUpdate = {};
                                this.autoUpdate[ c ] = true;
                            }
                            this.data[ c ] = document.createElement( "video" );
                            this.data[ c ].scope = this;
                            this.data[ c ].addEventListener( "loadeddata", this.onLoadCubeVideo, false );
                            this.data[ c ].src = originalURL;
                        }
                    }
                }
            }
        }

        return this;
    };
    
    GLOWTexture.prototype.createTexture = function() {

        if( this.texture !== undefined ) {
            GL.deleteTexture( this.texture );
        }

        this.texture = GL.createTexture();
        GL.bindTexture( this.textureType, this.texture );

        if( this.textureType === GL.TEXTURE_2D ) {
            if( this.data instanceof Uint8Array || this.data instanceof Float32Array) {
                if( this.width !== undefined && this.height !== undefined ) {
                    GL.texImage2D( this.textureType, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.data );
                } else {
                    GLOW.error( "GLOW.Texture.createTexture: Textures of type Uint8Array/Float32Array requires width and height parameters. Quitting." );
                    return;
                }
            } else {
                GL.texImage2D( this.textureType, 0, this.internalFormat, this.format, this.type, this.data );
            }
        } else {
            for( var c in cubeSideOffsets ) {
                if( this.data[ c ] instanceof Uint8Array || this.data[ c ] instanceof Float32Array ) {
                    if( this.width !== undefined && this.height !== undefined ) {
                        GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.data[ c ] );
                    } else {
                        GLOW.error( "GLOW.Texture.createTexture: Textures of type Uint8Array/Float32Array requires width and height parameters. Quitting." );
                        return;
                    }
                } else {
                    GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], 0, this.internalFormat, this.format, this.type, this.data[ c ] );
                }
            }
        }

        GL.texParameteri( this.textureType, GL.TEXTURE_WRAP_S, this.wrapS );
        GL.texParameteri( this.textureType, GL.TEXTURE_WRAP_T, this.wrapT );
        GL.texParameteri( this.textureType, GL.TEXTURE_MIN_FILTER, this.minFilter );
        GL.texParameteri( this.textureType, GL.TEXTURE_MAG_FILTER, this.magFilter );

        if( this.minFilter !== GL.NEAREST && this.minFilter !== GL.LINEAR ) {
            GL.generateMipmap( this.textureType );
        }

        return this;
    };
    
    GLOWTexture.prototype.updateTexture = function( parameters ) {

        if( this.texture === undefined ) return;

        parameters = parameters !== undefined ? parameters : {};
        
        var level        = parameters.level   || 0;
        var xOffset      = parameters.xOffset || 0;
        var yOffset      = parameters.yOffset || 0;
        var updateMipmap = parameters.updateMipmap !== undefined ? parameters.updateMipmap : true;
        this.data = parameters.data || this.data;

        GL.bindTexture( this.textureType, this.texture );

        if( this.textureType == GL.TEXTURE_2D ) {
            if( this.data instanceof Uint8Array ) {
                GL.texSubImage2D( this.textureType, level, xOffset, yOffset, this.width, this.height, this.format, this.type, this.data );
            } else {
                GL.texSubImage2D( this.textureType, level, xOffset, yOffset, this.format, this.type, this.data );
            }
        } else {
            for( var c in parameters ) {
                if( cubeSideOffsets[ c ] !== undefined ) {
                    if( this.data[ c ] instanceof Uint8Array ) {
                        GL.texSubImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], level, xOffset, yOffset, this.width, this.height, this.format, this.type, this.data[ c ] );
                    } else { 
                        GL.texSubImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], level, xOffset, yOffset, this.format, this.type, this.data[ c ] );
                    }
                }
            }
        }

        if( this.minFilter !== GL.NEAREST && this.minFilter !== GL.LINEAR && updateMipmap === true ) {
            GL.generateMipmap( this.textureType );
        }
    };
    
    GLOWTexture.prototype.swapTexture = function( data ) {
        this.dispose();
        this.data = data;
        this.init();
    };
    
    GLOWTexture.prototype.onLoadImage = function() {
        this.scope.createTexture();
        
        if( this.scope.onLoadComplete ) {
            this.scope.onLoadComplete.call( this.scope.onLoadContext, this.scope );
        }
    };
    
    GLOWTexture.prototype.onLoadError = function() {
        if( this.scope.onLoadError ) {
            this.scope.onLoadError.call( this.scope.onLoadContext, this.scope );
        }
    };
    
    GLOWTexture.prototype.onLoadCubeImage = function() {
        this.scope.itemsToLoad--;
        if( this.scope.itemsToLoad === 0 ) {
            this.scope.createTexture();
        }
    };
    
    GLOWTexture.prototype.onLoadVideo = function() {
        this.removeEventListener( "loadeddata", this.scope.onLoadVideo, false );
        this.scope.createTexture();
    };

    GLOWTexture.prototype.onLoadCubeVideo = function() {
        this.removeEventListener( "loadeddata", this.scope.onLoadVideo, false );
        this.scope.itemsToLoad--;
        if( this.scope.itemsToLoad === 0 ) {
            this.scope.createTexture();
        }
    };
    
    GLOWTexture.prototype.play = function() {
        if( this.textureType === GL.TEXTURE_2D ) {
            if( this.data instanceof HTMLVideoElement ) {
                this.data.play();
            }
        } else {
            for( var c in cubeSideOffsets ) {
                if( this.data[ c ] instanceof HTMLVideoElement ) {
                    this.data[ c ].play();
                }
            }
        }
    };

    GLOWTexture.prototype.dispose = function() {
        if( this.texture !== undefined ) {
            GL.deleteTexture( this.texture );
            this.texture = undefined;
        } 
        this.data = undefined;
    };
    
    return GLOWTexture;
})();
