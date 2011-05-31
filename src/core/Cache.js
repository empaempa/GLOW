/*
* Cache
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Cache = function() {
	
	"use strict";
	this.highestAttributeNumber = -1;
	this.uniformByLocation = [];
	this.attributeByLocation = [];
	this.textureByLocation = [];
	this.elementId = -1;
	this.programId = -1;
}


/*
* Prototypes
*/

GLOW.Cache.prototype.programCached = function( program ) {
	
	if( program.id === this.programId ) return true;
	
	this.programId = program.id;
	return false;
}

GLOW.Cache.prototype.setProgramHighestAttributeNumber = function( program ) {
	
	var saveHighestAttributeNumber = this.highestAttributeNumber;
	this.highestAttributeNumber = program.highestAttributeNumber;
	
	return program.highestAttributeNumber - saveHighestAttributeNumber;
}

GLOW.Cache.prototype.uniformCached = function( uniform ) {
	
	if( this.uniformByLocation[ uniform.locationNumber ] === uniform.id ) return true;
	
	this.uniformByLocation[ uniform.locationNumber ] = uniform.id
	return false;
}

GLOW.Cache.prototype.attributeCached = function( attribute ) {
	
	if( this.attributeByLocation[ attribute.locationNumber ] === attribute.id ) return true;
	
	this.attributeByLocation[ attribute.locationNumber ] = attribute.id
	return false;
}

GLOW.Cache.prototype.textureCached = function( texture ) {

	if( this.textureByLocation[ texture.textureUnit ] === texture.id ) return true;
	
	this.textureByLocation[ texture.textureUnit ] = texture.id
	return false;
}

GLOW.Cache.prototype.elementsCached = function( elements ) {
	
	if( elements.id === this.elementId ) return true;
	
	this.elementId = elements.id;
	return false;
}

GLOW.Cache.prototype.clear = function() {

	this.highestAttributeNumber = -1;
	this.uniformByLocation.length = 0;
	this.attributeByLocation.length = 0;
	this.textureByLocation.length = 0;
	this.elementId = -1;
	this.programId = -1;
}
