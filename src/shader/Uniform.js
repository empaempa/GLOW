GLOW.Uniform = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here
    var once = false;
    var setFunctions = [];
    var setvFunctions = [];

    function lazyInit() {
        // lazy initialization so we know we got GL bound to a context

        // TODO: support other types of data than GLOW.Matrix/Vector
        setFunctions[GL.INT] = function() { GL.uniform1i(this.location, this.value()); };
        setFunctions[GL.INT_VEC2] = function() { GL.uniform2i(this.location, this.value()[0], this.value()[1]); };
        setFunctions[GL.INT_VEC3] = function() { GL.uniform3i(this.location, this.value()[0], this.value()[1], this.value()[2]); };
        setFunctions[GL.INT_VEC4] = function() { GL.uniform4i(this.location, this.value()[0], this.value()[1], this.value()[2], this.value()[3]); };
        setFunctions[GL.FLOAT] = function() { GL.uniform1f(this.location, this.value()); };
        setFunctions[GL.FLOAT_VEC2] = function() { GL.uniform2f(this.location, this.value()[0], this.value()[1]); };
        setFunctions[GL.FLOAT_VEC3] = function() { GL.uniform3f(this.location, this.value()[0], this.value()[1], this.value()[2]); };
        setFunctions[GL.FLOAT_VEC4] = function() { GL.uniform4f(this.location, this.value()[0], this.value()[1], this.value()[2], this.value()[3]); };

        setFunctions[GL.FLOAT_MAT2] = function() { GL.uniformMatrix2fv(this.location, this.transposeUniform(), this.value()); };
        setFunctions[GL.FLOAT_MAT3] = function() { GL.uniformMatrix3fv(this.location, this.transposeUniform(), this.value()); };
        setFunctions[GL.FLOAT_MAT4] = function() { GL.uniformMatrix4fv(this.location, this.transposeUniform(), this.value()); };
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

        setvFunctions[GL.INT] = function() { GL.uniform1iv(this.location, this.value()); };
        setvFunctions[GL.INT_VEC2] = function() { GL.uniform2iv(this.location, this.value()); };
        setvFunctions[GL.INT_VEC3] = function() { GL.uniform3iv(this.location, this.value()); };
        setvFunctions[GL.INT_VEC4] = function() { GL.uniform4iv(this.location, this.value()); };
        setvFunctions[GL.FLOAT] = function() { GL.uniform1fv(this.location, this.value()); };
        setvFunctions[GL.FLOAT_VEC2] = function() { GL.uniform2fv(this.location, this.value()); };
        setvFunctions[GL.FLOAT_VEC3] = function() { GL.uniform3fv(this.location, this.value()); };
        setvFunctions[GL.FLOAT_VEC4] = function() { GL.uniform4fv(this.location, this.value()); };
    }

    // constructor
    function uniform(parameters, data) {
        if (!once) {
            once = true;
            lazyInit();
        }

        this.id = GLOW.uniqueId();
        this.data = data;
        this.location = parameters.location;
        this.locationNumber = parameters.locationNumber;

        // todo should all of these really get stored?
        this.name = parameters.name;
        this.length = parameters.length;
        this.type = parameters.type;

        if (parameters.set) {
            this.uniformFunction = parameters.set;
        }
        else {
            this.uniformFunction = (this.length !== undefined && this.length > 1) ?
                setvFunctions[this.type] : setFunctions[this.type];
        }
    }

    // methods
    uniform.prototype.set = function() {
        if (!GLOW.currentContext.cache.uniformCached(this)) {
            this.uniformFunction();
        }
    };

    // default data converters
    uniform.prototype.value = function() {
        return this.data.value;
    };
    uniform.prototype.transposeUniform = function() {
        return this.data.transposeUniform;
    };

    return uniform;
})();
