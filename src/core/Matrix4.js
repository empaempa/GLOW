/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

GLOW.Matrix4 = function() {

	var m = new Float32Array( 16 );
	var that = { value: m };
	var rotation = GLOW.Vector3();
	
	that.transposeUniform = false;
	that.autoUpdate = true;
	that.children = [];
	that.parent = undefined;


	//--- methods ---

	that.update = function() {
		
		that.setRotationFromEuler( rotation );
		
	}

	that.set = function( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ) {

		m[ 0 ] = m11; m[ 4 ] = m12; m[ 8 ] = m13; m[ 12 ] = m14;
		m[ 1 ] = m21; m[ 5 ] = m22; m[ 9 ] = m23; m[ 13 ] = m24;
		m[ 2 ] = m31; m[ 6 ] = m32; m[ 10 ] = m33; m[ 14 ] = m34;
		m[ 3 ] = m41; m[ 7 ] = m42; m[ 11 ] = m43; m[ 15 ] = m44;

		return that;
	}

	that.identity = function () {

		that.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);

		return that;
	}

	that.copy = function ( m ) {

		that.set(
			m[  0 ], m[  1 ], m[  2 ], m[  3 ],
			m[  4 ], m[  5 ], m[  6 ], m[  7 ],
			m[  8 ], m[  9 ], m[ 10 ], m[ 11 ],
			m[ 12 ], m[ 13 ], m[ 14 ], m[ 15 ]
		);

		return that;
	}

