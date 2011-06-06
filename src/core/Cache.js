/*
* Cache
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Cache = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function cache() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation = [];
        this.attributeByLocation = [];
        this.textureByLocation = [];
        this.elementId = -1;
        this.programId = -1;
    }

    // methods
    cache.prototype.programCached = function( program ) {
        if( program.id === this.programId ) return true;
        this.programId = program.id;
        return false;
    };

    cache.prototype.setProgramHighestAttributeNumber = function( program ) {
        var saveHighestAttributeNumber = this.highestAttributeNumber;
        this.highestAttributeNumber = program.highestAttributeNumber;
        return program.highestAttributeNumber - saveHighestAttributeNumber;
    };

    cache.prototype.uniformCached = function( uniform ) {
        if( this.uniformByLocation[ uniform.locationNumber ] === uniform.id ) return true;
        this.uniformByLocation[ uniform.locationNumber ] = uniform.id
        return false;
    };

    cache.prototype.attributeCached = function( attribute ) {
        if( this.attributeByLocation[ attribute.locationNumber ] === attribute.id ) return true;
        this.attributeByLocation[ attribute.locationNumber ] = attribute.id
        return false;
    };

    cache.prototype.textureCached = function( texture ) {
        if( this.textureByLocation[ texture.textureUnit ] === texture.id ) return true;
        this.textureByLocation[ texture.textureUnit ] = texture.id
        return false;
    };

    cache.prototype.elementsCached = function( elements ) {
        if( elements.id === this.elementId ) return true;
        this.elementId = elements.id;
        return false;
    };

    cache.prototype.clear = function() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation.length = 0;
        this.attributeByLocation.length = 0;
        this.textureByLocation.length = 0;
        this.elementId = -1;
        this.programId = -1;
    };
    
    return cache;
})();
