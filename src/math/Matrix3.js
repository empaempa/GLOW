/*
* GLOW.Matrix3
* Based upon THREE.Matrix3 by @mr.doob
*/

GLOW.Matrix3 = function () {

	"use strict";

	this.value = new Float32Array( 9 );
	this.transposeUniform = false;
};

/*
* Prototype
*/

GLOW.Matrix3.prototype.set = function( m11, m12, m13, m21, m22, m23, m31, m32, m33 ) {

	this.value[ 0 ] = m11; this.value[ 4 ] = m12; this.value[ 8 ] = m13;
	this.value[ 1 ] = m21; this.value[ 5 ] = m22; this.value[ 9 ] = m23;
	this.value[ 2 ] = m31; this.value[ 6 ] = m32; this.value[ 10 ] = m33;

	return this;
}

GLOW.Matrix3.prototype.identity = function () {

	this.set( 1, 0, 0, 0, 1, 0, 0, 0, 1	);
	return this;
}
