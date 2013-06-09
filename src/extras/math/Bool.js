/*
* GLOW.Bool
* @author: Tom Beddard, subblue.com
*/

GLOW.Bool = (function() {
    
    "use strict";
    
    // constructor
    function bool( value ) {
        this.value = [];
        this.value[ 0 ] = value !== undefined ? !!value : false;
    }

    // methods
    bool.prototype.set = function( value ) {
        this.value[ 0 ] = !!value;
        return this;
    };
    
    return bool;
})();
