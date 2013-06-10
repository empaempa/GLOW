/*
* Cache
* @author: Mikael Emtinger, gomo.se
*/

GLOW.Cache = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function GLOWCache() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation = [];
        this.attributeByLocation = [];
        this.textureByLocation = [];
        this.compiledCode = [];
        this.elementId = -1;
        this.programId = -1;
        this.active = true;
    }

    // methods
    GLOWCache.prototype.codeCompiled = function( vertexShader, fragmentShader ) {
        var code, c, cl = this.compiledCode.length;
        
        for( c = 0; c < cl; c++ ) {
            code = this.compiledCode[ c ];
            if( vertexShader === code.vertexShader && fragmentShader === code.fragmentShader ) { break; }
        }
        
        if( c === cl ) {
            this.compiledCode.push( { vertexShader: vertexShader, 
                                      fragmentShader: fragmentShader } );
            return undefined;
        } else {
            return this.compiledCode[ c ].program;
        }
    };
    
    GLOWCache.prototype.addCompiledProgram = function( program ) {
        this.compiledCode[ this.compiledCode.length - 1 ].program = program;
    };
    
    
    GLOWCache.prototype.programCached = function( program ) {
        if( this.active ) {
            if( program.id === this.programId ) return true;
            this.programId = program.id;

            // clear uniforms, attributes, textures and elements which can't be shared
            // by two different programs

            this.uniformByLocation.length = 0;
            this.attributeByLocation.length = 0;
            this.textureByLocation.length = 0;
            this.elementId = -1;
        }
        return false;
    };

    GLOWCache.prototype.setProgramHighestAttributeNumber = function( program ) {
        var saveHighestAttributeNumber = this.highestAttributeNumber;
        this.highestAttributeNumber = program.highestAttributeNumber;
        return program.highestAttributeNumber - saveHighestAttributeNumber;
    };

    GLOWCache.prototype.uniformCached = function( uniform ) {
        if( this.active ) {
            if( this.uniformByLocation[ uniform.locationNumber ] === uniform.id ) return true;
            this.uniformByLocation[ uniform.locationNumber ] = uniform.id;
        }
        return false;
    };
    
    GLOWCache.prototype.invalidateUniform = function( uniform ) {
        this.uniformByLocation[ uniform.locationNumber ] = undefined;
    };

    GLOWCache.prototype.attributeCached = function( attribute ) {
        if( this.active ) {
            if( this.attributeByLocation[ attribute.locationNumber ] === attribute.id ) return true;
            this.attributeByLocation[ attribute.locationNumber ] = attribute.id;
        }
        return false;
    };

    GLOWCache.prototype.interleavedAttributeCached = function( interleavedAttribtue ) {
        if( this.active ) {
            var a = 0, al = interleavedAttribtue.attributes.length, attribute;
            for( ; a < al; a++ ) {
                attribute = interleavedAttribtue.attributes[ a ];
                if( this.attributeByLocation[ attribute.locationNumber ] === attribute.id ) return true;
                this.attributeByLocation[ attribute.locationNumber ] = attribute.id;
            }
        }
        return false;
    };

    GLOWCache.prototype.invalidateAttribute = function( attribute ) {
        this.attributeByLocation[ attribute.locationNumber ] = undefined;
    };

    GLOWCache.prototype.textureCached = function( textureUnit, texture ) {
        if( this.active ) {
            if( this.textureByLocation[ textureUnit ] === texture.id ) return true;
            this.textureByLocation[ textureUnit ] = texture.id;
        }
        return false;
    };

    GLOWCache.prototype.invalidateTexture = function( textureUnit ) {
        this.textureByLocation[ textureUnit ] = undefined;
    };

    GLOWCache.prototype.elementsCached = function( elements ) {
        if( this.active ) {
            if( elements.id === this.elementId ) return true;
            this.elementId = elements.id;
        }
        return false;
    };

    GLOWCache.prototype.invalidateElements = function() {
        this.elementId = -1;
    };

    GLOWCache.prototype.clear = function() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation.length = 0;
        this.attributeByLocation.length = 0;
        this.textureByLocation.length = 0;
        this.elementId = -1;
        this.programId = -1;
    };
    
    return GLOWCache;
})();
