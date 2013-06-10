// GLOWCoreMath.js r1.1 - http://github.com/empaempa/GLOW
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
  };
    
    return bool;
})();
/*
* GLOW.Bool3
* @author: Tom Beddard, subblue.com
*/

GLOW.Bool3 = (function() {
    
    "use strict";
    
    // constructor
    function bool( x, y, z ) {
        this.value = [];
        this.value[ 0 ] = x !== undefined ? !!x : false;
        this.value[ 1 ] = y !== undefined ? !!y : false;
        this.value[ 2 ] = z !== undefined ? !!z : false;
    }

    // methods
  bool.prototype.set = function ( x, y, z ) {
        this.value[ 0 ] = !!x;
        this.value[ 1 ] = !!y;
        this.value[ 2 ] = !!z;
        return this;
  };
    
    return bool;
})();

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
/**
 * GLOW.Vector2 Based upon THREE.Vector2 by
 * @author mr.doob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 */

GLOW.Vector2 = (function() {

    "use strict"; "use restrict";

    // constructor
    function vector2( x, y ) {
        this.value = new Float32Array( 2 );
        this.value[ 0 ] = x !== undefined ? x : 0;
        this.value[ 1 ] = y !== undefined ? y : 0;
    }


    // methods
    vector2.prototype.set = function ( x, y ) {
        this.value[ 0 ] = x;
        this.value[ 1 ] = y;
        return this;
    };

    vector2.prototype.copy = function ( v ) {
        this.value[ 0 ] = v.value[ 0 ];
        this.value[ 1 ] = v.value[ 1 ];
        return this;
    };

    vector2.prototype.addSelf = function ( v ) {
        this.value[ 0 ] += v.value[ 0 ];
        this.value[ 1 ] += v.value[ 1 ];
        return this;
    };

    vector2.prototype.add = function ( v1, v2 ) {
        this.value[ 0 ] = v1.value[ 0 ] + v2.value[ 0 ];
        this.value[ 1 ] = v1.value[ 1 ] + v2.value[ 1 ];
        return this;
    };

    vector2.prototype.addScalar = function ( s ) {
        this.value[ 0 ] += s;
        this.value[ 1 ] += s;
        return this;
    };

    vector2.prototype.subSelf = function ( v ) {
        this.value[ 0 ] -= v.x,
        this.value[ 1 ] -= v.y
        return this;
    };

    vector2.prototype.sub = function ( v1, v2 ) {
        this.value[ 0 ] = v1.value[ 0 ] - v2.value[ 0 ];
        this.value[ 1 ] = v1.value[ 1 ] - v2.value[ 1 ];
        return this;
    };

    vector2.prototype.multiplySelf = function ( v ) {
        this.value[ 0 ] *= v.value[ 0 ];
        this.value[ 1 ] *= v.value[ 1 ];
        return this;
    };

    vector2.prototype.multiply = function ( v1, v2 ) {
        this.value[ 0 ] = v1.value[ 0 ] * v2.value[ 0 ];
        this.value[ 1 ] = v1.value[ 1 ] * v2.value[ 1 ];
        return this;
    };

    vector2.prototype.multiplyScalar = function ( s ) {
        this.value[ 0 ] *= s;
        this.value[ 1 ] *= s;
        return this;
    },

    vector2.prototype.negate = function() {
        this.value[ 0 ] = -this.value[ 0 ];
        this.value[ 1 ] = -this.value[ 1 ];
        return this;
    },

    vector2.prototype.normalize = function () {
        this.multiplyScalar( 1 / this.length() );
        return this;
    };

    vector2.prototype.length = function () {
        return Math.sqrt( this.lengthSq() );
    };

    vector2.prototype.lengthSq = function () {
        return this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ];
    };

    vector2.prototype.clone = function () {
        return new GLOW.Vector2( this.value[ 0 ], this.value[ 1 ] );
    };

    return vector2;
})();

