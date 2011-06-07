/*
* GLOW.Float
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Float = (function() {
	
	"use strict";
	
    // constructor
	function float( value ) {
    	this.value = new Float32Array( 1 );
    	this.value[ 0 ] = value !== undefined ? value : 0;
	}

    // methods
    float.prototype.set = function( value ) {
        this.value[ 0 ] = value;
        return this;
    }

    float.prototype.add = function( value ) {
        this.value[ 0 ] += value;
        return this;
    }

    float.prototype.sub = function( value ) {
        this.value[ 0 ] -= value;
        return this;
    }

    float.prototype.multiply = function( value ) {
        this.value[ 0 ] *= value;
        return this;
    }

    float.prototype.divide = function( value ) {
        this.value[ 0 ] /= value;
        return this;
    }

    float.prototype.modulo = function( value ) {
        this.value[ 0 ] %= value;
        return this;
    }
	
	return float;
})();
