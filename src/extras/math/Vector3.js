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
    }

    // methods
    vector3.prototype.set = function( x, y, z ) {
    	this.value[ 0 ] = x;
    	this.value[ 1 ] = y;
    	this.value[ 2 ] = z;
    	return this;
    }

    vector3.prototype.copy = function ( v ) {
    	this.set( v.value[ 0 ], v.value[ 1 ], v.value[ 2 ] );
    	return this;
    }

    vector3.prototype.add = function ( a, b ) {
    	a = a.value;
    	b = b.value;
    	this.value[ 0 ] = a[ 0 ] + b[ 0 ];
    	this.value[ 1 ] = a[ 1 ] + b[ 1 ];
    	this.value[ 2 ] = a[ 2 ] + b[ 2 ];
    	return this;
    }

    vector3.prototype.addSelf = function ( a ) {
    	a = a.value;
    	this.value[ 0 ] = this.value[ 0 ] + a[ 0 ];
    	this.value[ 1 ] = this.value[ 1 ] + a[ 1 ];
    	this.value[ 2 ] = this.value[ 2 ] + a[ 2 ];
    	return this;
    }

    vector3.prototype.addScalar = function ( s ) {
    	this.value[ 0 ] += s;
    	this.value[ 1 ] += s;
    	this.value[ 2 ] += s;
    	return this;
    }


    vector3.prototype.sub = function ( a, b ) {
    	a = a.value;
    	b = b.value;
    	this.value[ 0 ] = a[ 0 ] - b[ 0 ];
    	this.value[ 1 ] = a[ 1 ] - b[ 1 ];
    	this.value[ 2 ] = a[ 2 ] - b[ 2 ];
    	return this;
    }

    vector3.prototype.subSelf = function ( a ) {
    	a = a.value;
    	this.value[ 0 ] -= a[ 0 ];
    	this.value[ 1 ] -= a[ 1 ];
    	this.value[ 2 ] -= a[ 2 ];
    	return this;
    }

    vector3.prototype.cross = function ( a, b ) {
    	a = a.value;
    	b = b.value;
    	this.value[ 0 ] = a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ];
    	this.value[ 1 ] = a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ];
    	this.value[ 2 ] = a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ];
    	return this;
    }

    vector3.prototype.crossSelf = function ( a ) {
    	a = a.value;
    	var ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ];
    	var vx = this.value[ 0 ], vy = this.value[ 1 ], vz = this.value[ 2 ];
    	this.value[ 0 ] = ay * vz - az * vy;
    	this.value[ 1 ] = az * vx - ax * vz;
    	this.value[ 2 ] = ax * vy - ay * vx;
    	return this;
    }

    vector3.prototype.multiply = function( a, b ) {
    	a = a.value;
    	b = b.value;
    	this.value[ 0 ] = a[ 0 ] * b[ 0 ];
    	this.value[ 1 ] = a[ 1 ] * b[ 1 ];
    	this.value[ 2 ] = a[ 2 ] * b[ 2 ];
    	return this;
    }

    vector3.prototype.multiplySelf = function( a ) {
    	a = a.value;
    	this.value[ 0 ] *= a[ 0 ];
    	this.value[ 1 ] *= a[ 1 ];
    	this.value[ 2 ] *= a[ 2 ];
    	return this;
    }

    vector3.prototype.multiplyScalar = function( s ) {
    	this.value[ 0 ] *= s;
    	this.value[ 1 ] *= s;
    	this.value[ 2 ] *= s;
    	return this;
    }

    vector3.prototype.divideSelf = function( a ) {
    	a = a.value;
    	this.value[ 0 ] /= a[ 0 ];
    	this.value[ 1 ] /= a[ 1 ];
    	this.value[ 2 ] /= a[ 2 ];
    	return this;
    }

    vector3.prototype.divideScalar = function( s ) {
    	this.value[ 0 ] /= s;
    	this.value[ 1 ] /= s;
    	this.value[ 2 ] /= s;
    	return this;
    }

    vector3.prototype.negate = function() {
    	this.value[ 0 ] = -this.value[ 0 ];
    	this.value[ 1 ] = -this.value[ 1 ];
    	this.value[ 2 ] = -this.value[ 2 ];
    	return this;
    }

    vector3.prototype.dot = function( a ) {
    	a = a.value;
    	return this.value[ 0 ] * a[ 0 ] + this.value[ 1 ] * a[ 1 ] + this.value[ 2 ] * a[ 2 ];
    }

    vector3.prototype.distanceTo = function ( a ) {
    	return Math.sqrt( this.distanceToSquared( a ) );
    }

    vector3.prototype.distanceToSquared = function( a ) {
    	a = a.value;
    	var dx = this.value[ 0 ] - a[ 0 ], dy = this.value[ 1 ] - a[ 1 ], dz = this.value[ 2 ] - a[ 2 ];
    	return dx * dx + dy * dy + dz * dz;
    }

    vector3.prototype.length = function() {
    	return Math.sqrt( this.lengthSq() );
    }

    vector3.prototype.lengthSq = function() {
    	return this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ];
    }

    vector3.prototype.lengthManhattan = function() {
    	return this.value[ 0 ] + this.value[ 1 ] + this.value[ 2 ];
    }

    vector3.prototype.normalize = function() {
    	var l = Math.sqrt( this.value[ 0 ] * this.value[ 0 ] + this.value[ 1 ] * this.value[ 1 ] + this.value[ 2 ] * this.value[ 2 ] );
    	l > 0 ? this.multiplyScalar( 1 / l ) : this.set( 0, 0, 0 );
    	return this;
    }

    vector3.prototype.setPositionFromMatrix = function( m ) {
    	m = m.value;
    	this.value[ 0 ] = m[ 12 ];
    	this.value[ 1 ] = m[ 13 ];
    	this.value[ 2 ] = m[ 14 ];
    }

    vector3.prototype.setLength = function( l ) {
    	return this.normalize().multiplyScalar( l );
    }

    vector3.prototype.isZero = function() {
    	var almostZero = 0.0001;
    	return ( Math.abs( this.value[ 0 ] ) < almostZero ) && ( Math.abs( this.value[ 1 ] ) < almostZero ) && ( Math.abs( this.value[ 2 ] ) < almostZero );
    }

    vector3.prototype.clone = function() {
    	return new GLOW.Vector3( this.value[ 0 ], this.value[ 1 ], this.value[ 2 ] );
    }

    return vector3;
})();
