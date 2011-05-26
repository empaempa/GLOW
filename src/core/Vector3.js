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

	that.set = function ( x, y, z ) {

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

		v[ 0 ] = a[ 0 ] + b[ 0 ];
		v[ 1 ] = a[ 1 ] + b[ 1 ];
		v[ 2 ] = a[ 2 ] + b[ 2 ];

		return that;
	}

	that.addSelf = function ( a ) {

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

		v[ 0 ] = a[ 0 ] - b[ 0 ];
		v[ 1 ] = a[ 1 ] - b[ 1 ];
		v[ 2 ] = a[ 2 ] - b[ 2 ];
		
		return that;
	}

	that.subSelf = function ( a ) {

		v[ 0 ] -= a[ 0 ];
		v[ 1 ] -= a[ 1 ];
		v[ 2 ] -= a[ 2 ];
		
		return that;
	}

	that.cross = function ( a, b ) {

		v[ 0 ] = a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ];
		v[ 1 ] = a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ];
		v[ 2 ] = a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ];

		return that;
	}

	that.crossSelf = function ( a ) {

		var ax = a[ 0 ], ay = a[ 1 ], az = a[ 2 ];
		var vx = v[ 0 ], vy = v[ 1 ], vz = v[ 2 ];

		v[ 0 ] = ay * vz - az * vy;
		v[ 1 ] = az * vx - ax * vz;
		v[ 2 ] = ax * vy - ay * vx;

		return that;

	}
/*
	multiply : function ( a, b ) {

		v.set(

			a[ 0 ] * b[ 0 ],
			a[ 1 ] * b[ 1 ],
			a[ 2 ] * b[ 2 ]

		);

		return v;

	},

	multiplySelf : function ( v ) {

		v.set(

			v[ 0 ] * v[ 0 ],
			v[ 1 ] * v[ 1 ],
			v[ 2 ] * v[ 2 ]

		);

		return v;

	},

	multiplyScalar : function ( s ) {

		v.set(

			v[ 0 ] * s,
			v[ 1 ] * s,
			v[ 2 ] * s

		);

		return v;

	},

	divideSelf : function ( v ) {

		v.set(

			v[ 0 ] / v[ 0 ],
			v[ 1 ] / v[ 1 ],
			v[ 2 ] / v[ 2 ]

		);

		return v;

	},

	divideScalar : function ( s ) {

		v.set(

			v[ 0 ] / s,
			v[ 1 ] / s,
			v[ 2 ] / s

		);

		return v;

	},

	negate : function () {

		v.set(

			- v[ 0 ],
			- v[ 1 ],
			- v[ 2 ]

		);

		return v;

	},

	dot : function ( v ) {

		return v[ 0 ] * v[ 0 ] + v[ 1 ] * v[ 1 ] + v[ 2 ] * v[ 2 ];

	},

	distanceTo : function ( v ) {

		return Math.sqrt( v.distanceToSquared( v ) );

	},

	distanceToSquared : function ( v ) {

		var dx = v[ 0 ] - v[ 0 ], dy = v[ 1 ] - v[ 1 ], dz = v[ 2 ] - v[ 2 ];
		return dx * dx + dy * dy + dz * dz;

	},

	length : function () {

		return Math.sqrt( v.lengthSq() );

	},

	lengthSq : function () {

		return v[ 0 ] * v[ 0 ] + v[ 1 ] * v[ 1 ] + v[ 2 ] * v[ 2 ];

	},

	lengthManhattan : function () {

		return v[ 0 ] + v[ 1 ] + v[ 2 ];

	},

	normalize : function () {

		var l = v.length();

		l > 0 ? v.multiplyScalar( 1 / l ) : v.set( 0, 0, 0 );

		return v;

	},

	setPositionFromMatrix : function ( m ) {

		v[ 0 ] = m.n14;
		v[ 1 ] = m.n24;
		v[ 2 ] = m.n34;

	},

	setRotationFromMatrix : function ( m ) {

		var cosY = Math.cos( v[ 1 ] );

		v[ 1 ] = Math.asin( m.n13 );

		if ( Math.abs( cosY ) > 0.00001 ) {

			v[ 0 ] = Math.atan2( - m.n23 / cosY, m.n33 / cosY );
			v[ 2 ] = Math.atan2( - m.n12 / cosY, m.n11 / cosY );

		} else {

			v[ 0 ] = 0;
			v[ 2 ] = Math.atan2( m.n21, m.n22 );

		}

	},

	setLength : function ( l ) {

		return v.normalize().multiplyScalar( l );

	},

	isZero : function () {

		var almostZero = 0.0001;
		return ( Math.abs( v[ 0 ] ) < almostZero ) && ( Math.abs( v[ 1 ] ) < almostZero ) && ( Math.abs( v[ 2 ] ) < almostZero );

	},

	clone : function () {

		return new THREE.Vector3( v[ 0 ], v[ 1 ], v[ 2 ] );

	}*/
	
	return that;

};
