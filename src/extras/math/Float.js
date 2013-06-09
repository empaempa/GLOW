/*
* GLOW.Float
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Float = (function() {
	
	"use strict";
	
    // constructor
	function _float( value ) {
        if( value !== undefined && value.length ) {
            this.value = new Float32Array( value );
       } else {
            this.value = new Float32Array( 1 );
            this.value[ 0 ] = value !== undefined ? value : 0;
        }
	}

    // methods
    _float.prototype.set = function( value ) {
        this.value[ 0 ] = value;
        return this;
    };

    _float.prototype.add = function( value ) {
        this.value[ 0 ] += value;
        return this;
    };

    _float.prototype.sub = function( value ) {
        this.value[ 0 ] -= value;
        return this;
    };

    _float.prototype.multiply = function( value ) {
        this.value[ 0 ] *= value;
        return this;
    };

    _float.prototype.divide = function( value ) {
        this.value[ 0 ] /= value;
        return this;
    };

    _float.prototype.modulo = function( value ) {
        this.value[ 0 ] %= value;
        return this;
    };
    
	return _float;
})();