/*	that.lookAt = function ( eye, center, up ) {

		var x = THREE.Matrix4.__v1, y = THREE.Matrix4.__v2, z = THREE.Matrix4.__v3;

		z.sub( eye, center ).normalize();

		if ( z.length() === 0 ) {

			z.z = 1;

		}

		x.cross( up, z ).normalize();

		if ( x.length() === 0 ) {

			z.x += 0.0001;
			x.cross( up, z ).normalize();

		}

		y.cross( z, x ).normalize();


		m[ 0 ] = x.x; m[ 4 ] = y.x; m[  8 ] = z.x;
		m[ 1 ] = x.y; m[ 5 ] = y.y; m[  9 ] = z.y;
		m[ 2 ] = x.z; m[ 6 ] = y.z; m[ 10 ] = z.z;

		return m;

	},*/

	that.multiplyVector3 = function ( v ) {

		var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ],
		d = 1 / ( m[ 3 ] * vx + m[ 7 ] * vy + m[ 11 ] * vz + m[ 15 ] );

		v.value[ 0 ] = ( m[ 0 ] * vx + m[ 4 ] * vy + m[ 8 ] * vz + m[ 12 ] ) * d;
		v.value[ 1 ] = ( m[ 1 ] * vx + m[ 5 ] * vy + m[ 9 ] * vz + m[ 13 ] ) * d;
		v.value[ 2 ] = ( m[ 2 ] * vx + m[ 6 ] * vy + m[ 10 ] * vz + m[ 14 ] ) * d;

		return v;
	}

	that.multiplyVector4 = function ( v ) {

		var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ], vw = v.value[ 3 ];

		v.value[ 0 ] = m[ 0 ] * vx + m[ 4 ] * vy + m[ 8 ] * vz + m[ 12 ] * vw;
		v.value[ 1 ] = m[ 1 ] * vx + m[ 5 ] * vy + m[ 9 ] * vz + m[ 13 ] * vw;
		v.value[ 2 ] = m[ 2 ] * vx + m[ 6 ] * vy + m[ 10 ] * vz + m[ 14 ] * vw;
		v.value[ 3 ] = m[ 3 ] * vx + m[ 7 ] * vy + m[ 11 ] * vz + m[ 15 ] * vw;

		return v;
	}

	that.rotateAxis = function ( v ) {

		var vx = v.value[ 0 ], vy = v.value[ 1 ], vz = v.value[ 2 ];

		v.value[ 0 ] = vx * m[ 0 ] + vy * m[ 4 ] + vz * m[ 8 ];
		v.value[ 1 ] = vx * m[ 1 ] + vy * m[ 5 ] + vz * m[ 9 ];
		v.value[ 2 ] = vx * m[ 2 ] + vy * m[ 6 ] + vz * m[ 10 ];

		v.normalize();

		return v;
	}

	that.crossVector = function ( a ) {

		var v = GLOW.Vector4();
		var ax = a.value[ 0 ], ay = a.value[ 1 ], az = a.value[ 2 ], aw = a.value[ 3 ];

		v.value[ 0 ] = m[ 0 ] * ax + m[ 4 ] * ay + m[ 8 ] * az + m[ 12 ] * aw;
		v.value[ 1 ] = m[ 1 ] * ax + m[ 5 ] * ay + m[ 9 ] * az + m[ 13 ] * aw;
		v.value[ 2 ] = m[ 2 ] * ax + m[ 6 ] * ay + m[ 10 ] * az + m[ 14 ] * aw;
		v.value[ 3 ] = ( aw ) ? m[ 3 ] * ax + m[ 7 ] * ay + m[ 11 ] * az + m[ 15 ] * aw : 1;

		return v;
	}

	that.multiply = function ( a, b ) {

/*
//reference:
//m.n11 = m[ 0 ]; m.n12 = m[ 4 ]; m.n13 = m[ 8 ]; m.n14 = m[ 12 ];
//m.n21 = m[ 1 ]; m.n22 = m[ 5 ]; m.n23 = m[ 9 ]; m.n24 = m[ 13 ];
//m.n31 = m[ 2 ]; m.n32 = m[ 6 ]; m.n33 = m[ 10 ]; m.n34 = m[ 14 ];
//m.n41 = m[ 3 ]; m.n42 = m[ 7 ]; m.n43 = m[ 11 ]; m.n44 = m[ 15 ];



		var a11 = a.n11, a12 = a.n12, a13 = a.n13, a14 = a.n14,
		a21 = a.n21, a22 = a.n22, a23 = a.n23, a24 = a.n24,
		a31 = a.n31, a32 = a.n32, a33 = a.n33, a34 = a.n34,
		a41 = a.n41, a42 = a.n42, a43 = a.n43, a44 = a.n44,

		b11 = b.n11, b12 = b.n12, b13 = b.n13, b14 = b.n14,
		b21 = b.n21, b22 = b.n22, b23 = b.n23, b24 = b.n24,
		b31 = b.n31, b32 = b.n32, b33 = b.n33, b34 = b.n34,
		b41 = b.n41, b42 = b.n42, b43 = b.n43, b44 = b.n44;

		m[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		m[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32;
		m[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33;
		m[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14;

		m[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		m[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32;
		m[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33;
		m[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24;

		m[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		m[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32;
		m[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33;
		m[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34;

		m[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31;
		m[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32;
		m[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33;
		m[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44;

		return that;
*/
	},

	that.multiplySelf = function ( a ) {

		this.multiply( m, a );

		return that;
	}

	that.multiplyScalar = function ( s ) {

		m[ 0 ] *= s; m[ 4 ] *= s; m[ 8 ] *= s; m[ 12 ] *= s;
		m[ 1 ] *= s; m[ 5 ] *= s; m[ 9 ] *= s; m[ 13 ] *= s;
		m[ 2 ] *= s; m[ 6 ] *= s; m[ 10 ] *= s; m[ 14 ] *= s;
		m[ 3 ] *= s; m[ 7 ] *= s; m[ 11 ] *= s; m[ 15 ] *= s;

		return that;
	}

	that.determinant = function () {

		var n11 = m[ 0 ], n12 = m[ 4 ], n13 = m[ 8 ], n14 = m[ 12 ],
		n21 = m[ 1 ], n22 = m[ 5 ], n23 = m[ 9 ], n24 = m[ 13 ],
		n31 = m[ 2 ], n32 = m[ 6 ], n33 = m[ 10 ], n34 = m[ 14 ],
		n41 = m[ 3 ], n42 = m[ 7 ], n43 = m[ 11 ], n44 = m[ 15 ];

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )
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
	}

	that.transpose = function () {

		var tmp;

		tmp = m[ 1 ]; m[ 1 ] = m[ 4 ]; m[ 4 ] = tmp;
		tmp = m[ 2 ]; m[ 2 ] = m[ 8 ]; m[ 8 ] = tmp;
		tmp = m[ 6 ]; m[ 6 ] = m[ 9 ]; m[ 9 ] = tmp;

		tmp = m[ 3 ]; m[ 3 ] = m[ 12 ]; m[ 12 ] = tmp;
		tmp = m[ 7 ]; m[ 7 ] = m[ 13 ]; m[ 13 ] = tmp;
		tmp = m[ 11 ]; m[ 11 ] = m[ 14 ]; m[ 11 ] = tmp;

		return that;
	}

	that.clone = function () {

		var clone = new GLOW.Matrix4();
		clone.value = new Float32Array( m );

		return clone;
	}


