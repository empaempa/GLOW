/*
* Shader.js
* Parameters:
* use: GLOW.ShaderCompiledData
* except: object, holding data that should be overwritten in GLOW.ShaderCompiledData
* vertexShader: string, vertex shader code
* fragmentShader: string, fragment shader code
* data: attributes and uniforms
* elements: elements (array or UInt16Array)
*/

GLOW.Shader = (function() {
    
    "use strict"; "use restrict";

    // private data, functions and initializations here

    // constructor
    function shader( parameters ) {
        this.id = GLOW.uniqueId();
        this.compiledData = parameters.use ? parameters.use.clone( parameters.except ) : GLOW.Compiler.compile( parameters );
        this.attachData();
    }

    // methods
    shader.prototype.attachData = function() {
        var u, a;

        this.uniforms = this.compiledData.uniforms;
        this.attributes = this.compiledData.attributes;
        this.elements = this.compiledData.elements;
        this.program = this.compiledData.program;

        for( u in this.compiledData.uniforms ) {
            if( this[ u ] === undefined) {
                this[ u ] = this.compiledData.uniforms[ u ].data;
            } else {
                console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on uniform " + u + ", not attaching for easy access. Please use Shader.uniforms." + u + ".data to access data." );
            }
        }

        for( a in this.compiledData.attributes ) {
            if( this[ a ] === undefined) {
                this[ a ] = this.compiledData.attributes[ a ].data;
            } else {
                console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " + a + ", not attaching for easy access. Please use Shader.attributes." + a + ".data to access data." );
            }
        }
    };

    shader.prototype.draw = function() {
        var compiledData = this.compiledData;
        var cache = GLOW.currentContext.cache;

        if( !cache.programCached( compiledData.program )) {
            var diff = cache.setProgramHighestAttributeNumber( compiledData.program );
            if( diff ) {
                // enable / disable attribute streams
                var highestAttrib = compiledData.program.highestAttributeNumber;
                var current = highestAttrib - diff + 1;

                if( diff > 0 ) {
                    for( ; current <= highestAttrib; current++ ) {
                        GL.enableVertexAttribArray( current );
                    }
                } else {
                    for( ; current >= highestAttrib; current-- ) {
                        GL.disableVertexAttribArray( current ); 
                    }
                }
            }
            GL.useProgram( compiledData.program );
        }

        for( var u in compiledData.uniforms ) {
            if( !cache.uniformCached( compiledData.uniforms[ u ] )) {
                compiledData.uniforms[ u ].load();
            }
        }
        
        for( var a in compiledData.attributes ) {
            if( !cache.attributeCached( compiledData.attributes[ a ] )) {
                compiledData.attributes[ a ].bind();
            }
        }
        
        if( compiledData.preDrawCallback ) compiledData.preDrawCallback( this );
        
        compiledData.elements.draw();

        if( compiledData.postDrawCallback ) compiledData.postDrawCallback( this );
    };

    shader.prototype.clone = function(except) {
        return new GLOW.Shader( { use: this.compiledData, except: except } );
    };

    shader.prototype.dispose = function() {
        // TODO
    };

    return shader;
})();