/**
 * GLOW.Vector3 Based upon THREE.Vector3 by
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Vector3 = (function() {

    "use strict"; "use restrict";

    // constructor
    function vector3( x, y, z ) {
        this.value = new Float32Array( 3 );
        this.value[ 0 ] = x !== undefined ? x : 0;
        this.value[ 1 ] = y !== undefined ? y : 0;
        this.value[ 2 ] = z !== undefined ? z : 0;
    };

    // methods
    vector3.prototype.set = function( x, y, z ) {
        this.value[ 0 ] = x;
        this.value[ 1 ] = y;
        this.value[ 2 ] = z;
        return this;
    };

    vector3.prototype.copy = function ( v ) {
        this.set( v.value[ 0 ], v.value[ 1 ], v.value[ 2 ] );
        return this;
    };

    vector3.prototype.add = function ( a, b ) {
        a = a.value;
        b = b.value;
        this.value[ 0 ] = a[ 0 ] + b[ 0 ];
        this.value[ 1 ] = a[ 1 ] + b[ 1 ];
        this.value[ 2 ] = a[ 2 ] + b[ 2 ];
        return this;
    };

    vector3.prototype.addSelf = function ( a ) {
        a = a.value;
        this.value[ 0 ] = this.value[ 0 ] + a[ 0 ];
        this.value[ 1 ] = this.value[ 1 ] + a[ 1 ];
        this.value[ 2 ] = this.value[ 2 ] + a[ 2 ];
        return this;
    };

    vector3.prototype.addScalar = function ( s ) {
        this.value[ 0 ] += s;
        this.value[ 1 ] += s;
        this.value[ 2 ] += s;
        return this;
    };


    vector3.prototype.sub = function ( a, b ) {
        a = a.value;
        b = b.value;
        this.value[ 0 ] = a[ 0 ] - b[ 0 ];
        this.value[ 1 ] = a[ 1 ] - b[ 1 ];
        this.value[ 2 ] = a[ 2 ] - b[ 2 ];
        return this;
    };

    vector3.prototype.subSelf = function ( a ) {
        a = a.value;
        this.value[ 0 ] -= a[ 0 ];
        this.value[ 1 ] -= a[ 1 ];
        this.value[ 2 ] -= a[ 2 ];
        return this;
    };

    vector3.prototype.cross = function ( a, b ) {
        a = a.value;
        b = b.value;
        this.value[ 0 ] = a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ];
        this.value[ 1 ] = a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ];
        this.value[ 2 ] = a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ];
        return this;
    };

    vector3.prototype.crossSelf = function ( a ) {
        a = a.value;
        var ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ];
        var vx = this.value[ 0 ], vy = this.value[ 1 ], vz = this.value[ 2 ];
        this.value[ 0 ] = ay * vz - az * vy;
        this.value[ 1 ] = az * vx - ax * vz;
        this.value[ 2 ] = ax * vy - ay * vx;
        return this;
    };

    vector3.prototype.multiply = function( a, b ) {
        a = a.value;
        b = b.value;
        this.value[ 0 ] = a[ 0 ] * b[ 0 ];
        this.value[ 1 ] = a[ 1 ] * b[ 1 ];
        this.value[ 2 ] = a[ 2 ] * b[ 2 ];
        return this;
    };

    vector3.prototype.multiplySelf = function( a ) {
        a = a.value;
        this.value[ 0 ] *= a[ 0 ];
        this.value[ 1 ] *= a[ 1 ];
        this.value[ 2 ] *= a[ 2 ];
        return this;
    };

    vector3.prototype.multiplyScalar = function( s ) {
        this.value[ 0 ] *= s;
        this.value[ 1 ] *= s;
        this.value[ 2 ] *= s;
        return this;
    };

    vector3.prototype.divideSelf = function( a ) {
        a = a.value;
        this.value[ 0 ] /= a[ 0 ];
        this.value[ 1 ] /= a[ 1 ];
        this.value[ 2 ] /= a[ 2 ];
        return this;
    };

    vector3.prototype.divideScalar = function( s ) {
        this.value[ 0 ] /= s;
        this.value[ 1 ] /= s;
        this.value[ 2 ] /= s;
        return this;
    };

    vector3.prototype.negate = function() {
        this.value[ 0 ] = -this.value[ 0 ];
        this.value[ 1 ] = -this.value[ 1 ];
        this.value[ 2 ] = -this.value[ 2 ];
        return this;
    };

    vector3.prototype.dot = function( a ) {
        a = a.value;
        return this.value[ 0 ] * a[ 0 ] + this.value[ 1 ] * a[ 1 ] + this.value[ 2 ] * a[ 2 ];
    };

    vector3.prototype.distanceTo = function ( a ) {
        return Math.sqrt( this.distanceToSquared( a ) );
    };

    vector3.prototype.distanceToSquared = function( a ) {
        a = a.value;
        var dx = this.value[ 0 ] - a[ 0 ], dy = this.value[ 1 ] - a[ 1 ], dz = this.value[ 2 ] - a[ 2 ];
        return dx * dx + dy * dy + dz * dz;
    };

    vector3.prototype.length = function() {
        return Math.sqrt( this.lengthSq() );
    };

    vector3.prototype.lengthSq = function() {
        return this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ];
    };

    vector3.prototype.lengthManhattan = function() {
        return this.value[ 0 ] + this.value[ 1 ] + this.value[ 2 ];
    };

    vector3.prototype.normalize = function() {
        var l = Math.sqrt( this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ] );
        l > 0 ? this.multiplyScalar( 1 / l ) : this.set( 0, 0, 0 );
        return this;
    };

    vector3.prototype.setPositionFromMatrix = function( m ) {
        m = m.value;
        this.value[ 0 ] = m[ 12 ];
        this.value[ 1 ] = m[ 13 ];
        this.value[ 2 ] = m[ 14 ];
    };

    vector3.prototype.setLength = function( l ) {
        return this.normalize().multiplyScalar( l );
    };

    vector3.prototype.isZero = function() {
        var almostZero = 0.0001;
        return ( Math.abs( this.value[ 0 ] ) < almostZero ) && ( Math.abs( this.value[ 1 ] ) < almostZero ) && ( Math.abs( this.value[ 2 ] ) < almostZero );
    };

    vector3.prototype.clone = function() {
        return new GLOW.Vector3( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );
    };

    return vector3;
})();
/**
 * GLOW.Vector3 Based upon THREE.Vector3 by
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Vector4 = (function() {

    "use strict"; "use restrict";
    
    // constructor
    function vector4( x, y, z, w ) {
        this.value = new Float32Array( 4 );
        this.value[ 0 ] = x !== undefined ? x : 0;
        this.value[ 1 ] = y !== undefined ? y : 0;
        this.value[ 2 ] = z !== undefined ? z : 0;
        this.value[ 3 ] = w !== undefined ? w : 0;
    }
    
    // methods
    vector4.prototype.set = function ( x, y, z, w ) {
        this.value[ 0 ] = x;
        this.value[ 1 ] = y;
        this.value[ 2 ] = z;
        this.value[ 3 ] = w;
        return this;
    };

    vector4.prototype.copy = function ( v ) {
        this.value[ 0 ] = v.value[ 0 ];
        this.value[ 1 ] = v.value[ 1 ];
        this.value[ 2 ] = v.value[ 2 ];
        this.value[ 3 ] = v.value[ 3 ];
        return this;
    };

    vector4.prototype.add = function ( v1, v2 ) {
        this.value[ 0 ] = v1.value[ 0 ] + v2.value[ 0 ];
        this.value[ 1 ] = v1.value[ 1 ] + v2.value[ 1 ];
        this.value[ 2 ] = v1.value[ 2 ] + v2.value[ 2 ];
        this.value[ 3 ] = v1.value[ 3 ] + v2.value[ 3 ];
        return this;
    };

    vector4.prototype.addSelf = function ( v ) {
        this.value[ 0 ] += v.value[ 0 ];
        this.value[ 1 ] += v.value[ 1 ];
        this.value[ 2 ] += v.value[ 2 ];
        this.value[ 3 ] += v.value[ 3 ];
        return this;
    };

    vector4.prototype.sub = function ( v1, v2 ) {
        this.value[ 0 ] = v1.value[ 0 ] - v2.value[ 0 ];
        this.value[ 1 ] = v1.value[ 1 ] - v2.value[ 1 ];
        this.value[ 2 ] = v1.value[ 2 ] - v2.value[ 2 ];
        this.value[ 3 ] = v1.value[ 3 ] - v2.value[ 3 ];
        return this;
    };

    vector4.prototype.subSelf = function ( v ) {
        this.value[ 0 ] -= v.value[ 0 ];
        this.value[ 1 ] -= v.value[ 1 ];
        this.value[ 2 ] -= v.value[ 2 ];
        this.value[ 3 ] -= v.value[ 3 ];
        return this;
    };

    vector4.prototype.multiplyScalar = function ( s ) {
        this.value[ 0 ] *= s;
        this.value[ 1 ] *= s;
        this.value[ 2 ] *= s;
        this.value[ 3 ] *= s;
        return this;
    };

    vector4.prototype.divideScalar = function ( s ) {
        this.value[ 0 ] /= s;
        this.value[ 1 ] /= s;
        this.value[ 2 ] /= s;
        this.value[ 3 ] /= s;
        return this;
    };

    vector4.prototype.normalize = function() {
        var l = Math.sqrt( this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ] + this.value[ 3 ] * this.value[ 3 ] );
        l > 0 ? this.multiplyScalar( 1 / l ) : this.set( 0, 0, 0, 1 );
        return this;
    };

    vector4.prototype.lerpSelf = function ( v, alpha ) {
        this.value[ 0 ] += (v.x - this.value[ 0 ]) * alpha;
        this.value[ 1 ] += (v.y - this.value[ 1 ]) * alpha;
        this.value[ 2 ] += (v.z - this.value[ 2 ]) * alpha;
        this.value[ 3 ] += (v.w - this.value[ 3 ]) * alpha;
        return this;
    };

    vector4.prototype.lengthOfXYZ = function() {
        return Math.sqrt( this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ] );
    };

    vector4.prototype.clone = function () {
        return new GLOW.Vector4( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ], this.value[ 3 ] );
    };

    return vector4;
})();
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
    };

    matrix3.prototype.identity = function () {
        this.set( 1, 0, 0, 0, 1, 0, 0, 0, 1    );
        return this;
    };

    matrix3.prototype.extractFromMatrix4 = function( matrix4 ) {
        this.set( matrix4.value[ 0 ], matrix4.value[ 4 ], matrix4.value[ 8  ],
                  matrix4.value[ 1 ], matrix4.value[ 5 ], matrix4.value[ 9  ],
                  matrix4.value[ 2 ], matrix4.value[ 6 ], matrix4.value[ 10 ] );
        return this;
    };

    matrix3.prototype.multiplyVector3 = function( v ) {
        var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ];
        v.value[ 0 ] = this.value[ 0 ] * vx + this.value[ 3 ] * vy + this.value[ 6 ] * vz;
        v.value[ 1 ] = this.value[ 1 ] * vx + this.value[ 4 ] * vy + this.value[ 7 ] * vz;
        v.value[ 2 ] = this.value[ 2 ] * vx + this.value[ 5 ] * vy + this.value[ 8 ] * vz;
        return v;
    };

    matrix3.prototype.scale = function( v, y, z ) {
        var x;
        if( y !== undefined && z !== undefined ) {
            x = v;
        } else {
            x = v.value[ 0 ];
            y = v.value[ 1 ];
            z = v.value[ 2 ];
        }

        this.value[ 0 ] *= x; this.value[ 3 ] *= y; this.value[ 6 ] *= z;
        this.value[ 1 ] *= x; this.value[ 4 ] *= y; this.value[ 7 ] *= z;
        this.value[ 2 ] *= x; this.value[ 5 ] *= y; this.value[ 8 ] *= z;
        return this;
    }
    
    return matrix3;
})();


/**
 * GLOW.Matrix4. Based upon THREE.Matrix4 by:
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Matrix4 = (function() {

    "use strict"; "use restrict";

    //constructor
    function matrix4() {
        this.value = new Float32Array( 16 );
        this.rotation = new GLOW.Vector3();
        this.position = new GLOW.Vector3();
        this.columnX  = new GLOW.Vector3();
        this.columnY  = new GLOW.Vector3();
        this.columnZ  = new GLOW.Vector3();
        this.identity();
    }


    // methods
    matrix4.prototype.set = function( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ) {
        this.value[ 0 ] = m11; this.value[ 4 ] = m12; this.value[ 8 ] = m13; this.value[ 12 ] = m14;
        this.value[ 1 ] = m21; this.value[ 5 ] = m22; this.value[ 9 ] = m23; this.value[ 13 ] = m24;
        this.value[ 2 ] = m31; this.value[ 6 ] = m32; this.value[ 10 ] = m33; this.value[ 14 ] = m34;
        this.value[ 3 ] = m41; this.value[ 7 ] = m42; this.value[ 11 ] = m43; this.value[ 15 ] = m44;
        return this;
    };

    matrix4.prototype.identity = function () {
        this.set( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );
        return this;
    };

    matrix4.prototype.copy = function( a ) {
        a = a.value;
        this.set(
            a[ 0 ], a[ 4 ], a[ 8  ], a[ 12 ],
            a[ 1 ], a[ 5 ], a[ 9  ], a[ 13 ],
            a[ 2 ], a[ 6 ], a[ 10 ], a[ 14 ],
            a[ 3 ], a[ 7 ], a[ 11 ], a[ 15 ]
        );
        return this;
    };

    matrix4.prototype.lookAt = function( focus, up ) {
        var x = GLOW.Matrix4.tempVector3A, 
            y = GLOW.Matrix4.tempVector3B, 
            z = GLOW.Matrix4.tempVector3C;
        var eye = this.getPosition();    

        eye.value[ 0 ] = this.value[ 12 ];
        eye.value[ 1 ] = this.value[ 13 ];
        eye.value[ 2 ] = this.value[ 14 ];

        z.sub( eye, focus ).normalize();

        if( z.length() === 0 ) {
            z.value[ 3 ] = 1;
        }

        x.cross( up, z ).normalize();

        if( x.length() === 0 ) {
            z.value[ 0 ] += 0.0001;
            x.cross( up, z ).normalize();
        }

        y.cross( z, x ).normalize();

        x = x.value;
        y = y.value;
        z = z.value;

        this.value[ 0 ] = x[ 0 ]; this.value[ 4 ] = y[ 0 ]; this.value[  8 ] = z[ 0 ];
        this.value[ 1 ] = x[ 1 ]; this.value[ 5 ] = y[ 1 ]; this.value[  9 ] = z[ 1 ];
        this.value[ 2 ] = x[ 2 ]; this.value[ 6 ] = y[ 2 ]; this.value[ 10 ] = z[ 2 ];

        return this;
    };

    matrix4.prototype.multiplyVector3 = function ( v ) {
        var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ],
        d = 1 / ( this.value[ 3 ] * vx + this.value[ 7 ] * vy + this.value[ 11 ] * vz + this.value[ 15 ] );

        v.value[ 0 ] = ( this.value[ 0 ] * vx + this.value[ 4 ] * vy + this.value[ 8 ] * vz + this.value[ 12 ] ) * d;
        v.value[ 1 ] = ( this.value[ 1 ] * vx + this.value[ 5 ] * vy + this.value[ 9 ] * vz + this.value[ 13 ] ) * d;
        v.value[ 2 ] = ( this.value[ 2 ] * vx + this.value[ 6 ] * vy + this.value[ 10 ] * vz + this.value[ 14 ] ) * d;
        return v;
    };

    matrix4.prototype.multiplyVector4 = function ( v ) {
        var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ], vw = v.value[ 3 ];
        v.value[ 0 ] = this.value[ 0 ] * vx + this.value[ 4 ] * vy + this.value[ 8 ] * vz + this.value[ 12 ] * vw;
        v.value[ 1 ] = this.value[ 1 ] * vx + this.value[ 5 ] * vy + this.value[ 9 ] * vz + this.value[ 13 ] * vw;
        v.value[ 2 ] = this.value[ 2 ] * vx + this.value[ 6 ] * vy + this.value[ 10 ] * vz + this.value[ 14 ] * vw;
        v.value[ 3 ] = this.value[ 3 ] * vx + this.value[ 7 ] * vy + this.value[ 11 ] * vz + this.value[ 15 ] * vw;

        return v;
    };

    matrix4.prototype.rotateAxis = function ( v ) {
        var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ];
        v.value[ 0 ] = vx * this.value[ 0 ] + vy * this.value[ 4 ] + vz * this.value[ 8 ];
        v.value[ 1 ] = vx * this.value[ 1 ] + vy * this.value[ 5 ] + vz * this.value[ 9 ];
        v.value[ 2 ] = vx * this.value[ 2 ] + vy * this.value[ 6 ] + vz * this.value[ 10 ];
        v.normalize();
        return v;
    };

    matrix4.prototype.crossVector = function ( a ) {
        var v = GLOW.Vector4();
        var ax = a.value[ 0 ], ay = a.value[ 1 ], az = a.value[ 2 ], aw = a.value[ 3 ];
        v.value[ 0 ] = this.value[ 0 ] * ax + this.value[ 4 ] * ay + this.value[ 8 ] * az + this.value[ 12 ] * aw;
        v.value[ 1 ] = this.value[ 1 ] * ax + this.value[ 5 ] * ay + this.value[ 9 ] * az + this.value[ 13 ] * aw;
        v.value[ 2 ] = this.value[ 2 ] * ax + this.value[ 6 ] * ay + this.value[ 10 ] * az + this.value[ 14 ] * aw;
        v.value[ 3 ] = ( aw ) ? this.value[ 3 ] * ax + this.value[ 7 ] * ay + this.value[ 11 ] * az + this.value[ 15 ] * aw : 1;
        return v;
    };

    matrix4.prototype.multiply = function ( a, b ) {
        a = a.value;
        b = b.value;
        var a11 = a[ 0 ], a12 = a[ 4 ], a13 = a[ 8 ], a14 = a[ 12 ],
            a21 = a[ 1 ], a22 = a[ 5 ], a23 = a[ 9 ], a24 = a[ 13 ],
            a31 = a[ 2 ], a32 = a[ 6 ], a33 = a[ 10 ], a34 = a[ 14 ],
            a41 = a[ 3 ], a42 = a[ 7 ], a43 = a[ 11 ], a44 = a[ 15 ],
        b11 = b[ 0 ], b12 = b[ 4 ], b13 = b[ 8 ], b14 = b[ 12 ],
        b21 = b[ 1 ], b22 = b[ 5 ], b23 = b[ 9 ], b24 = b[ 13 ],
        b31 = b[ 2 ], b32 = b[ 6 ], b33 = b[ 10 ], b34 = b[ 14 ],
        b41 = b[ 3 ], b42 = b[ 7 ], b43 = b[ 11 ], b44 = b[ 15 ];
        this.value[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
        this.value[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32;
        this.value[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33;
        this.value[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14;
        this.value[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
        this.value[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32;
        this.value[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33;
        this.value[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24;
        this.value[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
        this.value[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32;
        this.value[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33;
        this.value[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34;
        this.value[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31;
        this.value[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32;
        this.value[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33;
        this.value[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44;
        return this;
    };

    matrix4.prototype.multiplySelf = function ( a ) {
        this.multiply( this, a );
        return this;
    };

    matrix4.prototype.multiplyScalar = function ( s ) {
        this.value[ 0 ] *= s; this.value[ 4 ] *= s; this.value[ 8 ] *= s; this.value[ 12 ] *= s;
        this.value[ 1 ] *= s; this.value[ 5 ] *= s; this.value[ 9 ] *= s; this.value[ 13 ] *= s;
        this.value[ 2 ] *= s; this.value[ 6 ] *= s; this.value[ 10 ] *= s; this.value[ 14 ] *= s;
        this.value[ 3 ] *= s; this.value[ 7 ] *= s; this.value[ 11 ] *= s; this.value[ 15 ] *= s;
        return this;
    };

    matrix4.prototype.determinant = function () {
        var n11 = this.value[ 0 ], n12 = this.value[ 4 ], n13 = this.value[ 8 ], n14 = this.value[ 12 ],
        n21 = this.value[ 1 ], n22 = this.value[ 5 ], n23 = this.value[ 9 ], n24 = this.value[ 13 ],
        n31 = this.value[ 2 ], n32 = this.value[ 6 ], n33 = this.value[ 10 ], n34 = this.value[ 14 ],
        n41 = this.value[ 3 ], n42 = this.value[ 7 ], n43 = this.value[ 11 ], n44 = this.value[ 15 ];
        return (
            n14 * n23 * n32 * n41-
            n13 * n24 * n32 * n41-
            n14 * n22 * n33 * n41+
            n12 * n24 * n33 * n41+
            n13 * n22 * n34 * n41-
            n12 * n23 * n34 * n41-
            n14 * n23 * n31 * n42+
            n13 * n24 * n31 * n42+
            n14 * n21 * n33 * n42-
            n11 * n24 * n33 * n42-
            n13 * n21 * n34 * n42+
            n11 * n23 * n34 * n42+
            n14 * n22 * n31 * n43-
            n12 * n24 * n31 * n43-
            n14 * n21 * n32 * n43+
            n11 * n24 * n32 * n43+
            n12 * n21 * n34 * n43-
            n11 * n22 * n34 * n43-
            n13 * n22 * n31 * n44+
            n12 * n23 * n31 * n44+
            n13 * n21 * n32 * n44-
            n11 * n23 * n32 * n44-
            n12 * n21 * n33 * n44+
            n11 * n22 * n33 * n44
        );
    };

    matrix4.prototype.transpose = function () {
        var tmp;
        tmp = this.value[ 1 ]; this.value[ 1 ] = this.value[ 4 ]; this.value[ 4 ] = tmp;
        tmp = this.value[ 2 ]; this.value[ 2 ] = this.value[ 8 ]; this.value[ 8 ] = tmp;
        tmp = this.value[ 6 ]; this.value[ 6 ] = this.value[ 9 ]; this.value[ 9 ] = tmp;
        tmp = this.value[ 3 ]; this.value[ 3 ] = this.value[ 12 ]; this.value[ 12 ] = tmp;
        tmp = this.value[ 7 ]; this.value[ 7 ] = this.value[ 13 ]; this.value[ 13 ] = tmp;
        tmp = this.value[ 11 ]; this.value[ 11 ] = this.value[ 14 ]; this.value[ 11 ] = tmp;
        return this;
    };

    matrix4.prototype.clone = function () {
        var clone = new GLOW.Matrix4();
        clone.value = new Float32Array( this.value );
        return clone;
    };


    matrix4.prototype.setPosition = function( v, y, z ) {
        var x;
        if( y !== undefined && z !== undefined ) {
            x = v;
        } else {
            x = v.value[ 0 ];
            y = v.value[ 1 ];
            z = v.value[ 2 ];
        }

        this.value[ 12 ] = x;
        this.value[ 13 ] = y;
        this.value[ 14 ] = z;
        return this;
    };

    matrix4.prototype.addPosition = function( v, y, z ) {
        var x;
        if( y !== undefined && z !== undefined ) {
            x = v;
        } else {
            x = v.value[ 0 ];
            y = v.value[ 1 ];
            z = v.value[ 2 ];
        }

        this.value[ 12 ] += x;
        this.value[ 13 ] += y;
        this.value[ 14 ] += z;
    };

    matrix4.prototype.setRotation = function( v, y, z ) {
        var x;
        if( y !== undefined && z !== undefined ) {
            x = v;
        } else {
            x = v.value[ 0 ];
            y = v.value[ 1 ];
            z = v.value[ 2 ];
        }

        var ch = Math.cos(y);
        var sh = Math.sin(y);
        var ca = Math.cos(z);
        var sa = Math.sin(z);
        var cb = Math.cos(x);
        var sb = Math.sin(x);

        this.value[ 0  ] = ch * ca;
        this.value[ 4  ] = sh*sb - ch*sa*cb;
        this.value[ 8  ] = ch*sa*sb + sh*cb;
        this.value[ 1  ] = sa;
        this.value[ 5  ] = ca*cb;
        this.value[ 9  ] = -ca*sb;
        this.value[ 2  ] = -sh*ca;
        this.value[ 6  ] = sh*sa*cb + ch*sb;
        this.value[ 10 ] = -sh*sa*sb + ch*cb;

        return this;
    };

    matrix4.prototype.getRotation = function() {
        var matrix   = this.value;
        var rotation = this.rotation.value;

        if( matrix[ 1 ] > 0.998 ) {
            rotation[ 0 ] = 0;
            rotation[ 1 ] = Math.atan2( matrix[ 8 ], matrix[ 10 ] );
            rotation[ 2 ] = Math.PI / 2;
            return this.rotation;
        } else if( matrix[ 1 ] < -0.998 ) {
            rotation[ 0 ] = 0;
            rotation[ 1 ] = Math.atan2( matrix[ 8 ], matrix[ 10 ] );
            rotation[ 2 ] = -Math.PI / 2;
            return this.rotation;
        }

        rotation[ 0 ] = Math.atan2( -matrix[ 9 ], matrix[ 5 ] );
        rotation[ 1 ] = Math.atan2( -matrix[ 2 ], matrix[ 0 ] );
        rotation[ 2 ] = Math.asin( matrix[ 1 ] );

        return this.rotation;
    }

    matrix4.prototype.addRotation = function( v, y, z ) {
        var x;
        if( y !== undefined && z !== undefined ) {
            x = v;
        } else {
            x = v.value[ 0 ];
            y = v.value[ 1 ];
            z = v.value[ 2 ];
        }

        this.rotation.value[ 0 ] += x;
        this.rotation.value[ 1 ] += y;
        this.rotation.value[ 2 ] += z;
        this.setRotation( this.rotation.value[ 0 ], this.rotation.value[ 1 ], this.rotation.value[ 2 ] );
    };

    matrix4.prototype.setQuaternion = function( q ) {
        var d = this.value;

        var qv = q.value;
        var qx = qv[ 0 ];
        var qy = qv[ 1 ];
        var qz = qv[ 2 ];
        var qw = qv[ 3 ];

        var sqx = qx * qx;
        var sqy = qy * qy;
        var sqz = qz * qz;

        d[0] = (1 - 2 * sqy - 2 * sqz);
        d[1] = (2 * qx * qy - 2 * qz * qw);
        d[2] = (2 * qx * qz + 2 * qy * qw);

        d[4] = (2 * qx * qy + 2 * qz * qw);
        d[5] = (1 - 2 * sqx - 2 * sqz);
        d[6] = (2 * qy * qz - 2 * qx * qw);

        d[8] = (2 * qx * qz - 2 * qy * qw);
        d[9] = (2 * qy * qz + 2 * qx * qw);
        d[10] = (1 - 2 * sqx - 2 * sqy);

        return this;
    }

    matrix4.prototype.getPosition = function() {
        this.position.set( this.value[ 12 ], this.value[ 13 ], this.value[ 14 ] );
        return this.position;
    };

    matrix4.prototype.getColumnX = function() {
        this.columnX.set( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );
        return this.columnX;
    };

    matrix4.prototype.getColumnY = function() {
        this.columnY.set( this.value[ 4 ], this.value[ 5 ], this.value[ 6 ] );
        return this.columnY;
    };

    matrix4.prototype.getColumnZ = function() {
        this.columnZ.set( this.value[ 8 ], this.value[ 9 ], this.value[ 10 ] );
        return this.columnZ;
    };

    matrix4.prototype.scale = function( v, y, z ) {
        var x;
        if( y !== undefined && z !== undefined ) {
            x = v;
        } else {
            x = v.value[ 0 ];
            y = v.value[ 1 ];
            z = v.value[ 2 ];
        }

        this.value[ 0 ] *= x; this.value[ 4 ] *= y; this.value[ 8 ] *= z;
        this.value[ 1 ] *= x; this.value[ 5 ] *= y; this.value[ 9 ] *= z;
        this.value[ 2 ] *= x; this.value[ 6 ] *= y; this.value[ 10 ] *= z;
        this.value[ 3 ] *= x; this.value[ 7 ] *= y; this.value[ 11 ] *= z;
        return this;
    };

    matrix4.prototype.invert = function() {
        GLOW.Matrix4.makeInverse( this, this );
        return this;
    };

    return matrix4;
})();


/*
* Helpers
*/