/*	that.setRotationAxis = function( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		var c = Math.cos( angle ),
		s = Math.sin( angle ),
		t = 1 - c,
		x = axis.x, y = axis.y, z = axis.z,
		tx = t * x, ty = t * y;

		this.set(

		 	tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		 return this;

	},
*/
	that.setPosition = function( x, y, z ) {

		m[ 12 ] = x;
		m[ 13 ] = y;
		m[ 14 ] = z;

		return that;

	}

	setRotation = function( x, y, z ) {
		
		that.rotation.set( x, y, z );
		
		return that;
	}
	
/*	getPosition : function() {
		
		if( !that.position ) {
			
			that.position = new GLOW.Vector3();
			
		}
		
		that.position.set( m[ 12 ], m[ 13 ], m[ 14 ] );
		
		return that.position;
	}

	getColumnX : function() {
		
		if( !this.columnX ) {
			
			this.columnX = new THREE.Vector3();
			
		}
		
		this.columnX.set( m[ 0 ], m[ 1 ], m[ 2 ] );
		
		return this.columnX;
	},

	getColumnY : function() {
		
		if( !this.columnY ) {
			
			this.columnY = new THREE.Vector3();
			
		}
		
		this.columnY.set( m[ 4 ], m[ 5 ], m[ 6 ] );
		
		return this.columnY;
	},

	getColumnZ : function() {
		
		if( !this.columnZ ) {
			
			this.columnZ = new THREE.Vector3();
			
		}
		
		this.columnZ.set( m[ 8 ], m[ 9 ], m[ 10 ] );
		
		return this.columnZ;
	},
*/
	that.setRotationFromEuler = function( v ) {

		var x = v.value[ 0 ], y = v.value[ 1 ], z = v.value[ 2 ],
		a = Math.cos( x ), b = Math.sin( x ),
		c = Math.cos( y ), d = Math.sin( y ),
		e = Math.cos( z ), f = Math.sin( z ),
		ad = a * d, bd = b * d;

		m[ 0 ] = c * e;
		m[ 4 ] = - c * f;
		m[ 8 ] = d;

		m[ 1 ] = bd * e + a * f;
		m[ 5 ] = - bd * f + a * e;
		m[ 9 ] = - b * c;

		m[ 2 ] = - ad * e + b * f;
		m[ 6 ] = ad * f + b * e;
		m[ 10 ] = a * c;

		return that;
	}

