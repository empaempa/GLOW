/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Vector3 = function( x, y, z ) {

	var v = new Float32Array( 3 );
	var that = { value: v };
	
	v[ 0 ] = x !== undefined ? x : 0;
	v[ 1 ] = y !== undefined ? y : 0;
	v[ 2 ] = z !== undefined ? z : 0;

	that.set = function( x, y, z ) {

		v[ 0 ] = x;
		v[ 1 ] = y;
		v[ 2 ] = z;

		return that;
	}

	that.copy = function ( v ) {

		that.set( v[ 0 ], v[ 1 ], v[ 2 ] );

		return that;
	}

	that.add = function ( a, b ) {

		a = a.value;
		b = b.value;

		v[ 0 ] = a[ 0 ] + b[ 0 ];
		v[ 1 ] = a[ 1 ] + b[ 1 ];
		v[ 2 ] = a[ 2 ] + b[ 2 ];

		return that;
	}

	that.addSelf = function ( a ) {

		a = a.value;

		v[ 0 ] = v[ 0 ] + a[ 0 ];
		v[ 1 ] = v[ 1 ] + a[ 1 ];
		v[ 2 ] = v[ 2 ] + a[ 2 ];

		return that;
	}

	that.addScalar = function ( s ) {

		v[ 0 ] += s;
		v[ 1 ] += s;
		v[ 2 ] += s;

		return that;
	}


	that.sub = function ( a, b ) {

		a = a.value;
		b = b.value;

		v[ 0 ] = a[ 0 ] - b[ 0 ];
		v[ 1 ] = a[ 1 ] - b[ 1 ];
		v[ 2 ] = a[ 2 ] - b[ 2 ];
		
		return that;
	}

	that.subSelf = function ( a ) {

		a = a.value;

		v[ 0 ] -= a[ 0 ];
		v[ 1 ] -= a[ 1 ];
		v[ 2 ] -= a[ 2 ];
		
		return that;
	}

	that.cross = function ( a, b ) {

		a = a.value;
		b = b.value;

		v[ 0 ] = a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ];
		v[ 1 ] = a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ];
		v[ 2 ] = a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ];

		return that;
	}

	that.crossSelf = function ( a ) {

		a = a.value;

		var ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ];
		var vx = v[ 0 ], vy = v[ 1 ], vz = v[ 2 ];

		v[ 0 ] = ay * vz - az * vy;
		v[ 1 ] = az * vx - ax * vz;
		v[ 2 ] = ax * vy - ay * vx;

		return that;

	}

	that.multiply = function( a, b ) {

		a = a.value;
		b = b.value;
		
		v[ 0 ] = a[ 0 ] * b[ 0 ];
		v[ 1 ] = a[ 1 ] * b[ 1 ];
		v[ 2 ] = a[ 2 ] * b[ 2 ];

		return that;
	}

	that.multiplySelf = function( a ) {

		a = a.value;
		
		v[ 0 ] *= a[ 0 ];
		v[ 1 ] *= a[ 1 ];
		v[ 2 ] *= a[ 2 ];

		return that;
	}

	that.multiplyScalar = function( s ) {

		v[ 0 ] *= s;
		v[ 1 ] *= s;
		v[ 2 ] *= s;

		return that;
	}

	that.divideSelf = function( a ) {

		a = a.value;

		v[ 0 ] /= a[ 0 ];
		v[ 1 ] /= a[ 1 ];
		v[ 2 ] /= a[ 2 ];

		return that;
	}

	that.divideScalar = function( s ) {

		v[ 0 ] /= s;
		v[ 1 ] /= s;
		v[ 2 ] /= s;

		return that;
	}

	that.negate = function() {

		v[ 0 ] = -v[ 0 ];
		v[ 1 ] = -v[ 1 ];
		v[ 2 ] = -v[ 2 ];

		return that;
	}

	that.dot = function( a ) {

		a = a.value;

		return v[ 0 ] * a[ 0 ] + v[ 1 ] * a[ 1 ] + v[ 2 ] * a[ 2 ];
	}

	that.distanceTo = function ( a ) {

		return Math.sqrt( that.distanceToSquared( a ) );
	}

	that.distanceToSquared = function( a ) {
		
		a = a.value;

		var dx = v[ 0 ] - a[ 0 ], dy = v[ 1 ] - a[ 1 ], dz = v[ 2 ] - a[ 2 ];
		return dx * dx + dy * dy + dz * dz;
	}

	that.length = function() {

		return Math.sqrt( that.lengthSq() );
	}

	that.lengthSq = function() {

		return v[ 0 ] * v[ 0 ] + v[ 1 ] * v[ 1 ] + v[ 2 ] * v[ 2 ];
	}

	that.lengthManhattan = function() {

		return v[ 0 ] + v[ 1 ] + v[ 2 ];
	}

	that.normalize = function() {

		var l = Math.sqrt( v[ 0 ] * v[ 0 ] + v[ 1 ] * v[ 1 ] + v[ 2 ] * v[ 2 ] );

		l > 0 ? that.multiplyScalar( 1 / l ) : that.set( 0, 0, 0 );

		return that;
	}

	that.setPositionFromMatrix = function( m ) {

		m = m.value;

		v[ 0 ] = m[ 12 ];
		v[ 1 ] = m[ 13 ];
		v[ 2 ] = m[ 14 ];
	}

	that.setLength = function( l ) {

		return that.normalize().multiplyScalar( l );
	}

	that.isZero = function() {

		var almostZero = 0.0001;
		return ( Math.abs( v[ 0 ] ) < almostZero ) && ( Math.abs( v[ 1 ] ) < almostZero ) && ( Math.abs( v[ 2 ] ) < almostZero );
	}

	that.clone = function() {

		return GLOW.Vector3( v[ 0 ], v[ 1 ], v[ 2 ] );
	}
	
	return that;
};