GLOW.Matrix4.makeInverse = function ( m1, m2 ) {

    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

    if( m2 === undefined ) m2 = new GLOW.Matrix4();

    var m1v = m1.value;
    var m2v = m2.value;

    var n11 = m1v[ 0 ], n12 = m1v[ 4 ], n13 = m1v[ 8  ], n14 = m1v[ 12 ],
        n21 = m1v[ 1 ], n22 = m1v[ 5 ], n23 = m1v[ 9  ], n24 = m1v[ 13 ],
        n31 = m1v[ 2 ], n32 = m1v[ 6 ], n33 = m1v[ 10 ], n34 = m1v[ 14 ],
        n41 = m1v[ 3 ], n42 = m1v[ 7 ], n43 = m1v[ 11 ], n44 = m1v[ 15 ];

    m2v[ 0  ] = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
    m2v[ 1  ] = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
    m2v[ 2  ] = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
    m2v[ 3  ] = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
    m2v[ 4  ] = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
    m2v[ 5  ] = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
    m2v[ 6  ] = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
    m2v[ 7  ] = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
    m2v[ 8  ] = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
    m2v[ 9  ] = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
    m2v[ 10 ] = n13*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
    m2v[ 11 ] = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
    m2v[ 12 ] = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
    m2v[ 13 ] = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
    m2v[ 14 ] = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
    m2v[ 15 ] = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;
    
    m2.multiplyScalar( 1 / m1.determinant());

    return m2;

};


