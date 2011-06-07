/*
* GLOW.Int
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Int = function( value ) {

	"use strict";
	this.value = new Float32Array( 1 );
	this.value[ 0 ] = value !== undefined ? value : 0;
}
