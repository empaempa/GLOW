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
        this.id           = GLOW.uniqueId();
        this.compiledData = parameters.use ? parameters.use.clone( parameters.except ) : GLOW.Compiler.compile( parameters );
        this.uniforms     = this.compiledData.uniforms;
        this.elements     = this.compiledData.elements;
        this.program      = this.compiledData.program;

        this.attachData();
    }

    // methods
    GLOWShader.prototype.attachData = function() {
        var u, a, i;

        for( u in this.uniforms ) {
            if( this[ u ] === undefined ) {
                if( this.uniforms[ u ].data !== undefined ) {
                    this[ u ] = this.uniforms[ u ].data;
                } else {
                    GLOW.warn( "GLOW.Shader.attachUniformAndAttributeData: no data for uniform " + u + ", not attaching for easy access. Please use Shader.uniforms." + u + ".data to set data." );
                }
            } else if( this[ u ] !== this.uniforms[ u ].data ) {
                GLOW.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on uniform " + u + ", not attaching for easy access. Please use Shader.uniforms." + u + ".data to access data." );
            }
        }

        for( a in this.compiledData.attributes ) {
            if( this.attributes === undefined ) {
                this.attributes = this.compiledData.attributes;
            }
            if( this[ a ] === undefined ) {
                this[ a ] = this.compiledData.attributes[ a ];
            } else if( this[ a ] !== this.compiledData.attributes[ a ] ) {
                GLOW.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " + a + ", not attaching for easy access. Please use Shader.attributes." + a + ".data to access data." );
            }
        }
        
        for( i in this.compiledData.interleavedAttributes ) {
            if( this.interleavedAttributes === undefined ) {
                this.interleavedAttributes = this.compiledData.interleavedAttributes;
            }
            if( this[ i ] === undefined ) {
                this[ i ] = this.compiledData.interleavedAttributes[ i ];
            } else if( this[ i ] !== this.compiledData.interleavedAttributes[ i ] ) {
                GLOW.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on interleavedAttribute " + a + ", not attaching for easy access. Please use Shader.interleavedAttributes." + a + ".data to access data." )
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
        
        var data = compiledData.attributeArray;
        var a    = data.length;

        while( a-- ) {
            if( data[ a ].interleaved === false ) {
                if( !cache.attributeCached( data[ a ] )) {
                    data[ a ].bind();
                }
            }
        }

        data     = compiledData.interleavedAttributeArray;
        a        = data.length;

        while( a-- ) {
            if( !cache.interleavedAttributeCached( data[ a ] )) {
                data[ a ].bind();
            }
        }

        data     = compiledData.uniformArray;
        a        = data.length;

        while( a-- ) {
            if( !cache.uniformCached( data[ a ] )) {
                data[ a ].load();
            }
        }
        
        compiledData.elements.draw();
    };

    GLOWShader.prototype.clone = function(except) {
        return new GLOW.Shader( { use: this.compiledData, except: except } );
    };

    GLOWShader.prototype.dispose = function( disposeBuffers, disposeProgram ) {

        var u, a, i;

        for( u in this.compiledData.uniforms ) {
            delete this[ u ]; 
        }

        for( a in this.compiledData.attributes ) {
            delete this[ a ];
        }
        
        for( i in this.compiledData.interleavedAttributes ) {
            delete this[ i ];
        }

        delete this.program;
        delete this.elements;
        delete this.uniforms;
        delete this.attributes;
        delete this.interleavedAttributes;

        this.compiledData.dispose( disposeBuffers, disposeProgram );
        delete this.compiledData;
    };

    return GLOWShader;
})();



