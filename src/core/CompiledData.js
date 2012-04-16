/*
* Shader Compiled Data
* @author: Mikael Emtinger, gomo.se
*/

GLOW.CompiledData = (function() {
    
    "use strict"; "use restrict";
    
    // private data, functions and initializations here

    // constructor
    
    function GLOWCompiledData( program, uniforms, attributes, interleavedAttributes, elements ) {
	    this.program = program;
	    this.uniforms = uniforms !== undefined ? uniforms : {};
	    this.attributes = attributes !== undefined ? attributes : {};
	    this.interleavedAttributes = interleavedAttributes !== undefined ? interleavedAttributes : {};
	    this.elements = elements;
    }

    // methods
    GLOWCompiledData.prototype.clone = function( except ) {
    	var clone = new GLOW.CompiledData();
    	except = except !== undefined ? except : {};

    	var u;
    	for( u in this.uniforms ) {
    		if( except[ u ] ) {
                if( except[ u ] instanceof GLOW.Uniform ) {
                    clone.uniforms[ u ] = execept[ u ];
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
        
    	return clone;
    };
    
    return GLOWCompiledData;
})();

