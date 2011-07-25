/*
* GLOW.Elements
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Elements = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function GLOWElements( data, type, usage ) {
        this.id = GLOW.uniqueId();
        this.elements = GL.createBuffer();
        this.length = data.length;
        this.type = type !== undefined ? type : GL.TRIANGLES;

        GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
        GL.bufferData( GL.ELEMENT_ARRAY_BUFFER, data, usage ? usage : GL.STATIC_DRAW );
    }

    // methods
    GLOWElements.prototype.draw = function() {
        if( !GLOW.currentContext.cache.elementsCached( this )) {
             GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.elements );
        }
        GL.drawElements( this.type, this.length, GL.UNSIGNED_SHORT, 0 );
    };
    
    GLOWElements.prototype.dispose = function() {
        // TODO
    };
    

    return GLOWElements;
})();
