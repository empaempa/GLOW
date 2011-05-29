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
	var that = { value: m, transposeUniform: false };
	var temp = GLOW.Vector3();
	var rotation = GLOW.Vector3();
	
	
	//--- methods ---

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

	that.copy = function( a ) {

		a = a.value;

		that.set(
			a[  0 ], a[  1 ], a[  2 ], a[  3 ],
			a[  4 ], a[  5 ], a[  6 ], a[  7 ],
			a[  8 ], a[  9 ], a[ 10 ], a[ 11 ],
			a[ 12 ], a[ 13 ], a[ 14 ], a[ 15 ]
		);

		return that;
	}

	that.lookAt = function( focus, up ) {

		var x = GLOW.Matrix4.tempVector3A, 
		    y = GLOW.Matrix4.tempVector3B, 
		    z = GLOW.Matrix4.tempVector3C;
		var eye = that.getPosition();	
		
		eye.value[ 0 ] = m[ 12 ];
		eye.value[ 1 ] = m[ 13 ];
		eye.value[ 2 ] = m[ 14 ];

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

		m[ 0 ] = x[ 0 ]; m[ 4 ] = y[ 0 ]; m[  8 ] = z[ 0 ];
		m[ 1 ] = x[ 1 ]; m[ 5 ] = y[ 1 ]; m[  9 ] = z[ 1 ];
		m[ 2 ] = x[ 2 ]; m[ 6 ] = y[ 2 ]; m[ 10 ] = z[ 2 ];

		return that;
	}

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

//reference:
//m.n11 = m[ 0 ]; m.n12 = m[ 4 ]; m.n13 = m[ 8 ]; m.n14 = m[ 12 ];
//m.n21 = m[ 1 ]; m.n22 = m[ 5 ]; m.n23 = m[ 9 ]; m.n24 = m[ 13 ];
//m.n31 = m[ 2 ]; m.n32 = m[ 6 ]; m.n33 = m[ 10 ]; m.n34 = m[ 14 ];
//m.n41 = m[ 3 ]; m.n42 = m[ 7 ]; m.n43 = m[ 11 ]; m.n44 = m[ 15 ];

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
	}

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


	that.setPosition = function( x, y, z ) {

		m[ 12 ] = x;
		m[ 13 ] = y;
		m[ 14 ] = z;

		return that;
	}
	
	that.addPosition = function( x, y, z ) {
		
		m[ 12 ] += x;
		m[ 13 ] += y;
		m[ 14 ] += z;
	}

	that.setRotation = function( x, y, z ) {

		rotation.set( x, y, z );

		var a = Math.cos( x ), b = Math.sin( x ),
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
	
	that.addRotation = function( x, y, z ) {
		
		rotation.value[ 0 ] += x;
		rotation.value[ 1 ] += y;
		rotation.value[ 2 ] += z;
		
		that.setRotation( rotation.value[ 0 ], rotation.value[ 1 ], rotation.value[ 2 ] );
	}

	that.getPosition = function() {
		
		temp.set( m[ 12 ], m[ 13 ], m[ 14 ] );
		return temp;
	}

	that.getColumnX = function() {
		
		temp.set( m[ 0 ], m[ 1 ], m[ 2 ] );
		return temp;
	}
	
	that.getColumnY = function() {
		
		temp.set( m[ 4 ], m[ 5 ], m[ 6 ] );
		return temp;
	}

	that.getColumnZ = function() {
		
		temp.set( m[ 8 ], m[ 9 ], m[ 10 ] );
		return temp;
	},


	that.scale = function( v, y, z ) {

		var x;

		if( y && z ) {
			
			x = v;
			
		} else {
			
			x = v.value[ 0 ];
			y = v.value[ 1 ];
			z = v.value[ 2 ];
		}


		m[ 0 ] *= x; m[ 4 ] *= y; m[ 8 ] *= z;
		m[ 1 ] *= x; m[ 5 ] *= y; m[ 9 ] *= z;
		m[ 2 ] *= x; m[ 6 ] *= y; m[ 10 ] *= z;
		m[ 3 ] *= x; m[ 7 ] *= y; m[ 11 ] *= z;

		return that;
	}

	return that.identity();
};


GLOW.Matrix4.makeInverse = function ( m1, m2 ) {

	// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

	if( m2 === undefined ) m2 = GLOW.Matrix4();

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
	mv[ 0 ] = x;  mv[ 4 ] = 0;  mv[ 8  ] = a;   mv[ 12 ] = 0;
	mv[ 1 ] = 0;  mv[ 5 ] = y;  mv[ 9  ] = b;   mv[ 13 ] = 0;
	mv[ 2 ] = 0;  mv[ 6 ] = 0;  mv[ 10 ] = c;   mv[ 14 ] = d;
	mv[ 3 ] = 0;  mv[ 7 ] = 0;  mv[ 11 ] = - 1; mv[ 15 ] = 0;

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

GLOW.Matrix4.makeOrtho = function( left, right, top, bottom, near, far ) {

	var m, mv, x, y, z, w, h, p;

	m = GLOW.Matrix4();
	w = right - left;
	h = top - bottom;
	p = far - near;
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


GLOW.Matrix4.tempVector3A = GLOW.Vector3();
GLOW.Matrix4.tempVector3B = GLOW.Vector3();
GLOW.Matrix4.tempVector3C = GLOW.Vector3();
GLOW.Matrix4.tempVector3D = GLOW.Vector3();
