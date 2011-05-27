/*
* Cache
*/

GLOW.Cache = (function() {
	
	var cache = {};
	var highestAttributeNumber = -1;
	var uniformByLocation = [];
	var attributeByLocation = [];
	var textureByLocation = [];
	var elementId = -1;
	var programId = -1;
	

	//--- program cache --
	
	cache.programCached = function( program ) {
		
		if( program.id === programId ) return true;
		
		programId = program.id;
		return false;
	}

	cache.setProgramHighestAttributeNumber = function( program ) {
		
		var saveHighestAttributeNumber = highestAttributeNumber;
		highestAttributeNumber = program.highestAttributeNumber;
		
		return program.highestAttributeNumber - saveHighestAttributeNumber;
	}
 

	//--- uniform cache ---
	
	cache.uniformCached = function( uniform ) {
		
		if( uniformByLocation[ uniform.locationNumber ] === uniform.id ) return true;
		
		uniformByLocation[ uniform.locationNumber ] = uniform.id
		return false;
	}


	//--- attribute cached ---
	
	cache.attributeCached = function( attribute ) {
		
		if( attributeByLocation[ attribute.locationNumber ] === attribute.id ) return true;
		
		attributeByLocation[ attribute.locationNumber ] = attribute.id
		return false;
	}


	//--- texture cached ---
	
	cache.textureCached = function( texture ) {

		if( textureByLocation[ texture.textureUnit ] === texture.id ) return true;
		
		textureByLocation[ texture.textureUnit ] = texture.id
		return false;
	}


	//--- elements cached ---
	
	cache.elementsCached = function( elements ) {
		
		if( elements.id === elementId ) return true;
		
		elementId = elements.id;
		return false;
	}
 

	//--- clear ---
	
	cache.clear = function() {

		highestAttributeNumber = -1;
		uniformByLocation.length = 0;
		attributeByLocation.length = 0;
		textureByLocation.length = 0;
		elementId = -1;
		programId = -1;
	}
	
	return cache;
	
}());