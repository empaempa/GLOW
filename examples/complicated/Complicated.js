var Complicated = (function() {

    // variables 
    
    var context;

    var speed = 0.2;
    var morph = 0;
    var frames;
    var framesByAnimal;
    var animals = [ "horse", "bearbrownRun", "mountainlionRun", "deerLeap", "goldenretreiver", "foxRun", "seal", "chowRun", "bunnyScurry", "frogLeap", "raccoonRun" ];
    var currentAnimal = animals[ 0 ];
    var nextAnimal = animals[ 1 ];

    var camera = new GLOW.Camera( { near: 2000, far: 6000 } );
    var node = new GLOW.Node();
    var depthFBO;
    var depthShader;
    var depthShaderConfig = {                           // all undefines will be set before creating the shader
        vertexShader:       undefined,
        fragmentShader:     undefined,
        elements:           undefined,
        data: {
            uPerspectiveMatrix:     camera.projection,
            uViewMatrix:            node.viewMatrix,
            aVertexAnimalAFrame0:   undefined,
            aVertexAnimalAFrame1:   undefined,
            aVertexAnimalBFrame0:   undefined,
            aVertexAnimalBFrame1:   undefined,
            uFrameMorphA:           new GLOW.Float(),
            uFrameMorphB:           new GLOW.Float(),
            uAnimalMorph:           new GLOW.Float(),
        },
        interleave: {
            aVertexAnimalAFrame0:   false,
            aVertexAnimalAFrame1:   false,
            aVertexAnimalBFrame0:   false,
            aVertexAnimalBFrame1:   false   
        }
    };
    var depthToScreenShader;
    var depthToScreenShaderConfig = {                   // all undefines will be set before creating the shader
        vertexShader:   undefined,
        fragmentShader: undefined,
		elements:       GLOW.Geometry.Plane.elements(),
        data: {
            aVertices:  GLOW.Geometry.Plane.vertices(),
            aUVs:       GLOW.Geometry.Plane.uvs(),
            uFBO:       undefined
        }
    }
    
    // methods
    
    var load = function() {
        new GLOW.Load( {
            
            animal: "animals_A_life.js",
            depthShader: "Depth.glsl",
            depthToScreenShader: "DepthToScreen.glsl",
            dontParseJS: true,
            onLoadComplete: function( result ) {
                
                // setup context
                // we need to do this first as the frames creation
                // uses the global GL to create buffers
              
                context = new GLOW.Context();
                context.setupClear( { red: 1, green: 1, blue: 1 } );
                document.getElementById( "container" ).appendChild( context.domElement );

                // parse animal faces (Three.js format)
                // we're really just interested in face so we're skipping
                // uvs and materals. Code snatched from Three.js by
                // @mrdoob and @alteredq
                  
                var f, t, fl, i, n;
                var triangles = [];
                var threeJsFaces = result.animal.faces;
        		var type, isQuad, hasMaterial,
        		    hasFaceUv, hasFaceVertexUv,
        		    hasFaceNormal, hasFaceVertexNormal,
        		    hasFaceColor, hasFaceVertexColor;

                for( f = 0, t = 0, fl = threeJsFaces.length; f < fl; ) {
                    type                = threeJsFaces[ f++ ];
                    isQuad              = type & ( 1 << 0 );
                    hasMaterial         = type & ( 1 << 1 );
                    hasFaceUv           = type & ( 1 << 2 );
                    hasFaceVertexUv     = type & ( 1 << 3 );
                    hasFaceNormal       = type & ( 1 << 4 );
                    hasFaceVertexNormal = type & ( 1 << 5 );
                    hasFaceColor        = type & ( 1 << 6 );
                    hasFaceVertexColor  = type & ( 1 << 7 );

                    if( isQuad ) {
                        triangles[ t++ ] = threeJsFaces[ f + 0 ];
                        triangles[ t++ ] = threeJsFaces[ f + 1 ];
                        triangles[ t++ ] = threeJsFaces[ f + 2 ];

                        triangles[ t++ ] = threeJsFaces[ f + 0 ];
                        triangles[ t++ ] = threeJsFaces[ f + 2 ];
                        triangles[ t++ ] = threeJsFaces[ f + 3 ];

                        f += 4;
                    } else {
                        triangles[ t++ ] = threeJsFaces[ f++ ];
                        triangles[ t++ ] = threeJsFaces[ f++ ];
                        triangles[ t++ ] = threeJsFaces[ f++ ];
                    }
                    
                    if( hasMaterial         ) f++;
                    if( hasFaceUv           ) f++;                  // lacks support for multiple UV layers 
                    if( hasFaceVertexUv     ) f += isQuad ? 4 : 3;  // lacks support for multiple UV layers
                    if( hasFaceNormal       ) f++;
                    if( hasFaceVertexNormal ) f += isQuad ? 4 : 3;
                    if( hasFaceColor        ) f++;
                    if( hasFaceVertexColor  ) f += isQuad ? 4 : 3;
                } 
                
                // create frames
                // we're just interested in having the buffers (GLOW.Attribute.buffer)
                // for each frame so we're creating them using the global GL
                
                frames = [];
                framesByAnimal = {};
                
                var threeJsMorphTargets = result.animal.morphTargets;
                for( f = 0, fl = threeJsMorphTargets.length; f < fl; f++ ) {
                    frames[ f ]        = {};
                    frames[ f ].name   = threeJsMorphTargets[ f ].name.slice( 0, threeJsMorphTargets[ f ].name.indexOf( "_" ));
                    frames[ f ].frame  = parseInt( threeJsMorphTargets[ f ].name.slice( threeJsMorphTargets[ f ].name.lastIndexOf( "_" ) + 1 ) - 1, 10 );
                    frames[ f ].buffer = GL.createBuffer();
                    
                    GL.bindBuffer( GL.ARRAY_BUFFER, frames[ f ].buffer );
                    GL.bufferData( GL.ARRAY_BUFFER, new Float32Array( threeJsMorphTargets[ f ].vertices ), GL.STATIC_DRAW );                
                }
                
                // create frames by animal
                
                for( f = 0, fl = frames.length; f < fl; f++ ) {
                    if( framesByAnimal[ frames[ f ].name ] === undefined )
                        framesByAnimal[ frames[ f ].name ] = [];
                    
                    framesByAnimal[ frames[ f ].name ][ frames[ f ].frame ] = frames[ f ].buffer;
                    framesByAnimal[ frames[ f ].name ].time   = 0;
                    framesByAnimal[ frames[ f ].name ].frame0 = 0;
                    framesByAnimal[ frames[ f ].name ].frame1 = 1;
                    framesByAnimal[ frames[ f ].name ].morph  = 0;
                }

                // now the fun part, setting up the shaders and FBOs
                // first we enable floating point textures
                
                if( !context.enableExtension( "OES_texture_float" )) {
                    alert( "Your graphics card doesn't support floating point textures. Sorry!" );
                    return;
                }
                
                // set data, shaders and elements and create depth shader
                // we set dummy vertex data as we're overwriting the buffer
                // later with the frames create above
                
                depthShaderConfig.vertexShader              = result.depthShader.vertexShader;
                depthShaderConfig.fragmentShader            = result.depthShader.fragmentShader;
                depthShaderConfig.elements                  = new Uint16Array( triangles );
                depthShaderConfig.data.aVertexAnimalAFrame0 = new Float32Array( 3 );
                depthShaderConfig.data.aVertexAnimalAFrame1 = new Float32Array( 3 );
                depthShaderConfig.data.aVertexAnimalBFrame0 = new Float32Array( 3 );
                depthShaderConfig.data.aVertexAnimalBFrame1 = new Float32Array( 3 );

                depthShader = new GLOW.Shader( depthShaderConfig );
                depthFBO    = new GLOW.FBO( { width: 256, height: 256, type: GL.FLOAT } );
                

                // create depth to screen shader
                // use the FBO as texture
                
                depthToScreenShaderConfig.vertexShader   = result.depthToScreenShader.vertexShader;
                depthToScreenShaderConfig.fragmentShader = result.depthToScreenShader.fragmentShader;
                depthToScreenShaderConfig.data.uFBO      = depthFBO;
                depthToScreenShader                      = new GLOW.Shader( depthToScreenShaderConfig );

                // start render

                setInterval( render, 1000 / 60 );
            }
        } );
    };
    
    var render = function() {
        
        // rotate animal
        
        node.localMatrix.setPosition( 0, -1050, -3500 );
        node.localMatrix.addRotation( 0, 0.01, 0 );
        node.update( undefined, camera.inverse );
        
        // update animal animation
		
        updateAnimaion( currentAnimal );
        updateAnimaion( nextAnimal );
        
        depthShader.uAnimalMorph.set( 1 );
        depthShader.uFrameMorphA.set( framesByAnimal[ currentAnimal ].morph );
        depthShader.uFrameMorphB.set( framesByAnimal[ nextAnimal    ].morph );
        depthShader.aVertexAnimalAFrame0.buffer = framesByAnimal[ currentAnimal ][ framesByAnimal[ currentAnimal ].frame0 ];
        depthShader.aVertexAnimalAFrame1.buffer = framesByAnimal[ currentAnimal ][ framesByAnimal[ currentAnimal ].frame1 ];
        depthShader.aVertexAnimalBFrame0.buffer = framesByAnimal[ nextAnimal    ][ framesByAnimal[ nextAnimal    ].frame0 ];
        depthShader.aVertexAnimalBFrame1.buffer = framesByAnimal[ nextAnimal    ][ framesByAnimal[ nextAnimal    ].frame1 ];
        
        // clear cache, bind depth FBO and clear it
        
		context.cache.clear();

        depthFBO.bind();
        depthFBO.clear();

        // draw back and front to depth FBO, then unbind it
        // we draw back of volume to the left and the front
        // of the volume to the right

        depthFBO.setupViewport( { x: 0, width: depthFBO.width * 0.5, height: depthFBO.height * 0.5 } );
        context.setupCulling( { cullFace: GL.FRONT } );
        depthShader.draw();

        depthFBO.setupViewport( { x: depthFBO.width * 0.5, width: depthFBO.width * 0.5, height: depthFBO.height * 0.5 } );
        context.setupCulling( { cullFace: GL.BACK } );
        depthShader.draw();

        depthFBO.unbind();

        // do something...
        
        



        context.setupCulling( { cullFace: GL.BACK } );
        context.setupViewport( {} );
        depthToScreenShader.draw();
        

        // draw back
        // we need to invalidate the color uniform in the cache as
        // it's already set by the previous draw call
        // note that you need to invalidate depthShader.uniforms.uColor as
        // depthShader.uColor is only the data for the uniform

        // temp
      /*  node.localMatrix.addPosition( 100, 0, 0 );
        node.update( undefined, camera.inverse );
        context.cache.invalidateUniform( depthShader.uniforms.uViewMatrix );
        */
/*        depthShader.uColor.set( 0.0, 1.0, 0.0 );
        context.cache.invalidateUniform( depthShader.uniforms.uColor );
        context.setupCulling( { cullFace: GL.BACK } );
        depthShader.draw();*/
    }
    
    var updateAnimaion = function( animal ) {
        framesByAnimal[ animal ].time  += speed;
        framesByAnimal[ animal ].frame0 = Math.floor( framesByAnimal[ animal ].time ) % framesByAnimal[ animal ].length;
        framesByAnimal[ animal ].frame1 = Math.ceil ( framesByAnimal[ animal ].time ) % framesByAnimal[ animal ].length;
        framesByAnimal[ animal ].time  %= framesByAnimal[ animal ].length;
        framesByAnimal[ animal ].morph  = framesByAnimal[ animal ].time - framesByAnimal[ animal ].frame0;
    }
    
    return { 
        load:   load
    };
})();
