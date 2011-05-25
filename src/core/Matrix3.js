GLOW.Matrix3 = function () {

	var m = new Float32Array( 9 );
	
	m.transpose = false;
	m.autoUpdate = true;

	m.set = function( m11, m12, m13, m21, m22, m23, m31, m32, m33 ) {

		m[ 0 ] = m11; m[ 4 ] = m12; m[ 8 ] = m13;
		m[ 1 ] = m21; m[ 5 ] = m22; m[ 9 ] = m23;
		m[ 2 ] = m31; m[ 6 ] = m32; m[ 10 ] = m33;

		return m;
	}

	m.identity = function () {

		m.set(
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		);

		return m;
	}

	
	return m.identity();

};