/*	setRotationFromQuaternion : function( q ) {

		var x = q.x, y = q.y, z = q.z, w = q.w,
		x2 = x + x, y2 = y + y, z2 = z + z,
		xx = x * x2, xy = x * y2, xz = x * z2,
		yy = y * y2, yz = y * z2, zz = z * z2,
		wx = w * x2, wy = w * y2, wz = w * z2;

		m[ 0 ] = 1 - ( yy + zz );
		m[ 4 ] = xy - wz;
		m[ 8 ] = xz + wy;

		m[ 1 ] = xy + wz;
		m[ 5 ] = 1 - ( xx + zz );
		m[ 9 ] = yz - wx;

		m[ 2 ] = xz - wy;
		m[ 6 ] = yz + wx;
		m[ 10 ] = 1 - ( xx + yy );

		return this;

	},
*/
	that.scale = function ( v ) {

		var x = v.value[ 0 ], y = v.value[ 1 ], z = v.value[ 2 ];

		m[ 0 ] *= x; m[ 4 ] *= y; m[ 8 ] *= z;
		m[ 1 ] *= x; m[ 5 ] *= y; m[ 9 ] *= z;
		m[ 2 ] *= x; m[ 6 ] *= y; m[ 10 ] *= z;
		m[ 3 ] *= x; m[ 7 ] *= y; m[ 11 ] *= z;

		return that;
	}

/*	extractPosition : function ( m ) {

		m[ 12 ] = m.n14;
		m[ 13 ] = m.n24;
		m[ 14 ] = m.n34;

	},

	extractRotation : function ( m, s ) {

		var invScaleX = 1 / s.x, invScaleY = 1 / s.y, invScaleZ = 1 / s.z;

		m[ 0 ] = m.n11 * invScaleX;
		m[ 1 ] = m.n21 * invScaleX;
		m[ 2 ] = m.n31 * invScaleX;

		m[ 4 ] = m.n12 * invScaleY;
		m[ 5 ] = m.n22 * invScaleY;
		m[ 6 ] = m.n32 * invScaleY;

		m[ 8 ] = m.n13 * invScaleZ;
		m[ 9 ] = m.n23 * invScaleZ;
		m[ 10 ] = m.n33 * invScaleZ;

	}
*/

	return that.identity();

};

GLOW.Matrix4.makeInverse = function ( m1, m2 ) {

	// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
	//m.n11 = m[ 0 ]; m.n12 = m[ 4 ]; m.n13 = m[ 8 ]; m.n14 = m[ 12 ];
	//m.n21 = m[ 1 ]; m.n22 = m[ 5 ]; m.n23 = m[ 9 ]; m.n24 = m[ 13 ];
	//m.n31 = m[ 2 ]; m.n32 = m[ 6 ]; m.n33 = m[ 10 ]; m.n34 = m[ 14 ];
	//m.n41 = m[ 3 ]; m.n42 = m[ 7 ]; m.n43 = m[ 11 ]; m.n44 = m[ 15 ];

	if( m2 === undefined ) m2 = GLOW.Matrix4();

	var m1v = m1.value;
	var m2v = m2.value;

	var n11 = m1v[ 0 ], n12 = m1v[ 4 ], n13 = m1v[ 8  ], n14 = m1v[ 12 ],
	    n21 = m1v[ 1 ], n22 = m1v[ 5 ], n23 = m1v[ 9  ], n24 = m1v[ 13 ],
	    n31 = m1v[ 2 ], n32 = m1v[ 6 ], n33 = m1v[ 10 ], n34 = m1v[ 14 ],
	    n41 = m1v[ 3 ], n42 = m1v[ 7 ], n43 = m1v[ 11 ], n44 = m1v[ 15 ];

	m2v[ 0  ] = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
	m2v[ 4  ] = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
	m2v[ 8  ] = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
	m2v[ 12  ] = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
	m2v[ 1  ] = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
	m2v[ 5  ] = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
	m2v[ 9  ] = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
	m2v[ 13  ] = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
	m2v[ 2  ] = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
	m2v[ 6  ] = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
	m2v[ 10 ] = n13*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
	m2v[ 14 ] = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
	m2v[ 3 ] = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
	m2v[ 7 ] = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
	m2v[ 11 ] = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
	m2v[ 15 ] = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;
	
	m2.multiplyScalar( 1 / m1.determinant());

	return m2;

};

