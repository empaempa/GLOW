/*
* GLOW.Bool2
* @author: Tom Beddard, subblue.com
*/

GLOW.Bool2 = (function() {
	
	"use strict";
	
    // constructor
	function bool( x, y ) {
    	this.value = [];
		this.value[ 0 ] = x !== undefined ? !!x : false;
        this.value[ 1 ] = y !== undefined ? !!y : false;
	}

    // methods
    bool.prototype.set = function ( x, y ) {
		this.value[ 0 ] = !!x;
		this.value[ 1 ] = !!y;
		return this;
    }
    
	return bool;
})();
