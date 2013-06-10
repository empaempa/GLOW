/*
* GLOW.Compiler
* @author: Mikael Emtinger, gomo.se
* Compiles vertex- and fragementshader, uniforms, attributes and elements into a GLOW.CompiledData
*/

GLOW.Compiler = (function() {
    
    "use strict"; 
    "use restrict";
    
    var compiler = {};
    
    //--- compile ------------------------------------------
    // parameter object containing:
    //  vertexShaderCode = string, the vertex shader code
    //  fragmentShaderCode = string, the framgnet shader code
    //  uniformsAndAttributes = object, for example { transform: GLOW.Matrix4 }
    //  elements = array or UInt16Array with elements
    
    compiler.compile = function( parameters ) {
        var program = GLOW.currentContext.cache.codeCompiled( parameters.vertexShader, parameters.fragmentShader );
        if( program === undefined ) {
            program = compiler.linkProgram( compiler.compileVertexShader  ( parameters.vertexShader   ),
                                            compiler.compileFragmentShader( parameters.fragmentShader ));
            GLOW.currentContext.cache.addCompiledProgram( program );
        }
        
        var uniforms              = compiler.createUniforms      ( compiler.extractUniforms  ( program ), parameters.data );
        var attributes            = compiler.createAttributes    ( compiler.extractAttributes( program ), parameters.data, parameters.usage, parameters.interleave );
        var interleavedAttributes = compiler.interleaveAttributes( attributes, parameters.interleave );

        if( parameters.elements ) {
            GLOW.error( "GLOW.Compiler.compile: .elements is no longer supported, please use .indices combined with .primitives" );
            return;
        }

        var indices         = parameters.indices;
        var primitives      = parameters.primitives !== undefined ? parameters.primitives : GL.TRIANGLES;
        var usageParameters = parameters.usage      !== undefined ? parameters.usage : {};
        var primitivesUsage = usageParameters.primitives;

        if( parameters.triangles ) {
            indices         = parameters.triangles;
            primitivesUsage = usageParameters.triangles;
        } else if( parameters.triangleStrip ) {
            indices         = parameters.triangleStrip;
            primitives      = GL.TRIANGLE_STRIP;
            primitivesUsage = usageParameters.triangleStrip;
        } else if( parameters.triangleFan ) {
            indices         = parameters.triangleFan;
            primitives      = GL.TRIANGLE_FAN;
            primitivesUsage = usageParameters.triangleFan;
        } else if( parameters.points ) {
            indices         = parameters.points;
            primitives      = GL.POINTS;
            primitivesUsage = usageParameters.points;
        } else if( parameters.lines ) {
            indices         = parameters.lines;
            primitives      = GL.LINES;
            primitivesUsage = usageParameters.lines;
        } else if( parameters.lineLoop ) {
            indices         = parameters.lineLoop;
            primitives      = GL.LINE_LOOP;
            primitivesUsage = usageParameters.lineLoop;
        } else if( parameters.lineStrip ) {
            indices         = parameters.lineStrip;
            primitives      = GL.LINE_STRIP;
            primitivesUsage = usageParameters.lineStrip;
        } 
        
        if( indices === undefined ) {                    // this is drawArray
            for( var a in attributes ) {
                if( attributes[ a ].data ) {
                    indices = attributes[ a ].data.length / attributes[ a ].size;
                    break;
                }
            }
            
            if( indices === undefined ) {
                for( var i in interleavedAttributes ) {
                    for( var a in interleavedAttributes[ i ].attributes ) {
                        indices = interleavedAttributes[ i ].attributes[ a ].data.length / interleavedAttributes[ i ].attributes[ a ].size;
                        break;
                    }
                    break;
                }
            }

            if( indices === undefined ) {                // this is fallback length if no attributes exists at compile time
                  indices = 0;                                 
            }
        }

        var elements = compiler.createElements( indices, primitives, primitivesUsage ); 

        return new GLOW.CompiledData( program, uniforms, attributes, interleavedAttributes, elements, parameters );
    };


    //--- compile vertex shader ---

    compiler.compileVertexShader = function( vertexShaderCode ) {

        var vertexShader;
        vertexShader    = GL.createShader( GL.VERTEX_SHADER );
        vertexShader.id = GLOW.uniqueId();
        
        GL.shaderSource ( vertexShader, vertexShaderCode );
        GL.compileShader( vertexShader );

        if( !GL.getShaderParameter( vertexShader, GL.COMPILE_STATUS ) && !GL.isContextLost() ) {
            GLOW.error( "GLOW.Compiler.compileVertexShader: " + GL.getShaderInfoLog( vertexShader ));
        }
        
        return vertexShader;
    };


    //--- compile fragment shader code ---

    compiler.compileFragmentShader = function( fragmentShaderCode ) {

        var fragmentShader;
        fragmentShader    = GL.createShader( GL.FRAGMENT_SHADER );
        fragmentShader.id = GLOW.uniqueId();
        
        GL.shaderSource ( fragmentShader, fragmentShaderCode );
        GL.compileShader( fragmentShader );

        if( !GL.getShaderParameter( fragmentShader, GL.COMPILE_STATUS ) && !GL.isContextLost() ) {
            GLOW.error( "GLOW.Compiler.compileFragmentShader: " + GL.getShaderInfoLog( fragmentShader ));
        }
        
        return fragmentShader;
    };


    //--- link program ---

    compiler.linkProgram = function( vertexShader, fragmentShader ) {

        var program = GL.createProgram();
        
        if ( !program ) {
            GLOW.error( "GLOW.Compiler.linkProgram: Could not create program" );
        }
        
        program.id = GLOW.uniqueId();

        GL.attachShader( program, vertexShader );
        GL.attachShader( program, fragmentShader );
        GL.linkProgram ( program );

        if( !GL.getProgramParameter( program, GL.LINK_STATUS ) && !GL.isContextLost() ) {
            GLOW.error( "GLOW.Compiler.linkProgram: Could not initialise program" );
        }
    
        return program;
    };
    
    
    //--- extract uniforms ---

    compiler.extractUniforms = function( program ) {
        var uniforms = {};
        var uniform;
        var locationNumber = 0;
        var numLocations = GL.getProgramParameter( program, GL.ACTIVE_UNIFORMS );
        var result;

        for( ; locationNumber < numLocations; locationNumber++ ) {
            result = GL.getActiveUniform( program, locationNumber );
            if( result !== null && result !== -1 && result !== undefined ) {
                uniform = {
                    name: result.name.split( "[" )[ 0 ],
                    size: result.size,
                    type: result.type,
                    location: GL.getUniformLocation( program, result.name.split( "[" )[ 0 ] ),
                    locationNumber: locationNumber
                };
                uniforms[ uniform.name ] = uniform;
            } else break;
        }

        return uniforms;
    };


    //--- extract attributes ---
    
    compiler.extractAttributes = function( program ) {
        var attributes = {};
        var attribute;
        var locationNumber = 0;
        var numLocations = GL.getProgramParameter( program, GL.ACTIVE_ATTRIBUTES );
        var result;

        for( ; locationNumber < numLocations; locationNumber++ ) {
            result = GL.getActiveAttrib( program, locationNumber );
            if( result !== null && result !== -1 && result !== undefined ) {
                attribute = {
                    name: result.name,
                    size: result.size,
                    type: result.type,
                    location: GL.getAttribLocation( program, result.name ),
                    locationNumber: locationNumber
                };
                attributes[ attribute.name ] = attribute;
            } else break;
        }

        program.highestAttributeNumber = locationNumber - 1;
        return attributes;
    };
    

    //--- create uniforms ---

    compiler.createUniforms = function( uniformInformation, data ) {
        var u;
        var uniforms = {};
        var uniform, name;
        var textureUnit = 0;

        for( u in uniformInformation ) {
            uniform = uniformInformation[ u ];
            name    = uniform.name;
            if( data[ name ] instanceof GLOW.Uniform ) {
                uniforms[ name ] = data[ name ];
            } else {
                if( data[ name ] === undefined ) {
                    GLOW.warn( "GLOW.Compiler.createUniforms: missing data for uniform " + name + ". Creating anyway, but make sure to set data before drawing." );
                }
                uniforms[ name ] = new GLOW.Uniform( uniform, data[ name ] );
                if( uniforms[ name ].type === GL.SAMPLER_2D || uniforms[ name ].type === GL.SAMPLER_CUBE ) {
                    uniforms[ name ].textureUnit = textureUnit++;
                    if( uniforms[ name ].data !== undefined )
                        uniforms[ name ].data.init();
                }
            }
        }
        
        return uniforms;
    };


    //--- create attributes ---

    compiler.createAttributes = function( attributeInformation, data, usage, interleave ) {

        var a;
        var attribute, name;
        var attributes = {};
        var defaultInterleave = true;
        
        interleave = interleave !== undefined ? interleave : {};
        if( interleave === false ) {
            defaultInterleave = false;
        }
        usage = usage !== undefined ? usage : {};

        for( a in attributeInformation ) {
            attribute = attributeInformation[ a ];
            name      = attribute.name;
            
            if( data[ name ] instanceof GLOW.Attribute ) {
                attributes[ name ] = data[ name ];
            } else {
                if( data[ name ] === undefined ) {
                    GLOW.warn( "GLOW.Compiler.createAttributes: missing data for attribute " + name + ". Creating anyway, but make sure to set data before drawing." );
                }
                attributes[ name ] = new GLOW.Attribute( attribute, data[ name ], usage[ name ], interleave[ name ] !== undefined ? interleave[ name ] : defaultInterleave );
            }
        }

        return attributes;
    };
    
    //--- interleave attributes ---
    
    compiler.interleaveAttributes = function( attributes, interleave ) {

        interleave = interleave !== undefined ? interleave : {};
  
        if( interleave === false ) {
            return {};
        }

        var a, al, b, bl, i;
        var lowestAvailableIndex = 0;
        var attributeByIndex = [];
        
        // early out if only one attribute in program
        al = 0;
        for( a in attributes ) {
            al++;
        }
        if( al === 1 ) {
            // if attribute is interleaved, force to non-interleaved and upload its data
            for( a in attributes ) {
                if( attributes[ a ].interleaved === true ) {
                    attributes[ a ].interleaved = false;
                    if( attributes[ a ].data )
                        attributes[ a ].bufferData();
                }
            }
            return undefined;
        }

        // get lowest available index
        for( a in attributes ) {
            if( interleave[ a ] !== undefined && interleave[ a ] !== false ) {
                lowestAvailableIndex = Math.max( lowestAvailableIndex - 1, interleave[ a ] ) + 1;
            }
        }
        
        // set all non-set attributes to lowest available index
        for( a in attributes ) {
            if( interleave[ a ] === undefined ) {
                interleave[ a ] = lowestAvailableIndex;
            }
        }
        
        // sort attributes into 2d-array
        for( i in interleave ) {
            if( interleave[ i ] !== false ) {
                if( attributeByIndex[ interleave[ i ]] === undefined ) {
                    attributeByIndex[ interleave[ i ]] = [];
                }
                attributeByIndex[ interleave[ i ]].push( attributes[ i ] );
            }
        }
        
        // stride overflow check
        var stride, attribute, currentLength;
        for( a = 0, al = attributeByIndex.length; a < al; a++ ) {
            if( attributeByIndex[ a ] !== undefined ) {
                stride = 0;
                for( b = 0, bl = attributeByIndex[ a ].length; b < bl; b++ ) {
                    if( stride + attributeByIndex[ a ][ b ].size * 4 > 255 ) {
                        GLOW.warn( "GLOW.Compiler.interleaveAttributes: Stride owerflow, moving attributes to new interleave index. Please check your interleave setup!" );
                        currentLength = attributeByIndex.length;
                        attributeByIndex[ currentLength ] = [];
                        while( b < bl ) {
                            attributeByIndex[ currentLength ].push( attributeByIndex[ a ][ b ] );
                            attributeByIndex[ a ].splice( b, 1 );
                            bl--;
                        }
                        continue;
                    }
                    stride += attributeByIndex[ a ][ b ].size * 4;
                }
            }
        }
        
        // create interleaved attributes
        var name, interleavedAttributes = {};
        for( a = 0, al = attributeByIndex.length; a < al; a++ ) {
            if( attributeByIndex[ a ] !== undefined ) {
                name = "";
                for( b = 0, bl = attributeByIndex[ a ].length; b < bl; b++ ) {
                    name += b !== bl - 1 ? attributeByIndex[ a ][ b ].name + "_" : attributeByIndex[ a ][ b ].name;
                }
                interleavedAttributes[ name ] = new GLOW.InterleavedAttributes( attributeByIndex[ a ] );
            }
        }
        
        
        // remove interleaved attributes from attribute object
        for( i in interleave ) {
            if( interleave[ i ] !== false ) {
                delete attributes[ i ];
            }
        }
        
        return interleavedAttributes;
    };
    
    
    //--- create elements ---
    
    compiler.createElements = function( data, type, usage ) {

        var elements;

        if( data instanceof GLOW.Elements ) {
            elements = data;
        } else {
            elements = new GLOW.Elements( data, type, usage );
        }

        return elements;
    };
    
    return compiler;

})();
