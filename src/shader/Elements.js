/*
* GLOW.Elements
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Elements = function( data ) {
	
	"use strict";
	
	this.id       = GLOW.uniqueId();
	this.elements = GL.createBuffer();
	this.length   = data.length;

	GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
	GL.bufferData( GL.ELEMENT_ARRAY_BUFFER, data, GL.STATIC_DRAW );
}


GLOW.Elements.prototype.draw = function() {
	
	if( !GLOW.currentContext.cache.elementsCached( this )) {

		GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
	}
	
	GL.drawElements( GL.TRIANGLES, this.length, GL.UNSIGNED_SHORT, 0 );		
}