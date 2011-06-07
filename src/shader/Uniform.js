GLOW.Uniform = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here
    var once = false;
    var setFunctions = [];

    function lazyInit() {
        setFunctions[GL.INT] = function() { GL.uniform1iv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT] = function() { GL.uniform1fv(this.location, this.getNativeValue()); };
        setFunctions[GL.INT_VEC2] = function() { GL.uniform2iv(this.location, this.getNativeValue()); };
        setFunctions[GL.INT_VEC3] = function() { GL.uniform3iv(this.location, this.getNativeValue()); };
        setFunctions[GL.INT_VEC4] = function() { GL.uniform4iv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT_VEC2] = function() { GL.uniform2fv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT_VEC3] = function() { GL.uniform3fv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT_VEC4] = function() { GL.uniform4fv(this.location, this.getNativeValue()); };
        setFunctions[GL.FLOAT_MAT2] = function() { GL.uniformMatrix2fv(this.location, false, this.getNativeValue()); };
        setFunctions[GL.FLOAT_MAT3] = function() { GL.uniformMatrix3fv(this.location, false, this.getNativeValue()); };
        setFunctions[GL.FLOAT_MAT4] = function() { GL.uniformMatrix4fv(this.location, false, this.getNativeValue()); };
        setFunctions[GL.SAMPLER_2D] = function() {
            if (this.data.texture !== undefined && this.data.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached(this.data)) {
                GL.uniform1i(this.location, this.data.textureUnit);
                GL.activeTexture(GL.TEXTURE0 + this.data.textureUnit);
                GL.bindTexture(GL.TEXTURE_2D, this.data.texture);
            }
        };
        setFunctions[GL.SAMPLER_CUBE] = function() {
            /* TODO */
        };
    }

    // constructor
    function uniform(parameters, data) {
        if (!once) {
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
        this.load = parameters.loadFunction || setFunctions[this.type];
    }

    // methods
    // default data converter
    uniform.prototype.getNativeValue = function() {
        return this.data.value;
    };

    return uniform;
})();

GLOW.Uniform.useThreeJSData = function() {
    
    GLOW.Uniform.prototype.getNativeValue = function() {
        
        if( !this.data.GLOWArray ) {
            
            if( this.data instanceof THREE.Vector2 ) {
                this.data.GLOWArray = new Float32Array( 2 );
                this.getNativeValue = function() {
                    this.data.GLOWArray[ 0 ] = this.data.x;
                    this.data.GLOWArray[ 1 ] = this.data.y;
                    return this.data.GLOWArray();
                }
            } else if( this.data instanceof THREE.Vector3 ) {
                this.data.GLOWArray = new Float32Array( 3 );
                this.getNativeValue = function() {
                    this.data.GLOWArray[ 0 ] = this.data.x;
                    this.data.GLOWArray[ 1 ] = this.data.y;
                    this.data.GLOWArray[ 2 ] = this.data.z;
                    return this.data.GLOWArray();
                }
            } else if( this.data instanceof THREE.Vector4 ) {
                this.data.GLOWArray = new Float32Array( 4 );
                this.getNativeValue = function() {
                    this.data.GLOWArray[ 0 ] = this.data.x;
                    this.data.GLOWArray[ 1 ] = this.data.y;
                    this.data.GLOWArray[ 2 ] = this.data.z;
                    this.data.GLOWArray[ 3 ] = this.data.w;
                    return this.data.GLOWArray();
                }
            } else if( this.data instanceof THREE.Color ) {
                this.data.GLOWArray = new Float32Array( 3 );
                this.getNativeValue = function() {
                    this.data.GLOWArray[ 0 ] = this.data.r;
                    this.data.GLOWArray[ 1 ] = this.data.g;
                    this.data.GLOWArray[ 2 ] = this.data.b;
                    return this.data.GLOWArray();
                }
            }
        }
    }
}
