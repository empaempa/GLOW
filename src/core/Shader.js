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
    function GLOWShader( parameters ) {
        this.id = GLOW.uniqueId();
        this.compiledData = parameters.use ? parameters.use.clone( parameters.except ) : GLOW.Compiler.compile( parameters );
        this.attachData();
    }

    // methods
    GLOWShader.prototype.attachData = function() {
        var u, a, i;

        this.uniforms = this.compiledData.uniforms;
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
            if( this.attributes === undefined ) {
                this.attributes = this.compiledData.attributes;
            }
            if( this[ a ] === undefined ) {
                this[ a ] = this.compiledData.attributes[ a ];
            } else {
                console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " + a + ", not attaching for easy access. Please use Shader.attributes." + a + ".data to access data." );
            }
        }
        
        for( i in this.compiledData.interleavedAttributes ) {
            if( this.interleavedAttributes === undefined ) {
                this.interleavedAttributes = this.compiledData.interleavedAttributes;
            }
            if( this[ i ] === undefined ) {
                this[ i ] = this.compiledData.interleavedAttributes[ i ];
            } else {
                console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on interleavedAttribute " + a + ", not attaching for easy access. Please use Shader.interleavedAttributes." + a + ".data to access data." )
            }
        }
    };

    GLOWShader.prototype.draw = function() {
        var compiledData = this.compiledData;
        var cache = GLOW.currentContext.cache;

        if( !cache.programCached( compiledData.program )) {
            GL.useProgram( compiledData.program );
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
                    for( current--; current > highestAttrib; current-- ) {
                        GL.disableVertexAttribArray( current ); 
                    }
                }
            }
        }
        
        for( var a in compiledData.attributes ) {
            if( compiledData.attributes[ a ].interleaved === false ) {
                if( !cache.attributeCached( compiledData.attributes[ a ] )) {
                    compiledData.attributes[ a ].bind();
                }
            }
        }

        for( var a in compiledData.interleavedAttributes ) {
            compiledData.interleavedAttributes[ a ].bind();
        }
        
        for( var u in compiledData.uniforms ) {
            if( !cache.uniformCached( compiledData.uniforms[ u ] )) {
                compiledData.uniforms[ u ].load();
            }
        }

        if( compiledData.preDrawCallback ) compiledData.preDrawCallback( this );
        
        compiledData.elements.draw();

        if( compiledData.postDrawCallback ) compiledData.postDrawCallback( this );
    };

    GLOWShader.prototype.clone = function(except) {
        return new GLOW.Shader( { use: this.compiledData, except: except } );
    };

    GLOWShader.prototype.dispose = function() {
        // TODO
    };

    return GLOWShader;
})();