GLOW.Matrix4.makeFrustum = function ( left, right, bottom, top, near, far, destMatrix ) {

    var m, mv, x, y, a, b, c, d;

    m = destMatrix || new GLOW.Matrix4();
    x = 2 * near / ( right - left );
    y = 2 * near / ( top - bottom );
    a = ( right + left ) / ( right - left );
    b = ( top + bottom ) / ( top - bottom );
    c = - ( far + near ) / ( far - near );
    d = - 2 * far * near / ( far - near );

    mv = m.value;
    mv[ 0 ] = x;  mv[ 4 ] = 0;  mv[ 8  ] = a;   mv[ 12 ] = 0;
    mv[ 1 ] = 0;  mv[ 5 ] = y;  mv[ 9  ] = b;   mv[ 13 ] = 0;
    mv[ 2 ] = 0;  mv[ 6 ] = 0;  mv[ 10 ] = c;   mv[ 14 ] = d;
    mv[ 3 ] = 0;  mv[ 7 ] = 0;  mv[ 11 ] = - 1; mv[ 15 ] = 0;

    return m;
};

GLOW.Matrix4.makeProjection = function ( fov, aspect, near, far, destMatrix ) {

    var ymax, ymin, xmin, xmax;

    ymax = near * Math.tan( fov * Math.PI / 360 );
    ymin = - ymax;
    xmin = ymin * aspect;
    xmax = ymax * aspect;

    return GLOW.Matrix4.makeFrustum( xmin, xmax, ymin, ymax, near, far, destMatrix );

};

