/*
* Uniform
*/

GLOW.Uniform = function(parameters, data) {
    "use strict"; "use restrict";

    this.id = GLOW.uniqueId();
    this.data = data;
    this.location = parameters.location;
    this.locationNumber = parameters.locationNumber;

    // todo should all of these really get stored?
    this.name = parameters.name;
    this.length = parameters.length;
    this.type = parameters.type;

    // lazy initialization so we know we got GL bound to a context
    // TODO: support other types of data than GLOW.Matrix/Vector
    GLOW.Uniform.setFns = GLOW.Uniform.setFns || (function() {
        var fns = [];
        fns[GL.INT] = function(location, data) { GL.uniform1i(location, data.value); };
        fns[GL.INT_VEC2] = function(location, data) { GL.uniform2i(location, data.value[0], data.value[1]); };
        fns[GL.INT_VEC3] = function(location, data) { GL.uniform3i(location, data.value[0], data.value[1], data.value[2]); };
        fns[GL.INT_VEC4] = function(location, data) { GL.uniform4i(location, data.value[0], data.value[1], data.value[2], data.value[3]); };
        fns[GL.FLOAT] = function(location, data) { GL.uniform1f(location, data.value); };
        fns[GL.FLOAT_VEC2] = function(location, data) { GL.uniform2f(location, data.value[0], data.value[1]); };
        fns[GL.FLOAT_VEC3] = function(location, data) { GL.uniform3f(location, data.value[0], data.value[1], data.value[2]); };
        fns[GL.FLOAT_VEC4] = function(location, data) { GL.uniform4f(location, data.value[0], data.value[1], data.value[2], data.value[3]); };

        fns[GL.FLOAT_MAT2] = function(location, data) { GL.uniformMatrix2fv(location, data.transposeUniform, data.value); };
        fns[GL.FLOAT_MAT3] = function(location, data) { GL.uniformMatrix3fv(location, data.transposeUniform, data.value); };
        fns[GL.FLOAT_MAT4] = function(location, data) { GL.uniformMatrix4fv(location, data.transposeUniform, data.value); };
        fns[GL.SAMPLER_2D] = function(location, data) {
            if (data.texture !== undefined && data.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached(data)) {
                GL.uniform1i( location, data.textureUnit);
                GL.activeTexture(GL.TEXTURE0 + data.textureUnit);
                GL.bindTexture(GL.TEXTURE_2D, data.texture);
            }
        };
        fns[GL.SAMPLER_CUBE] = function(location, data) {
            /* TODO */
        };
        return fns;
    })();

    GLOW.Uniform.setvFns = GLOW.Uniform.setvFns || (function() {
        var fns = [];
        fns[GL.INT] = function(location, data) { GL.uniform1iv(location, data.value); };
        fns[GL.INT_VEC2] = function(location, data) { GL.uniform2iv(location, data.value); };
        fns[GL.INT_VEC3] = function(location, data) { GL.uniform3iv(location, data.value); };
        fns[GL.INT_VEC4] = function(location, data) { GL.uniform4iv(location, data.value); };
        fns[GL.FLOAT] = function(location, data) { GL.uniform1fv(location, data.value); };
        fns[GL.FLOAT_VEC2] = function(location, data) { GL.uniform2fv(location, data.value); };
        fns[GL.FLOAT_VEC3] = function(location, data) { GL.uniform3fv(location, data.value); };
        fns[GL.FLOAT_VEC4] = function(location, data) { GL.uniform4fv(location, data.value); };
        return fns;
    })();

    this.uniformFn = (this.length !== undefined && this.length > 1) ?
        GLOW.Uniform.setvFns[this.type] : GLOW.Uniform.setFns[this.type];
};

(function() {
    "use strict"; "use restrict";

    GLOW.Uniform.prototype.set = function() {
        if (!GLOW.currentContext.cache.uniformCached(this)) {
            this.uniformFn(this.location, this.data);
        }
    };
})();
