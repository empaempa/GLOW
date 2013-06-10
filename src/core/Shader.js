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
                GLOW.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on interleavedAttribute " + a + ", not attaching for easy access. Please use Shader.interleavedAttributes." + a + ".data to access data." );
            }
        }
    };

    GLOWShader.prototype.draw = function() {
        var compiledData              = this.compiledData;
        var cache                     = GLOW.currentContext.cache;
        var attributeCache            = cache.attributeByLocation;
        var uniformCache              = cache.uniformByLocation;
        var attributeArray            = compiledData.attributeArray;
        var interleavedAttributeArray = compiledData.interleavedAttributeArray;
        var uniformArray              = compiledData.uniformArray;
        var interleavedAttribute;
        var attribute, attributes;
        var uniform;
        var a, al, cached;

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

        if( cache.active ) {
            // check cache and bind attributes
            a = attributeArray.length;
            while( a-- ) {
                attribute = attributeArray[ a ];
                if( attribute.interleaved === false ) {
                    if( attributeCache[ attribute.locationNumber ] !== attribute.id ) {
                        attributeCache[ attribute.locationNumber ] = attribute.id;
                        attribute.bind();
                    }
                }
           }

            // check cache and bind interleaved attributes
            a = interleavedAttributeArray.length;
            while( a-- ) {
                interleavedAttribute = interleavedAttributeArray[ a ];
                attributes           = interleavedAttribute.attributes;
                al                   = attributes.length;
                cached               = false;

                while( al-- ) {
                    attribute = attributes[ al ];
                    if( attributeCache[ attribute.locationNumber ] === attribute.id ) {
                        cached = true;
                        break;
                    }
                    attributeCache[ attribute.locationNumber ] = attribute.id;
                }

                if( !cached ) {
                    interleavedAttribute.bind();
                }
            }

            // check cache bind unfirms
            a = uniformArray.length;
            while( a-- ) {
                uniform = uniformArray[ a ];
                if( uniformCache[ uniform.locationNumber ] !== uniform.id ) {
                    uniformCache[ uniform.locationNumber ] = uniform.id;
                    uniform.load();
                }
            }
        } else {
            // bind attributes
            a = attributeArray.length;
            while( a-- ) {
                if( attributeArray[ a ].interleaved === false ) {
                    attributeArray[ a ].bind();
                }
            }

            // bind interleaved attributes
            a = interleavedAttributeArray.length;
            while( a-- ) {
                interleavedAttributeArray[ a ].bind();
            }

            // bind unfirms
            a = uniformArray.length;
            while( a-- ) {
                uniformArray[ a ].load();
            }
        }
        
        compiledData.elements.draw();
    };

    GLOWShader.prototype.clone = function(except) {
        return new GLOW.Shader( { use: this.compiledData, except: except } );
    };

    GLOWShader.prototype.applyUniformData = function( uniformName, data ) {
        if( this.compiledData.uniforms[ uniformName ] !== undefined ) {
            this[ uniformName ] = data;
            this.compiledData.uniforms[ uniformName ].data = data;
            var ul = this.compiledData.uniformArray.length;
            while( ul-- ) {
                if( this.compiledData.uniformArray[ ul ].name === uniformName ) {
                    this.compiledData.uniformArray[ ul ].data = data;
                    break;
                }
            }
        }
    };

    GLOWShader.prototype.dispose = function( disposeBuffers, disposeProgram, disposeTextures ) {

        var u, a, i;

        for( u in this.compiledData.uniforms ) {
            delete this[ u ]; 
        }

        for( a in this.compiledData.attributes ) {
            delete this[ a ];
        }
        
        for( i in this.compiledData.interleavedAttributes ) {
            delete this[ i ];
        }

        delete this.program;
        delete this.elements;
        delete this.uniforms;
        delete this.attributes;
        delete this.interleavedAttributes;

        this.compiledData.dispose( disposeBuffers, disposeProgram, disposeTextures );
        delete this.compiledData;
    };

    return GLOWShader;
})();



