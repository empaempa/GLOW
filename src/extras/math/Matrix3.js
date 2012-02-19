/*
* GLOW.Matrix3
* Based upon THREE.Matrix3 by @mr.doob
*/

GLOW.Matrix3 = (function() {

	"use strict"; "use restrict";

    // constructor
    function matrix3() {
    	this.value = new Float32Array( 9 );
    	this.identity();
    }

    // methods
    matrix3.prototype.set = function( m11, m12, m13, m21, m22, m23, m31, m32, m33 ) {
    	this.value[ 0 ] = m11; this.value[ 3 ] = m12; this.value[ 6 ] = m13;
    	this.value[ 1 ] = m21; this.value[ 4 ] = m22; this.value[ 7 ] = m23;
    	this.value[ 2 ] = m31; this.value[ 5 ] = m32; this.value[ 8 ] = m33;
    	return this;
    }

    matrix3.prototype.identity = function () {
    	this.set( 1, 0, 0, 0, 1, 0, 0, 0, 1	);
    	return this;
    }
    
    matrix3.prototype.getValueAsFloat32Array = function() {
        this.float32Array[ 0 ] = this.value[ 0 ];
        this.float32Array[ 1 ] = this.value[ 1 ];
        this.float32Array[ 2 ] = this.value[ 2 ];
        this.float32Array[ 3 ] = this.value[ 3 ];
        this.float32Array[ 4 ] = this.value[ 4 ];
        this.float32Array[ 5 ] = this.value[ 5 ];
        this.float32Array[ 6 ] = this.value[ 6 ];
        this.float32Array[ 7 ] = this.value[ 7 ];
        this.float32Array[ 8 ] = this.value[ 8 ];
        return this.float32Array;
    }

    return matrix3;
})();


