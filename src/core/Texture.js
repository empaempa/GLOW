GLOW.Texture = (function() {
	
	"use strict"; "use restrict";

    var cubeSideOffsets = { "posX":0, "negX":1, "posY":2, "negY":3, "posZ":4, "negZ":5 };
	
	// constructor
	function GLOWTexture( parameters ) {
        if( parameters.url !== undefined ) {
            parameters.data = parameters.url;
        }
    	
    	this.id = GLOW.uniqueId();
        this.data = parameters.data;
        this.autoUpdate = parameters.autoUpdate;
    	this.internalFormat = parameters.internalFormat !== undefined ? parameters.internalFormat : GL.RGBA;
    	this.format = parameters.format !== undefined ? parameters.format : GL.RGBA;
    	this.type = parameters.type !== undefined ? parameters.type : GL.UNSIGNED_BYTE;
    	this.wrapS = parameters.wrapS !== undefined ? parameters.wrapS : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.wrapT = parameters.wrapT !== undefined ? parameters.wrapT : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.magFilter = parameters.magFilter !== undefined ? parameters.magFilter : GL.LINEAR;
    	this.minFilter = parameters.minFilter !== undefined ? parameters.minFilter : GL.LINEAR_MIPMAP_LINEAR;
	    this.width  = parameters.width;
	    this.height = parameters.height;
    	this.textureUnit = -1;
    	this.texture = undefined;
	}

	// methods
    GLOWTexture.prototype.init = function( textureUnit ) {
    	this.textureUnit = textureUnit;
    	
    	if( typeof( this.data ) === "string" ) {
        	this.textureType = GL.TEXTURE_2D;
            var originalURL  = this.data;
        	var lowerCaseURL = originalURL.toLowerCase();
        	if( lowerCaseURL.indexOf( ".jpg" ) !== -1 || 
                lowerCaseURL.indexOf( ".png" ) !== -1 ||
                lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                this.data = new Image();
    	        this.data.scope = this;
        	    this.data.onload = this.onLoadImage;
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
    	           this.data instanceof Uint8Array ) {
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
	                console.error( "GLOW.Texture.init: data type error. Did you forget cube map " + c + "? If not, the data type is not supported" );
	            }
    	    }
    	    
    	    if( this.itemsToLoad === 0 ) {
    	        this.createTexture();
    	    } else {
        	    for( var c in cubeSideOffsets ) {
    	            if( typeof( this.data[ c ] ) === "string" ) {
        	            var originalURL  = this.data[ c ];
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
    };
    
    GLOWTexture.prototype.createTexture = function() {
       	this.texture = GL.createTexture();
    	GL.bindTexture( this.textureType, this.texture );

    	if( this.textureType === GL.TEXTURE_2D ) {
        	if( this.data instanceof Uint8Array ) {
        	    if( this.width !== undefined && this.height !== undefined ) {
                	GL.texImage2D( this.textureType, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.data );
        	    } else {
        	        console.error( "GLOW.Texture.createTexture: Textures of type Uint8Array requires width and height parameters. Quitting." );
        	        return;
        	    }
        	} else {
            	GL.texImage2D( this.textureType, 0, this.internalFormat, this.format, this.type, this.data );
        	}
    	} else {
    	    for( var c in cubeSideOffsets ) {
    	        if( this.data[ c ] instanceof Uint8Array ) {
            	    if( this.width !== undefined && this.height !== undefined ) {
                    	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.data[ c ] );
            	    } else {
            	        console.error( "GLOW.Texture.createTexture: Textures of type Uint8Array requires width and height parameters. Quitting." );
            	        return;
            	    }
    	        } else {
                	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + cubeSideOffsets[ c ], 0, this.internalFormat, this.format, this.type, this.data[ c ] );
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
    };
    
    GLOWTexture.prototype.updateTexture = function( parameters ) {
        parameters = parameters !== undefined ? parameters : {};
        
        var level = parameters.level !== undefined ? parameters.level : 0;
        var xOffset = parameters.xOffset !== undefined ? parameters.xOffset : 0;
        var yOffset = parameters.yOffset !== undefined ? parameters.yOffset : 0;
        var updateMipmap = parameters.updateMipmap !== undefined ? parameters.updateMipmap : true;
        
        if( !GLOW.currentContext.cache.textureCached( this )) {
            GL.bindTexture( this.textureType, this.texture );
        }

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
    }

    GLOWTexture.prototype.onLoadImage = function() {
    	this.scope.createTexture();
    };
    
    GLOWTexture.prototype.onLoadCubeImage = function() {
        this.scope.itemsToLoad--;
        if( this.scope.itemsToLoad === 0 ) {
            this.scope.createTexture();
        }
    }
    
    GLOWTexture.prototype.onLoadVideo = function() {
		this.removeEventListener( "loadeddata", this.onLoadVideo, false );
        this.scope.createTexture();
    }

    GLOWTexture.prototype.onLoadCubeVideo = function() {
		this.removeEventListener( "loadeddata", this.onLoadVideo, false );
        this.scope.itemsToLoad--;
        if( this.scope.itemsToLoad === 0 ) {
            this.scope.createTexture();
        }
    }
    
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
    }
    
	return GLOWTexture;
})();
