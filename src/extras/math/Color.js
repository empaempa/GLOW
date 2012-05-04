GLOW.Color = (function() {

	"use strict"; "use restrict";

	function color( rOrHex, g, b ) {
		this.value = new Float32Array( 3 );
		if( g === undefined && b === undefined ) {		// duck hunt!
			this.setHex( rOrHex || 0 );
		} else {
			this.setRGB( rOrHex, g, b );
		}
	}

	color.prototype.setRGB = function( r, g, b ) {
		this.value[ 0 ] = r !== undefined ? r / 255 : 1;
		this.value[ 1 ] = g !== undefined ? g / 255 : 1;
		this.value[ 2 ] = b !== undefined ? b / 255 : 1;
		return this;
	}

	color.prototype.setHex = function( hex ) {
		this.value[ 0 ] = (( hex & 0xff0000 ) >> 16 ) / 255;
		this.value[ 1 ] = (( hex & 0x00ff00 ) >> 8  ) / 255;
		this.value[ 2 ] = (( hex & 0x0000ff )       ) / 255;
		return this;
	}

	color.prototype.multiplyScalar = function( s ) {
		this.value[ 0 ] *= s;
		this.value[ 1 ] *= s;
		this.value[ 2 ] *= s;
		return this;
	} 

	color.prototype.mix = function( otherColor, amount ) {
		var invAmount = 1.0 - amount;
		this.value[ 0 ] = this.value[ 0 ] * invAmount + otherColor.value[ 0 ] * amount;
		this.value[ 1 ] = this.value[ 1 ] * invAmount + otherColor.value[ 1 ] * amount;
		this.value[ 2 ] = this.value[ 2 ] * invAmount + otherColor.value[ 2 ] * amount;
		return this;
	}

	color.prototype.copy = function( srcColor ) {
		this.value[ 0 ] = srcColor.value[ 0 ];
		this.value[ 1 ] = srcColor.value[ 1 ];
		this.value[ 2 ] = srcColor.value[ 2 ];
		return this;
	}

	color.prototype.setHSV = function( h, s, v ) {

		// based on MochiKit implementation by Bob Ippolito
		// h,s,v ranges are < 0.0 - 1.0 >

		var r, g, b, i, f, p, q, t;

		if ( v == 0.0 ) {

			r = g = b = 0;

		} else {

			i = Math.floor( h * 6 );
			f = ( h * 6 ) - i;
			p = v * ( 1 - s );
			q = v * ( 1 - ( s * f ) );
			t = v * ( 1 - ( s * ( 1 - f ) ) );

			switch ( i ) {

				case 1: r = q; g = v; b = p; break;
				case 2: r = p; g = v; b = t; break;
				case 3: r = p; g = q; b = v; break;
				case 4: r = t; g = p; b = v; break;
				case 5: r = v; g = p; b = q; break;
				case 6: // fall through
				case 0: r = v; g = t; b = p; break;

			}

		}

		this.value[ 0 ] = r;
		this.value[ 1 ] = g;
		this.value[ 2 ] = b;

		return this;
	}

	return color;
})();