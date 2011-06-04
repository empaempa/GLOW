GLOW.Attribute = (function() {
    "use strict"; "use restrict";

    // private data, functions and initializations here
    var once = false;
    var sizes = [];
    function lazyInit() {
        // lazy initialization so we know we got GL bound to a context
        sizes[GL.INT] = 1;
        sizes[GL.INT_VEC2] = 2;
        sizes[GL.INT_VEC3] = 3;
        sizes[GL.INT_VEC4] = 4;
        sizes[GL.FLOAT] = 1;
        sizes[GL.FLOAT_VEC2] = 2;
        sizes[GL.FLOAT_VEC3] = 3;
        sizes[GL.FLOAT_VEC4] = 4;
        sizes[GL.FLOAT_MAT2] = 4;
        sizes[GL.FLOAT_MAT3] = 9;
        sizes[GL.FLOAT_MAT4] = 16;
    }

    // constructor
    function attribute(parameters, data, interleave) {
        if (!once) {
            once = true;
            lazyInit();
        }

        this.id = GLOW.uniqueId();
        this.data = data;
        this.location = parameters.location;
        this.locationNumber = parameters.locationNumber;
        this.stride = 0;
        this.offset = 0;
        this.size = sizes[parameters.type];
        this.buffer = GL.createBuffer();

        // todo should all of these really get stored?
        this.name = parameters.name;
        this.type = parameters.type;

        if (!interleave) {
            if (this.data instanceof Float32Array) {
                this.setData(this.data);
            }
            else {
                var al = this.data.length;
                var sl = this.size;
                var flat = new Float32Array(al * sl);
                var i = 0;
                for (var a = 0; a < al; a++) {
                    for(var s = 0; s < sl; s++) {
                        flat[i++] = data[a].value[s];
                    }
                }
                this.setData(flat);
            }
        }
    }

    // methods
    attribute.prototype.interleave = function(float32array, stride, offset) {
        this.stride = stride;
        this.offset = offset;
        // TODO
    };

    attribute.prototype.setData = function(data) {
        this.data = data;
        GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
        GL.bufferData(GL.ARRAY_BUFFER, this.data, GL.STATIC_DRAW);
    };

    attribute.prototype.bind = function() {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
        GL.vertexAttribPointer(this.location, this.size, GL.FLOAT, false, this.stride, this.offset);
    };

    return attribute;
})();
