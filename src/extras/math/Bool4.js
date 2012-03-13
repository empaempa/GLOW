/*
* GLOW.Bool4
* @author: Tom Beddard, subblue.com
*/

GLOW.Bool4 = (function() {
	
	"use strict";
	
    // constructor
	function bool( x, y, z, w ) {
    	this.value = [];
		this.value[ 0 ] = x !== undefined ? !!x : false;
        this.value[ 1 ] = y !== undefined ? !!y : false;
        this.value[ 2 ] = z !== undefined ? !!z : false;
        this.value[ 3 ] = w !== undefined ? !!w : false;
	}

    // methods
    bool.prototype.set = function ( x, y, z, w ) {
		this.value[ 0 ] = !!x;
		this.value[ 1 ] = !!y;
		this.value[ 2 ] = !!z;
		this.value[ 3 ] = !!w;
		return this;
    }
    
	return bool;
})();
