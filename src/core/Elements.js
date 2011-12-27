/*
* GLOW.Elements
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Elements = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function GLOWElements( data, type, usage, offset ) {
        this.id     = GLOW.uniqueId();
        this.type   = type   !== undefined ? type : GL.TRIANGLES;
        this.offset = offset !== undefined ? offset : 0;

        if( typeof( data ) === "number" ) {
            this.length = data;
        } else {
    		if( !( data instanceof Uint16Array )) {
    			data = new Uint16Array( data );
    		}

            this.length = data.length;
            this.elements = GL.createBuffer();
            GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
            GL.bufferData( GL.ELEMENT_ARRAY_BUFFER, data, usage ? usage : GL.STATIC_DRAW );
        }
    }

    // methods
    GLOWElements.prototype.draw = function() {
        if( this.elements !== undefined ) {
            if( !GLOW.currentContext.cache.elementsCached( this )) {
                 GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
            }
            GL.drawElements( this.type, this.length, GL.UNSIGNED_SHORT, this.offset );
        } else {
            GL.drawArrays( this.type, this.offset, this.length );
        }
    };
    
    GLOWElements.prototype.dispose = function() {
        // TODO
    };
    

    return GLOWElements;
})();
