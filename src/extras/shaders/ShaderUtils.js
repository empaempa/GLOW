GLOW.ShaderUtils = {
	
	/*
	* Creates multiple shaders if element indices exceed 65535 (Uint16Array)
	* Note that the method used is quite stupid and just splits so each
	* element get their own attribute - sharing of attributes is no more
	* after this, thus potentially taking up more memory than before
	*/

	createMultiple: function( originalShaderConfig, attributeSizes ) {

        if( originalShaderConfig.triangles === undefined ||
            originalShaderConfig.data      === undefined ) {
	        GLOW.error( "GLOW.ShaderUtils.createMultiple: missing .data and/or .triangles in shader config object. Quitting." );
	        return;
        }

        var triangles, originalTriangles = originalShaderConfig.triangles;
        var data, originalData = originalShaderConfig.data;
        var except, excepts = [];
        var originalAttribute, newAttribute;
        var t, s, n, nl, ii, i = 0, il = originalTriangles.length;
        
        
        do {
//            shaderConfigs.push( shaderConfig = {} );
//            if( originalShaderConfig.interleave !== undefined ) shaderConfig.interleave = originalShaderConfig.interleave;
//            if( originalShaderConfig.usage      !== undefined ) shaderConfig.usage      = originalShaderConfig.usage;

            excepts.push( except = { elements: [] } );
            triangles = except.elements;
            
            for( s in attributeSizes ) {
                if( originalData[ s ] ) {
                    except[ s ] = [];
                } else {
    	            GLOW.error( "GLOW.ShaderUtils.createMultiple: attribute " + d + " doesn't exist in originalShaderConfig.data. Quitting." );
    	            return;
                }
            }
            
            for( t = 0; i < il; i += 3 ) {
                if( t > 65536 - 3 ) {
                    i -= 3;
                    break;
                }

                triangles[ t ] = t++;
                triangles[ t ] = t++;
                triangles[ t ] = t++;

        	    for( s in attributeSizes ) {
        	        originalAttribute = originalData[ s ];
        	        newAttribute      = except[ s ];
        	        size              = attributeSizes[ s ];

                    for( ii = 0; ii < 3; ii++ ) {
                        for( n = 0, nl = size; n < nl; n++ ) {
                            except[ s ].push( originalAttribute[ originalTriangles[ i + ii ] * size + n ] );
                        }
                    }
        	    }
            }
        } while( i < il );
        
        // create first shader...
        
        for( s in attributeSizes )
            originalShaderConfig.data[ s ] = excepts[ 0 ][ s ];
    
        originalShaderConfig.triangles = excepts[ 0 ].elements;
  
        var shader  = new GLOW.Shader( originalShaderConfig );
        var shaders = [ shader ];
        var attributes;
        var interleavedAttributes;
        
        // ...then clone it

        for( i = 1; i < excepts.length; i++ ) {
            for( s in attributeSizes )
                originalShaderConfig.data[ s ] = excepts[ i ][ s ];
                
    		attributes            = GLOW.Compiler.createAttributes( GLOW.Compiler.extractAttributes( shader.compiledData.program ), originalShaderConfig.data, originalShaderConfig.usage, originalShaderConfig.interleave );
    		interleavedAttributes = GLOW.Compiler.interleaveAttributes( attributes, originalShaderConfig.interleave );

            for( n in interleavedAttributes )
                excepts[ i ][ n ] = interleavedAttributes[ n ];

            shaders[ i ] = shader.clone( excepts[ i ] );
        }
        
	    return shaders;
	}
};


