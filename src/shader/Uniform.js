GLOW.Uniform = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here
    var once = false;
    var setFunctions = [];
    var setvFunctions = [];
    function lazyInit() {
        // lazy initialization so we know we got GL bound to a context

        // TODO: support other types of data than GLOW.Matrix/Vector
        setFunctions[GL.INT] = function(location, data) { GL.uniform1i(location, data.value); };
        setFunctions[GL.INT_VEC2] = function(location, data) { GL.uniform2i(location, data.value[0], data.value[1]); };
        setFunctions[GL.INT_VEC3] = function(location, data) { GL.uniform3i(location, data.value[0], data.value[1], data.value[2]); };
        setFunctions[GL.INT_VEC4] = function(location, data) { GL.uniform4i(location, data.value[0], data.value[1], data.value[2], data.value[3]); };
        setFunctions[GL.FLOAT] = function(location, data) { GL.uniform1f(location, data.value); };
        setFunctions[GL.FLOAT_VEC2] = function(location, data) { GL.uniform2f(location, data.value[0], data.value[1]); };
        setFunctions[GL.FLOAT_VEC3] = function(location, data) { GL.uniform3f(location, data.value[0], data.value[1], data.value[2]); };
        setFunctions[GL.FLOAT_VEC4] = function(location, data) { GL.uniform4f(location, data.value[0], data.value[1], data.value[2], data.value[3]); };

        setFunctions[GL.FLOAT_MAT2] = function(location, data) { GL.uniformMatrix2fv(location, data.transposeUniform, data.value); };
        setFunctions[GL.FLOAT_MAT3] = function(location, data) { GL.uniformMatrix3fv(location, data.transposeUniform, data.value); };
        setFunctions[GL.FLOAT_MAT4] = function(location, data) { GL.uniformMatrix4fv(location, data.transposeUniform, data.value); };
        setFunctions[GL.SAMPLER_2D] = function(location, data) {
            if (data.texture !== undefined && data.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached(data)) {
                GL.uniform1i( location, data.textureUnit);
                GL.activeTexture(GL.TEXTURE0 + data.textureUnit);
                GL.bindTexture(GL.TEXTURE_2D, data.texture);
            }
        };
        setFunctions[GL.SAMPLER_CUBE] = function(location, data) {
            /* TODO */
        };

        setvFunctions[GL.INT] = function(location, data) { GL.uniform1iv(location, data.value); };
        setvFunctions[GL.INT_VEC2] = function(location, data) { GL.uniform2iv(location, data.value); };
        setvFunctions[GL.INT_VEC3] = function(location, data) { GL.uniform3iv(location, data.value); };
        setvFunctions[GL.INT_VEC4] = function(location, data) { GL.uniform4iv(location, data.value); };
        setvFunctions[GL.FLOAT] = function(location, data) { GL.uniform1fv(location, data.value); };
        setvFunctions[GL.FLOAT_VEC2] = function(location, data) { GL.uniform2fv(location, data.value); };
        setvFunctions[GL.FLOAT_VEC3] = function(location, data) { GL.uniform3fv(location, data.value); };
        setvFunctions[GL.FLOAT_VEC4] = function(location, data) { GL.uniform4fv(location, data.value); };
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

        this.uniformFunction = (this.length !== undefined && this.length > 1) ?
            setvFunctions[this.type] : setFunctions[this.type];
    }

    // methods
    uniform.prototype.set = function() {
        if (!GLOW.currentContext.cache.uniformCached(this)) {
            this.uniformFunction(this.location, this.data);
        }
    };

    return uniform;
})();
