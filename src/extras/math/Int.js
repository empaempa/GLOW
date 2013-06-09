/*
* GLOW.Int
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Int = (function() {

    "use strict";
    
    // constructor
    function _int( value ) {
        if( value !== undefined && value.length ) {
            this.value = new Int32Array( value );
        } else {
            this.value = new Int32Array( 1 );
            this.value[ 0 ] = value !== undefined ? value : 0;
        }
    }

    // methods
    _int.prototype.set = function( value ) {
        this.value[ 0 ] = value;
        return this;
    };

    _int.prototype.add = function( value ) {
        this.value[ 0 ] += value;
        return this;
    };

    _int.prototype.sub = function( value ) {
        this.value[ 0 ] -= value;
        return this;
    };

    _int.prototype.multiply = function( value ) {
        this.value[ 0 ] *= value;
        return this;
    };

    _int.prototype.divide = function( value ) {
        this.value[ 0 ] /= value;
        return this;
    };

    _int.prototype.modulo = function( value ) {
        this.value[ 0 ] %= value;
        return this;
    };
        
    return _int;
})();

