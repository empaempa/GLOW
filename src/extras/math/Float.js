/*
* GLOW.Float
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Float = (function() {
	
	"use strict";
	
    // constructor
	function GLOWFloat( value ) {
        if( value !== undefined && value.length ) {
            this.value = new Float32Array( value );
       } else {
            this.value = new Float32Array( 1 );
            this.value[ 0 ] = value !== undefined ? value : 0;
        }
	}

    // methods
    GLOWFloat.prototype.set = function( value ) {
        this.value[ 0 ] = value;
        return this;
    };

    GLOWFloat.prototype.add = function( value ) {
        this.value[ 0 ] += value;
        return this;
    };

    GLOWFloat.prototype.sub = function( value ) {
        this.value[ 0 ] -= value;
        return this;
    };

    GLOWFloat.prototype.multiply = function( value ) {
        this.value[ 0 ] *= value;
        return this;
    };

    GLOWFloat.prototype.divide = function( value ) {
        this.value[ 0 ] /= value;
        return this;
    };

    GLOWFloat.prototype.modulo = function( value ) {
        this.value[ 0 ] %= value;
        return this;
    };
    
	return GLOWFloat;
})();