GLOW.Matrix4.makeOrtho = function( left, right, top, bottom, near, far, destMatrix ) {

    var m, mv, x, y, z, w, h, p;

    m = destMatrix || new GLOW.Matrix4();
    w = Math.abs( right - left );
    h = Math.abs( top - bottom );
    p = Math.abs( far - near );
    x = ( right + left ) / w;
    y = ( top + bottom ) / h;
    z = ( far + near ) / p;

    mv = m.value;

    mv[ 0 ] = 2 / w; mv[ 4 ] = 0;     mv[ 8  ] = 0;      mv[ 12 ] = -x;
    mv[ 1 ] = 0;     mv[ 5 ] = 2 / h; mv[ 9  ] = 0;      mv[ 13 ] = -y;
    mv[ 2 ] = 0;     mv[ 6 ] = 0;     mv[ 10 ] = -2 / p; mv[ 14 ] = -z;
    mv[ 3 ] = 0;     mv[ 7 ] = 0;     mv[ 11 ] = 0;      mv[ 15 ] = 1;

    return m;

};


GLOW.Matrix4.tempVector3A = new GLOW.Vector3();
GLOW.Matrix4.tempVector3B = new GLOW.Vector3();
GLOW.Matrix4.tempVector3C = new GLOW.Vector3();
GLOW.Matrix4.tempVector3D = new GLOW.Vector3();
/**
 * GLOW.Vector3 Based upon THREE.Vector3 by
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Quaternion = (function() {

    "use strict"; "use restrict";
    
    // constructor
    function quaternion( x, y, z, w ) {
        this.value = new Float32Array( 4 );
        this.value[ 0 ] = x !== undefined ? x : 0;
        this.value[ 1 ] = y !== undefined ? y : 0;
        this.value[ 2 ] = z !== undefined ? z : 0;
        this.value[ 3 ] = w !== undefined ? w : 0;
    }
    
    // methods
	quaternion.prototype.set = function ( x, y, z, w ) {
		this.value[ 0 ] = x;
		this.value[ 1 ] = y;
		this.value[ 2 ] = z;
		this.value[ 3 ] = w;
		return this;
	};

	quaternion.prototype.copy = function ( v ) {
		this.value[ 0 ] = v.value[ 0 ];
		this.value[ 1 ] = v.value[ 1 ];
		this.value[ 2 ] = v.value[ 2 ];
		this.value[ 3 ] = v.value[ 3 ];
		return this;
	};

	quaternion.prototype.add = function ( v1, v2 ) {
		this.value[ 0 ] = v1.value[ 0 ] + v2.value[ 0 ];
		this.value[ 1 ] = v1.value[ 1 ] + v2.value[ 1 ];
		this.value[ 2 ] = v1.value[ 2 ] + v2.value[ 2 ];
		this.value[ 3 ] = v1.value[ 3 ] + v2.value[ 3 ];
		return this;
	};

	quaternion.prototype.addSelf = function ( v ) {
		this.value[ 0 ] += v.value[ 0 ];
		this.value[ 1 ] += v.value[ 1 ];
		this.value[ 2 ] += v.value[ 2 ];
		this.value[ 3 ] += v.value[ 3 ];
		return this;
	};

	quaternion.prototype.sub = function ( v1, v2 ) {
		this.value[ 0 ] = v1.value[ 0 ] - v2.value[ 0 ];
		this.value[ 1 ] = v1.value[ 1 ] - v2.value[ 1 ];
		this.value[ 2 ] = v1.value[ 2 ] - v2.value[ 2 ];
		this.value[ 3 ] = v1.value[ 3 ] - v2.value[ 3 ];
		return this;
	};

	quaternion.prototype.subSelf = function ( v ) {
		this.value[ 0 ] -= v.value[ 0 ];
		this.value[ 1 ] -= v.value[ 1 ];
		this.value[ 2 ] -= v.value[ 2 ];
		this.value[ 3 ] -= v.value[ 3 ];
		return this;
	};

	quaternion.prototype.multiplyScalar = function ( s ) {
		this.value[ 0 ] *= s;
		this.value[ 1 ] *= s;
		this.value[ 2 ] *= s;
		this.value[ 3 ] *= s;
		return this;
	};

	quaternion.prototype.divideScalar = function ( s ) {
		this.value[ 0 ] /= s;
		this.value[ 1 ] /= s;
		this.value[ 2 ] /= s;
		this.value[ 3 ] /= s;
		return this;
	};

    quaternion.prototype.normalize = function() {
    	var l = Math.sqrt( this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ] + this.value[ 3 ] * this.value[ 3 ] );
    	l > 0 ? this.multiplyScalar( 1 / l ) : this.set( 0, 0, 0, 1 );
    	return this;
    };

	quaternion.prototype.lerpSelf = function ( v, alpha ) {
		this.value[ 0 ] += (v.x - this.value[ 0 ]) * alpha;
		this.value[ 1 ] += (v.y - this.value[ 1 ]) * alpha;
		this.value[ 2 ] += (v.z - this.value[ 2 ]) * alpha;
		this.value[ 3 ] += (v.w - this.value[ 3 ]) * alpha;
	    return this;
	};

	quaternion.prototype.clone = function () {
		return new GLOW.Quaternion( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ], this.value[ 3 ] );
	};

    return quaternion;
})();
