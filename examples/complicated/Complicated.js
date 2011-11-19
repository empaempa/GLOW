var Complicated = (function() {

    // general variables 
    
    var context;
    var squareParticles = 128;
    var numParticles = squareParticles * squareParticles;

    // cameras, nodes and FBOs (will be created later)
 
    var cameraFBO    = new GLOW.Camera( { width: squareParticles, height: squareParticles, near: 0.1, far: 8000, aspect: 1 } );
    var camera       = new GLOW.Camera( { near: 0.1, far: 8000 } );
    var animalNode   = new GLOW.Node();
    var particleNode = new GLOW.Node();
    var depthFBO;
    var particlesFBO;
    
    // animation variables
    
    var animationSpeed = 0.2;
    var morph = 0;
    var frames;
    var framesByAnimal;
    var animals       = [ "horse", "bearbrownRun", "mountainlionRun", "deerLeap", "goldenretreiver", "foxRun", "seal", "chowRun", "bunnyScurry", "frogLeap", "raccoonRun" ];
    var currentAnimal = animals[ 0 ];
    var nextAnimal    = animals[ 1 ];

    // Shaders and shader configuration objects
    // The undefines in the configs will be set
    // later, before creation of shader
    
    // The depth shader renders the animal into
    // the depth FBO. Note that we don't interleave
    // the aVertexAnimalXFrameY as we like to switch
    // these to create an animation
    
    var depthShader;
    var depthShaderConfig = {
        vertexShader:       undefined,
        fragmentShader:     undefined,
        elements:           undefined,
        data: {
            uPerspectiveMatrix:     cameraFBO.projection,
            uViewMatrix:            animalNode.viewMatrix,
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
    
    // The particle simulation shader updates each and
    // every particle's data by sampling and writing to 
    // the particle FBO (one pixel = one particle)
    
    var particleSimulationShader;
    var particleSimulationShaderConfig = {
        vertexShader:       undefined,
        fragmentShader:     undefined,
        points:             undefined, 
        data: {
            uPerspectiveMatrix:         cameraFBO.projection,   // this one is used for sampling the depth FBO at the right place
            uViewMatrix:                animalNode.viewMatrix,  // this one is used for sampling the depth FBO at the right place
            uDepthFBO:                  undefined,
            uParticlesFBO:              undefined,
            aSimulationDataPositions:   undefined,
            aParticlePositions:         undefined,
        }
    };
    
    var particleRenderShader;
    var particleRenderShaderConfig = {
        vertexShader:       undefined,
        fragmentShader:     undefined,
        triangles:          undefined,
        data: {
            uPerspectiveMatrix:     camera.projection,
            uViewMatrix:            particleNode.viewMatrix,
            uParticlesFBO:          undefined,
            aParticlePositions:     undefined,
            aParticleDirections:    undefined,
            aParticleColors:        undefined
        }
    };
    
    var depthToScreenShader;
    var depthToScreenShaderConfig = {
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
            
            // the things we want to load...
            
            animal:                     "animals_A_life.js",
            depthShader:                "Depth.glsl",
            particleSimulationShader:   "ParticleSimulation.glsl",
            particleRenderShader:       "ParticleRender.glsl",
            depthToScreenShader:        "DepthToScreen.glsl",

            // ...and what we do when they are loaded.

            onLoadComplete: function( result ) {
                
                // setup context
                // we need to do this first as the frames creation
                // uses the global GL to create buffers
              
                context = new GLOW.Context( { width: 256, height: 256 } );
                context.setupClear( { red: 1, green: 1, blue: 1 } );
                context.domElement.style.position = 'absolute';
                context.domElement.style.left = '100px';
                context.domElement.style.top = '100px';
                
                document.getElementById( "container" ).appendChild( context.domElement );

                // parse animal faces (Three.js format)
                // we're really just interested in faces so we're skipping the rest 
                // Code snatched from Three.js by @mrdoob and @alteredq
                  
                var f, t, fl, i, n;
                var animalTriangles = [];
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
                        animalTriangles[ t++ ] = threeJsFaces[ f + 0 ];
                        animalTriangles[ t++ ] = threeJsFaces[ f + 1 ];
                        animalTriangles[ t++ ] = threeJsFaces[ f + 2 ];

                        animalTriangles[ t++ ] = threeJsFaces[ f + 0 ];
                        animalTriangles[ t++ ] = threeJsFaces[ f + 2 ];
                        animalTriangles[ t++ ] = threeJsFaces[ f + 3 ];

                        f += 4;
                    } else {
                        animalTriangles[ t++ ] = threeJsFaces[ f++ ];
                        animalTriangles[ t++ ] = threeJsFaces[ f++ ];
                        animalTriangles[ t++ ] = threeJsFaces[ f++ ];
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
                // we're just interested in having the WebGL buffers (GLOW.Attribute.buffer)
                // for each frame so we're creating them using the global GL
                
                frames = [];
                framesByAnimal = {};
                
                var threeJsMorphTargets = result.animal.morphTargets;
                for( f = 0, fl = threeJsMorphTargets.length; f < fl; f++ ) {
                    frames[ f ]        = {};
                    frames[ f ].name   =           threeJsMorphTargets[ f ].name.slice( 0, threeJsMorphTargets[ f ].name.indexOf( "_" ));
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

                // Now to the fun part, setting up the shaders and FBOs...
                
                // First we create the depth shader, which renders the animal
                // into the deopth FBO
                // We set dummy vertex data as we're overwriting the buffer
                // later with the frames create above
                
                depthShaderConfig.vertexShader              = result.depthShader.vertexShader;
                depthShaderConfig.fragmentShader            = result.depthShader.fragmentShader;
                depthShaderConfig.triangles                 = new Uint16Array( animalTriangles );
                depthShaderConfig.data.aVertexAnimalAFrame0 = new Float32Array( 1 );
                depthShaderConfig.data.aVertexAnimalAFrame1 = new Float32Array( 1 );
                depthShaderConfig.data.aVertexAnimalBFrame0 = new Float32Array( 1 );
                depthShaderConfig.data.aVertexAnimalBFrame1 = new Float32Array( 1 );
                
                depthShader = new GLOW.Shader( depthShaderConfig );

                // now it's time to create particle simulation and render shader
                // first generate the particle data that we need for the simulation
                
                var particlePositions = [];
                var particleDirections = [];
                var particleTriangles = [];
                var particleUVs = [];
                var simulationPoints = [];
                var simulationPositions = [];
                var simulationDataXYUVs = [];
                var simulationData = [];
                var y, z, u, v, s;
                for( var i = 0; i < numParticles; i++ ) {

                    // First simulation specific stuff...
                    // This is the elements array, containing
                    // offsets to the data created below (simulationDataXYUV)
                    
                    simulationPoints.push( i );
                    
                    // The simulation data XYUV is for sampling and writing
                    // For sampling the data, we need UV (0->1) and for 
                    // writing the data, we need XY (0->squareParticles). We 
                    // cram both XY and UV into a vec4. Note the weird 
                    // numbers in the formula for write position X - I can't
                    // really explain why it needs to be like this to work, 
                    // it might have to do with  128 * 1.001 = 128.128 ... 
                    // but I don't know, it's just weird :)

                    u = i % squareParticles;
                    v = Math.floor( i / squareParticles );
                    
                    simulationDataXYUVs.push( u * 1.001 / squareParticles * 2 - 0.999 );    // write position X (-1 -> 1)
                    simulationDataXYUVs.push( v * 1.001 / squareParticles * 2 - 0.999 );    // write position Y (-1 -> 1)
                    simulationDataXYUVs.push( u /= squareParticles );                       // read position U (0 -> 1)
                    simulationDataXYUVs.push( v /= squareParticles );                       // read position V (0 -> 1)

                    // This is the particle YZ. We calculate the X using the time
                    // stored in the FBO. As the amount of elements for the simulation
                    // and render missmatch we need to store them once for the simulation
                    // and once for the render (further down below) 

                    y = Math.random() * 1000 - 500;
                    z = Math.random() * 1000 - 500;
                    
                    simulationPositions.push( y );
                    simulationPositions.push( z );

                    // This is the data sent to the particleFBO at start

                    simulationData.push( Math.random());                            // x = time (0->1)
//                    simulationData.push( 0.0 );                                     // y = size 
                    simulationData.push( 0.0 );                                     // y = size 
                    simulationData.push( 0.0 );                                     // z = color 
//                    simulationData.push(( 255 << 16 ) & ( 255 << 8 ) & ( 0 << 0 )); // z = color (r<<16 & g<<8 & b )
                    simulationData.push( 1.0 );                                       // unused ATM
                    
                    // And now the render specfic stuff...
                    // This is the elements array, containing
                    // offset to the data created below. We create
                    // three triangles per particle to get a nice
                    // 3D thingy instead of a simple 2D sprite/point

                    particleTriangles.push( i * 4 + 0 ); particleTriangles.push( i * 4 + 1 ); particleTriangles.push( i * 4 + 2 );
                    particleTriangles.push( i * 4 + 0 ); particleTriangles.push( i * 4 + 2 ); particleTriangles.push( i * 4 + 3 );
                    particleTriangles.push( i * 4 + 0 ); particleTriangles.push( i * 4 + 3 ); particleTriangles.push( i * 4 + 1 );
                    particleTriangles.push( i * 4 + 3 ); particleTriangles.push( i * 4 + 2 ); particleTriangles.push( i * 4 + 1 );
                    
                    // Save the positions for each particle (we created y and z above) 
                    
                    particlePositions.push( y ); particlePositions.push( z ); 
                    particlePositions.push( y ); particlePositions.push( z ); 
                    particlePositions.push( y ); particlePositions.push( z ); 
                    particlePositions.push( y ); particlePositions.push( z ); 
                    
                    // because the amount of elements in the renderer and the 
                    // simulation missmatch, we need to store the UVs again
                    // for the render (we created u and v above)
                    
                    particleUVs.push( u ); particleUVs.push( v );
                    particleUVs.push( u ); particleUVs.push( v );
                    particleUVs.push( u ); particleUVs.push( v );
                    particleUVs.push( u ); particleUVs.push( v );
                    
                    // This is the data to expand each position to create 
                    // a 3D-particle. We store this separately to be able
                    // to rotate and scale the particle in the shader
                    
                    particleDirections.push( 0.0 + Math.random() * 0.2 );
                    particleDirections.push( 0.7 + Math.random() * 0.2 );
                    particleDirections.push( 1.3 + Math.random() * 0.2 );
                    
                    particleDirections.push( -1.0 + Math.random() * 0.2 );
                    particleDirections.push(  0.7 + Math.random() * 0.2 );
                    particleDirections.push( -0.7 + Math.random() * 0.2 );
    				
    				particleDirections.push(  1.0 + Math.random() * 0.2 );
    				particleDirections.push(  0.7 + Math.random() * 0.2 );
    				particleDirections.push( -0.7 + Math.random() * 0.2 );
    				
    				particleDirections.push(  0.0 + Math.random() * 0.2 );
    				particleDirections.push( -1.3 + Math.random() * 0.2 );
    				particleDirections.push(  0.0 + Math.random() * 0.2 );
                }

                // Now let's enable floating point textures and setup 
                // the depth and particle FBOs. Note that we're using
                // type FLOAT and send in an Float32Array with the inital
                // simulation data. The depthFBO has to be twice as wide as high
                // as we're rendering the back to the left and the front to 
                // the right

                if( !context.enableExtension( "OES_texture_float" )) {
                    alert( "Your graphics card doesn't support floating point textures. Sorry!" );
                    return;
                }

                depthFBO = new GLOW.FBO( { width: 256, 
                                           height: 128, 
                                           type: GL.FLOAT,
                                           magFilter: GL.NEAREST, 
                                           minFilter: GL.NEAREST } ); 

                particlesFBO = new GLOW.FBO( { width: squareParticles,     
                                               height: squareParticles, 
                                               type: GL.FLOAT, 
                                               magFilter: GL.NEAREST, 
                                               minFilter: GL.NEAREST, 
                                               depth: false,
                                               data: new Float32Array( simulationData ) } );

                // Setup the config and create the particle simulation shader

                particleSimulationShaderConfig.vertexShader              = result.particleSimulationShader.vertexShader;
                particleSimulationShaderConfig.fragmentShader            = result.particleSimulationShader.fragmentShader;
                particleSimulationShaderConfig.points                    = new Uint16Array( simulationPoints );
                particleSimulationShaderConfig.data.aSimulationDataXYUVs = new Float32Array( simulationDataXYUVs );
                particleSimulationShaderConfig.data.aSimulationPositions = new Float32Array( simulationPositions );
                particleSimulationShaderConfig.data.uDepthFBO            = depthFBO;
                particleSimulationShaderConfig.data.uParticlesFBO        = particlesFBO;
                
                particleSimulationShader = new GLOW.Shader( particleSimulationShaderConfig );

                // Setup the config and create particle render shader 

                particleRenderShaderConfig.vertexShader             = result.particleRenderShader.vertexShader;
                particleRenderShaderConfig.fragmentShader           = result.particleRenderShader.fragmentShader;
                particleRenderShaderConfig.triangles                = new Uint16Array( particleTriangles );
                particleRenderShaderConfig.data.aParticleUVs        = new Float32Array( particleUVs );
                particleRenderShaderConfig.data.aParticlePositions  = new Float32Array( particlePositions );
                particleRenderShaderConfig.data.aParticleDirections = new Float32Array( particleDirections );
                particleRenderShaderConfig.data.uParticlesFBO       = particlesFBO;

                particleRenderShader = new GLOW.Shader( particleRenderShaderConfig );


                // create depth to screen shader
                // use the FBO as texture
                
                depthToScreenShaderConfig.vertexShader   = result.depthToScreenShader.vertexShader;
                depthToScreenShaderConfig.fragmentShader = result.depthToScreenShader.fragmentShader;
                depthToScreenShaderConfig.data.uFBO      = particlesFBO;
                depthToScreenShader                      = new GLOW.Shader( depthToScreenShaderConfig );

                // start render

                setInterval( render, 1000 / 60 );
            }
        } );
    };
    
    var render = function() {
        
        // update animal and particle nodes
        
        animalNode.localMatrix.setPosition( 0, -1050, -4000 );
        //animalNode.localMatrix.addRotation( 0, 0.01, 0 );
        animalNode.update( undefined, cameraFBO.inverse );
        
        particleNode.localMatrix.setPosition( 0, 0, -4000 );
        particleNode.update( undefined, camera.inverse );
    
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
        
        // clear cache and we're ready to go rendering
        
		context.cache.clear();
		context.clear();

        // draw back and front animal to depth FBO
        // we draw back of volume to the left and the front
        // of the volume to the right

        context.enableDepthTest( true );
        
        depthFBO.bind( { x: 0, width: depthFBO.width * 0.5 } );
        depthFBO.clear();
        context.setupCulling( { cullFace: GL.FRONT } );

        depthShader.draw();

        depthFBO.setupViewport( { x: depthFBO.width * 0.5, width: depthFBO.width * 0.5 } );
        context.setupCulling( { cullFace: GL.BACK } );

        depthShader.draw();
        depthFBO.unbind( false );

        // update particle system and render
        
        context.enableDepthTest( false );
        
        particlesFBO.bind();
        particleSimulationShader.draw();
        particlesFBO.unbind();
//        particleSimulationShader.draw();
//        particleRenderShader.draw();

        // draw to screen (temp)

        depthToScreenShader.draw();

        stats.update();
    }
    
    var updateAnimaion = function( animal ) {
        framesByAnimal[ animal ].time  += animationSpeed;
        framesByAnimal[ animal ].frame0 = Math.floor( framesByAnimal[ animal ].time ) % framesByAnimal[ animal ].length;
        framesByAnimal[ animal ].frame1 = Math.ceil ( framesByAnimal[ animal ].time ) % framesByAnimal[ animal ].length;
        framesByAnimal[ animal ].time  %= framesByAnimal[ animal ].length;
        framesByAnimal[ animal ].morph  = framesByAnimal[ animal ].time - framesByAnimal[ animal ].frame0;
    }
    
    return { 
        load:   load
    };
})();
