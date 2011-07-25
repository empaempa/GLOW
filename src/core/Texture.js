GLOW.Texture = (function() {
	
	"use strict"; "use restrict";

    var cubeSideNames = [ "posX", "negX", "posY", "negY", "posZ", "negZ" ];
    var cubeSideOffsets = { "posX":0, "negX":1, "posY":2, "negY":3, "posZ":4, "negZ":5 };
	
	// constructor
	function GLOWTexture( parameters ) {
    	if( parameters.url ) {
        	this.url = parameters.url;
        	var lowerCaseURL = this.url.toLowerCase();
        	if( lowerCaseURL.indexOf( ".jpg" ) !== -1 || 
                lowerCaseURL.indexOf( ".png" ) !== -1 ||
                lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                this.image = new Image();
            } else {
                this.video = document.createElement( "video" );
                if( parameters.autoUpdate !== undefined && parameters.autoUpdate.video === undefined ) {
                    parameters.autoUpdate.video = true;
                } else {
                    parameters.autoUpdate = { video: true };
                }
            }
    	} else if( parameters.image ) {
    	    this.image = parameters.image;
    	} else if( parameters.canvas ) {
    	    this.canvas = parameters.canvas;
    	} else if( parameters.video ) {
    	    this.video = parameters.video;
            this.autoUpdate = true;
    	} else if( parameters.buffer ) {
    	    this.buffer = parameters.buffer;
    	    this.width  = parameters.width;
    	    this.height = parameters.height;
    	} else if( parameters.cube ) {
	        this.cube = [];
    	    for( var c = 0; c < cubeSideNames.length; c++ ) {
    	        var side = parameters.cube[ cubeSideNames[ c ]];
    	        if( typeof( side ) === "string" ) {
                	var lowerCaseURL = side.toLowerCase();
                	if( lowerCaseURL.indexOf( ".jpg" ) !== -1 || 
                        lowerCaseURL.indexOf( ".png" ) !== -1 ||
                        lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                        lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                        this.cube.push( { type: "imageURL", url: side, image: new Image() } );
                    } else {
                        this.cube.push( { type: "videoURL", url: side, video: document.createElement( "video" ) } );
                        if( parameters.autoUpdate !== undefined && parameters.autoUpdate[ cubeSideNames[ c ]] === undefined ) {
                            parameters.autoUpdate[ cubeSideNames[ c ]] = true;
                        } else {
                            parameters.autoUpdate = {};
                            parameters.autoUpdate[ cubeSideNames[ c ]] = true;
                        }
                    }
	            } else if( side instanceof HTMLImageElement ) {
	                this.cube.push( { type: "image", image: image } );
    	        } else if( side instanceof HTMLCanvasElement ) {
	                this.cube.push( { type: "canvas", canvas: side } );
	            } else if( side instanceof HTMLVideoElement ) {
	                this.cube.push( { type: "video", video: side } );
    	        } else if( side instanceof Uint8Array ) {
    	            this.cube.push( { type: "buffer", buffer: side, width: parameters.width, height: parameters.height } );
	            }
    	    }

    	    if( this.cube.length !== 6 ) {
    	        console.error( "GLOW.Texture: Couldn't find data for all six sides of the cube. Quitting." );
    	        return;
    	    }
    	    
    	    for( c = 0; c < this.cube.length; c++ ) {
    	        this.cube[ cubeSideNames[ c ]] = this.cube[ c ];
    	    }
    	} else {
    	    console.error( "GLOW.Texture: invalid parameters - missing pixel data. Quitting." );
    	    return;
    	}
    	
    	this.id = GLOW.uniqueId();
        this.autoUpdate = parameters.autoUpdate;
    	this.internalFormat = parameters.internalFormat !== undefined ? parameters.internalFormat : GL.RGBA;
    	this.format = parameters.format !== undefined ? parameters.format : GL.RGBA;
    	this.type = parameters.type !== undefined ? parameters.type : GL.UNSIGNED_BYTE;
    	this.wrapS = parameters.wrapS !== undefined ? parameters.wrapS : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.wrapT = parameters.wrapT !== undefined ? parameters.wrapT : parameters.wrap !== undefined ? parameters.wrap : GL.REPEAT;
    	this.magFilter = parameters.magFilter !== undefined ? parameters.magFilter : GL.LINEAR;
    	this.minFilter = parameters.minFilter !== undefined ? parameters.minFilter : GL.LINEAR_MIPMAP_LINEAR;
    	this.textureUnit = -1;
    	this.textureType = this.cube === undefined ? GL.TEXTURE_2D : GL.TEXTURE_CUBE_MAP;
    	this.texture = undefined;
	}

	// methods
    GLOWTexture.prototype.init = function( textureUnit ) {
    	this.textureUnit = textureUnit;
    	if( this.cube === undefined ) {
        	if( this.url ) {
        	    if( this.image ) {
        	        this.image.scope = this;
            	    this.image.onload = this.onLoadImage;
            	    this.image.src = this.url;
        	    } else {
        	        this.video.scope = this;
            		this.video.addEventListener( "loadeddata", this.onLoadVideo, false );
            	    this.video.src = this.url;
        	    }
        	} else {
        	    this.createTexture();
        	}
    	} else {
    	    this.itemsToLoad = 0;
    	    for( var c = 0; c < 6; c++ ) {
    	        if( this.cube[ c ].url !== undefined ) {
    	            this.itemsToLoad++;
    	        }
    	    }
    	    
    	    if( this.itemsToLoad === 0 ) {
    	        this.createTexture();
    	    } else {
        	    for( c = 0; c < 6; c++ ) {
        	        if( this.cube[ c ].type === "imageURL" ) {
        	            this.cube[ c ].type = "image";
        	            this.cube[ c ].image.scope = this;
        	            this.cube[ c ].image.onload = this.onLoadCubeImage;
        	            this.cube[ c ].image.src = this.cube[ c ].url;
        	        } else if( this.cube[ c ].type === "videoURL" ) {
        	            this.cube[ c ].type = "video";
        	            this.cube[ c ].video.scope = this;
        	            this.cube[ c ].video.addEventListener( "loadeddata", this.onLoadCubeVideo, false );
        	            this.cube[ c ].video.src = this.cube[ c ].url;
        	        }
        	    }
    	    }
    	}
    };
    
    GLOWTexture.prototype.createTexture = function() {
       	this.texture = GL.createTexture();
    	GL.bindTexture( this.textureType, this.texture );

    	if( this.textureType === GL.TEXTURE_2D ) {
        	if( this.image ) {
            	GL.texImage2D( this.textureType, 0, this.internalFormat, this.format, this.type, this.image );
        	} else if( this.video ) {
            	GL.texImage2D( this.textureType, 0, this.internalFormat, this.format, this.type, this.video );
        	} else if( this.canvas ) {
            	GL.texImage2D( this.textureType, 0, this.internalFormat, this.format, this.type, this.canvas );
        	} else if( this.buffer ) {
            	GL.texImage2D( this.textureType, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.buffer );
        	}
    	} else {
    	    for( var c = 0; c < 6; c++ ) {
    	        if( this.cube[ c ].type === "image" ) {
                	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + c, 0, this.internalFormat, this.format, this.type, this.cube[ c ].image );
    	        } else if( this.cube[ c ].type === "video" ) {
                	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + c, 0, this.internalFormat, this.format, this.type, this.cube[ c ].video );
    	        } else if( this.cube[ c ].type === "canvas" ) {    	            
                	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + c, 0, this.internalFormat, this.format, this.type, this.cube[ c ].canvas );
    	        } else if( this.cube[ c ].type === "buffer" ) { 
                	GL.texImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + c, 0, this.internalFormat, this.cube[ c ].width, this.cube[ c ].height, 0, this.format, this.type, this.cube[ c ].buffer );
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
            if( this.video ) {
                GL.texSubImage2D( this.textureType, level, xOffset, yOffset, this.format, this.type, this.video );
            } else if( this.buffer ) {
                GL.texSubImage2D( this.textureType, level, xOffset, yOffset, this.width, this.height, this.format, this.type, this.buffer );
            } else if( this.canvas ) {
                GL.texSubImage2D( this.textureType, level, xOffset, yOffset, this.format, this.type, this.canvas );
            } else if( this.image ) {
                GL.texSubImage2D( this.textureType, level, xOffset, yOffset, this.format, this.type, this.image );
            }
        } else {
            for( var a in parameters ) {
                if( cubeSideOffsets[ a ] ) {
                    var c = cubeSideOffsets[ a ];
    	            if( this.cube[ c ].type === "video" ) {
                	    GL.texSubImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + c, level, xOffset, yOffset, this.format, this.type, this.cube[ c ].video );
        	        } else if( this.cube[ c ].type === "buffer" ) { 
                    	GL.texSubImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + c, level, xOffset, yOffset, this.cube[ c ].width, this.cube[ c ].height, this.format, this.type, this.cube[ c ].buffer );
        	        } else if( this.cube[ c ].type === "canvas" ) {    	            
                    	GL.texSubImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + c, level, xOffset, yOffset, this.format, this.type, this.cube[ c ].canvas );
        	        } else if( this.cube[ c ].type === "image" ) {
                    	GL.texSubImage2D( GL.TEXTURE_CUBE_MAP_POSITIVE_X + c, level, xOffset, yOffset, this.format, this.type, this.cube[ c ].image );
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
	return GLOWTexture;
})();
