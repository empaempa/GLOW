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

    matrix3.prototype.extractFromMatrix4 = function( matrix4 ) {
        this.set( matrix4.value[ 0 ], matrix4.value[ 4 ], matrix4.value[ 8  ],
                  matrix4.value[ 1 ], matrix4.value[ 5 ], matrix4.value[ 9  ],
                  matrix4.value[ 2 ], matrix4.value[ 6 ], matrix4.value[ 10 ] );
        return this;
    }

    matrix3.prototype.multiplyVector3 = function( v ) {
        var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ];
        v.value[ 0 ] = this.value[ 0 ] * vx + this.value[ 3 ] * vy + this.value[ 6 ] * vz;
        v.value[ 1 ] = this.value[ 1 ] * vx + this.value[ 4 ] * vy + this.value[ 7 ] * vz;
        v.value[ 2 ] = this.value[ 2 ] * vx + this.value[ 5 ] * vy + this.value[ 8 ] * vz;
        return v;
    }

    
    return matrix3;
})();