/*THREE.Matrix4.makeInvert3x3 = function ( m1 ) {

	// input:  THREE.Matrix4, output: THREE.Matrix3
	// ( based on http://code.google.com/p/webgl-mjs/ )

	var m33 = m1.m33, m33m = m33.m,
	a11 =   m1.n33 * m1.n22 - m1.n32 * m1.n23,
	a21 = - m1.n33 * m1.n21 + m1.n31 * m1.n23,
	a31 =   m1.n32 * m1.n21 - m1.n31 * m1.n22,
	a12 = - m1.n33 * m1.n12 + m1.n32 * m1.n13,
	a22 =   m1.n33 * m1.n11 - m1.n31 * m1.n13,
	a32 = - m1.n32 * m1.n11 + m1.n31 * m1.n12,
	a13 =   m1.n23 * m1.n12 - m1.n22 * m1.n13,
	a23 = - m1.n23 * m1.n11 + m1.n21 * m1.n13,
	a33 =   m1.n22 * m1.n11 - m1.n21 * m1.n12,

	det = m1.n11 * a11 + m1.n21 * a12 + m1.n31 * a13,

	idet;

	// no inverse
	if (det == 0) {
		throw "matrix not invertible";
	}
	
	idet = 1.0 / det;

	m33m[ 0 ] = idet * a11; m33m[ 1 ] = idet * a21; m33m[ 2 ] = idet * a31;
	m33m[ 3 ] = idet * a12; m33m[ 4 ] = idet * a22; m33m[ 5 ] = idet * a32;
	m33m[ 6 ] = idet * a13; m33m[ 7 ] = idet * a23; m33m[ 8 ] = idet * a33;

	return m33;

}
*/

GLOW.Matrix4.makeFrustum = function ( left, right, bottom, top, near, far ) {

	var m, mv, x, y, a, b, c, d;

	m = new GLOW.Matrix4();
	x = 2 * near / ( right - left );
	y = 2 * near / ( top - bottom );
	a = ( right + left ) / ( right - left );
	b = ( top + bottom ) / ( top - bottom );
	c = - ( far + near ) / ( far - near );
	d = - 2 * far * near / ( far - near );

	mv = m.value;
	mv[ 0 ] = x;  mv[ 1 ] = 0;  mv[ 2  ] = a;   mv[ 3 ] = 0;
	mv[ 4 ] = 0;  mv[ 5 ] = y;  mv[ 6  ] = b;   mv[ 7 ] = 0;
	mv[ 8 ] = 0;  mv[ 9 ] = 0;  mv[ 10 ] = c;   mv[ 11 ] = d;
	mv[ 12 ] = 0;  mv[ 13 ] = 0;  mv[ 14 ] = - 1; mv[ 15 ] = 0;

	return m;

};

GLOW.Matrix4.makeProjection = function ( fov, aspect, near, far ) {

	var ymax, ymin, xmin, xmax;

	ymax = near * Math.tan( fov * Math.PI / 360 );
	ymin = - ymax;
	xmin = ymin * aspect;
	xmax = ymax * aspect;

	return GLOW.Matrix4.makeFrustum( xmin, xmax, ymin, ymax, near, far );

};
/*
THREE.Matrix4.makeOrtho = function ( left, right, top, bottom, near, far ) {

	var m, x, y, z, w, h, p;

	m = new THREE.Matrix4();
	w = right - left;
	h = top - bottom;
	p = far - near;
	x = ( right + left ) / w;
	y = ( top + bottom ) / h;
	z = ( far + near ) / p;

	m.n11 = 2 / w; m.n12 = 0;     m.n13 = 0;      m.n14 = -x;
	m.n21 = 0;     m.n22 = 2 / h; m.n23 = 0;      m.n24 = -y;
	m.n31 = 0;     m.n32 = 0;     m.n33 = -2 / p; m.n34 = -z;
	m.n41 = 0;     m.n42 = 0;     m.n43 = 0;      m.n44 = 1;

	return m;

};

*/
