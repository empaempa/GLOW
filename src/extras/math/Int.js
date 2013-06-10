/*
* GLOW.Int
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Int = (function() {

    "use strict";
    
    // constructor
    function GLOWInt( value ) {
        if( value !== undefined && value.length ) {
            this.value = new Int32Array( value );
        } else {
            this.value = new Int32Array( 1 );
            this.value[ 0 ] = value !== undefined ? value : 0;
        }
    }

    // methods
    GLOWInt.prototype.set = function( value ) {
        this.value[ 0 ] = value;
        return this;
    };

    GLOWInt.prototype.add = function( value ) {
        this.value[ 0 ] += value;
        return this;
    };

    GLOWInt.prototype.sub = function( value ) {
        this.value[ 0 ] -= value;
        return this;
    };

    GLOWInt.prototype.multiply = function( value ) {
        this.value[ 0 ] *= value;
        return this;
    };

    GLOWInt.prototype.divide = function( value ) {
        this.value[ 0 ] /= value;
        return this;
    };

    GLOWInt.prototype.modulo = function( value ) {
        this.value[ 0 ] %= value;
        return this;
    };
        
    return GLOWInt;
})();

