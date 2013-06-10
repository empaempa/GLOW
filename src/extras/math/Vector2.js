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

