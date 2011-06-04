/*
* GLOW.Elements
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Elements = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function elements(data) {
        this.id = GLOW.uniqueId();
        this.elements = GL.createBuffer();
        this.length = data.length;

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.elements);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, data, GL.STATIC_DRAW);
    }

    // methods
    elements.prototype.draw = function() {
        if (!GLOW.currentContext.cache.elementsCached(this)) {
            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.elements);
        }
        GL.drawElements(GL.TRIANGLES, this.length, GL.UNSIGNED_SHORT, 0);
    };

    return elements;
})();
