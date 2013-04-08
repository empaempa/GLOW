/*
* Shader Compiled Data
* @author: Mikael Emtinger, gomo.se
*/

GLOW.CompiledData = (function() {
    
    "use strict"; "use restrict";
    
    // private data, functions and initializations here

    // constructor
    
    function GLOWCompiledData( program, uniforms, attributes, interleavedAttributes, elements ) {
        this.id                        = GLOW.uniqueId();
        this.program                   = program;
        this.uniforms                  = uniforms || {};
        this.attributes                = attributes || {};
        this.interleavedAttributes     = interleavedAttributes || {};
        this.elements                  = elements;
        this.uniformArray              = undefined;
        this.attributeArray            = undefined;
        this.interleavedAttributeArray = undefined;

        this.createArrays();
    }

    // methods
    GLOWCompiledData.prototype.createArrays = function() {
        this.uniformArray              = [];
        this.attributeArray            = [];
        this.interleavedAttributeArray = [];

        var u, a, i;
        for( u in this.uniforms ) {
            this.uniformArray.push( this.uniforms[ u ] );
        }

        for( a in this.attributes ) {
            this.attributeArray.push( this.attributes[ a ] );
        }

        for( i in this.interleavedAttributes ) {
            this.interleavedAttributeArray.push( this.interleavedAttributes[ i ] );
        }
    }

    GLOWCompiledData.prototype.clone = function( except ) {
    	var clone = new GLOW.CompiledData();
    	except = except || {};

    	var u;
    	for( u in this.uniforms ) {
    		if( except[ u ] ) {
                if( except[ u ] instanceof GLOW.Uniform ) {
                    clone.uniforms[ u ] = except[ u ];
                } else {
                    clone.uniforms[ u ] = new GLOW.Uniform( this.uniforms[ u ], except[ u ] );
                    if( clone.uniforms[ u ].type === GL.SAMPLER_2D || 
                        clone.uniforms[ u ].type === GL.SAMPLER_CUBE ) {
                        clone.uniforms[ u ].textureUnit = this.uniforms[ u ].textureUnit; 
                        if( clone.uniforms[ u ].data ) {
                            clone.uniforms[ u ].data.init();
                        }
                    }
                }
    		} else {
    			clone.uniforms[ u ] = this.uniforms[ u ];
    		}
    	}

    	var a;
    	for( a in this.attributes ) {
    		if( except[ a ] ) {
                if( except[ a ] instanceof GLOW.Attribute ) {
                    clone.attributes[ a ] = except[ a ];
            } else {
                    clone.attributes[ a ] = new GLOW.Attribute( this.attributes[ a ], except[ a ] );
                }
    		} else {
    			clone.attributes[ a ] = this.attributes[ a ];
    		}
    	}
    	
    	var i;
    	for( i in this.interleavedAttributes ) {
    	    if( except[ i ] ) {
                // todo: This really needs some cleaning up... somehow.
    	        clone.interleavedAttributes[ i ] = except[ i ];
    	    } else {
    	        clone.interleavedAttributes[ i ] = this.interleavedAttributes[ i ];
    	    }
    	}

    	if( except.indices ) {
    		clone.elements = new GLOW.Elements( except.indices, except.primitives );
    	} else if( except.elements instanceof GLOW.Elements ) {
            clone.elements = except.elements;
        } else {
    		clone.elements = this.elements;
    	}

        if( except.program ) {
        	clone.program = except.program;
        } else {
        	clone.program = this.program;
        }

        clone.createArrays();
        
    	return clone;
    };

    GLOWCompiledData.prototype.dispose = function( disposeBuffers, disposeProgram ) {
        if( disposeBuffers ) {
            var u, a, i;
            u = this.uniformArray.length;
            while( u-- ) {
                this.uniformArray[ u ].dispose();
            }

            a = this.attributeArray.length;
            while( a-- ) {
                this.attributeArray[ a ].dispose();
            }

            i = this.interleavedAttributeArray.length;
            while( i-- ) {
                this.interleavedAttributeArray[ i ].dispose();
            }

            this.elements.dispose();
        }

        if( disposeProgram && GL.isProgram( this.program )) {
            var shaders = GL.getAttachedShaders( this.program );
            if( shaders ) {
                var s = shaders.length;
                while( s-- ) {
                    GL.detachShader( this.program, shaders[ s ] );
                    GL.deleteShader( shaders[ s ] );
                }
                GL.deleteProgram( this.program );
            }
        }

        delete this.program;
        delete this.uniforms;
        delete this.attributes;
        delete this.interleavedAttributes;
        delete this.elements;
        delete this.uniformArray;
        delete this.attributeArray;
        delete this.interleavedAttributeArray;
    };
    
    return GLOWCompiledData;
})();

