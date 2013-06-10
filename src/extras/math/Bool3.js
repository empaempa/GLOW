/*
* GLOW.Bool3
* @author: Tom Beddard, subblue.com
*/

GLOW.Bool3 = (function() {
    
    "use strict";
    
    // constructor
    function bool( x, y, z ) {
        this.value = [];
        this.value[ 0 ] = x !== undefined ? !!x : false;
        this.value[ 1 ] = y !== undefined ? !!y : false;
        this.value[ 2 ] = z !== undefined ? !!z : false;
    }

    // methods
  bool.prototype.set = function ( x, y, z ) {
        this.value[ 0 ] = !!x;
        this.value[ 1 ] = !!y;
        this.value[ 2 ] = !!z;
        return this;
  };
    
    return bool;
})();

