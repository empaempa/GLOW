GLOW.Uniform = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here
    var once = false;
    var setFunctions = [];

    function lazyInit() {
        setFunctions[ GL.INT ] = function() { GL.uniform1iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT ] = function() { GL.uniform1fv( this.location, this.getNativeValue()); };
        setFunctions[ GL.INT_VEC2 ] = function() { GL.uniform2iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.INT_VEC3 ] = function() { GL.uniform3iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.INT_VEC4 ] = function() { GL.uniform4iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.BOOL ] = function() { GL.uniform1iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.BOOL_VEC2 ] = function() { GL.uniform2iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.BOOL_VEC3 ] = function() { GL.uniform3iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.BOOL_VEC4 ] = function() { GL.uniform4iv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_VEC2 ] = function() { GL.uniform2fv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_VEC3 ] = function() { GL.uniform3fv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_VEC4 ] = function() { GL.uniform4fv( this.location, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_MAT2 ] = function() { GL.uniformMatrix2fv( this.location, false, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_MAT3 ] = function() { GL.uniformMatrix3fv( this.location, false, this.getNativeValue()); };
        setFunctions[ GL.FLOAT_MAT4 ] = function() { GL.uniformMatrix4fv( this.location, false, this.getNativeValue()); };
        setFunctions[ GL.SAMPLER_2D ] = function() {
            if( this.data.texture !== undefined && this.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached( this.textureUnit, this.data )) {
                GL.uniform1i( this.location, this.textureUnit );
                GL.activeTexture( GL.TEXTURE0 + this.textureUnit );
                GL.bindTexture( GL.TEXTURE_2D, this.data.texture );
                if( this.data.autoUpdate ) {
                    this.data.updateTexture( this.data.autoUpdate );
                }
            }
        };
        setFunctions[ GL.SAMPLER_CUBE ] = function() {
            if( this.data.texture !== undefined && this.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached( this.textureUnit, this.data )) {
                GL.uniform1i( this.location, this.textureUnit );
                GL.activeTexture( GL.TEXTURE0 + this.textureUnit );
                GL.bindTexture( GL.TEXTURE_CUBE_MAP, this.data.texture );
                if( this.data.autoUpdate ) {
                    this.data.updateTexture( this.data.autoUpdate );
                }
            }
        };
    }

    // constructor
    function GLOWUniform( parameters, data ) {
        if( !once ) {
            once = true;
            lazyInit();
        }

        this.id = GLOW.uniqueId();
        this.data = data;
        this.name = parameters.name;
        this.length = parameters.length;
        this.type = parameters.type;
        this.location = parameters.location;
        this.locationNumber = parameters.locationNumber;
        this.textureUnit = -1;
        this.load = parameters.loadFunction || setFunctions[ this.type ];
    }

    // methods
    // default data converter
    GLOWUniform.prototype.getNativeValue = function() {
        return this.data.value;
    };

    GLOWUniform.prototype.clone = function( data ) {
        return new GLOW.Uniform( this, data || this.data );
    }

    GLOWUniform.prototype.dispose = function() {
        delete this.data;
        delete this.load;
        delete this.location;
    }

    return GLOWUniform;
})();
