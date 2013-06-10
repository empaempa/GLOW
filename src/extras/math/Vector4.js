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
