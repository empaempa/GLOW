/*
* Shader Compiled Data
* @author: Mikael Emtinger, gomo.se
*/

GLOW.CompiledData = (function() {
    
    "use strict"; "use restrict";
    
    // private data, functions and initializations here

    // constructor
    
    function compiledData( program, uniforms, attributes, elements ) {
	    this.program = program;
	    this.uniforms = uniforms !== undefined ? uniforms : {};
	    this.attributes = attributes !== undefined ? attributes : {};
	    this.elements = elements;
    }


    compiledData.prototype.clone = function( except ) {
    	var clone = new GLOW.CompiledData();

    	var u;
    	for( u in this.uniforms ) {
    		if( except[ u ] ) {
    			clone.uniforms[ u ] = new GLOW.Uniform( this.uniforms[ u ], except[ u ] );
    		} else {
    			clone.uniforms[ u ] = this.uniforms[ u ];
    		}
    	}

    	var a;
    	for( a in this.attributes ) {
    		if( except[ a ] ) {
    			clone.attributes[ a ] = new GLOW.Attribute( this.attributes[ a ], except[ a ] );
    		} else {
    			clone.attributes[ a ] = this.attributes[ a ];
    		}
    	}

    	if( except.elements ) {
    		clone.elements = new GLOW.Elements( except.elements );
    	} else {
    		clone.elements = this.elements;
    	}

    	clone.program = this.program;
    	return clone;
    };
    
    return compiledData;
})();

