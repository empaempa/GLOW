var Complicated = (function() {

    // General variables 
    
    var context;
    var sqrtParticles = 128;
    var numParticles = sqrtParticles * sqrtParticles;

    // Cameras, nodes and FBOs (which will be created later)
 
    var cameraFBO              = new GLOW.Camera( { near: 0.1, far: 8000, aspect: 1 } );
    var camera                 = new GLOW.Camera( { near: 0.1, far: 8000 } );
    var animalNode             = new GLOW.Node();
    var particleSimulationNode = new GLOW.Node();
    var particleRenderNode     = new GLOW.Node();
    var depthFBO;
    var particlesFBO;
    var postFBO;
    
    // Animation variables
    
    var frames;
    var framesByAnimal;
    var animationSpeed     = 0.2;
    var animalMorph        = 0;
    var changeAnimal       = false;
    var animals            = [ "horse", "bearbrown", "mountainlion", "deer", "goldenretreiver", "fox", "seal", "chow", "raccoon" ];
    var animalsScale       = [ 0.6,     0.58,        0.9,            0.9,    1.2,               1.7,   1.4,    1.4,    2.0       ];
    var currentAnimalIndex = 0;
    var currentAnimal      = animals[ 0 ];
    var nextAnimal         = animals[ 1 ];
    var mouseX             = 0;
    var mouseY             = 0;

    // Shaders and shader configuration objects.
    // The undefines in the configs will be set
    // later, before creation of shader.
    
    // The depth shader renders the animal into
    // the depth FBO. Note that we don't interleave
    // the aVertexAnimalXFrameY and aColorAnimalX
    // as we like to switch these to create an animation
    
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
            aColorAnimalA:          undefined,
            aColorAnimalB:          undefined,
            uFrameMorphA:           new GLOW.Float(),
            uFrameMorphB:           new GLOW.Float(),
            uAnimalMorph:           new GLOW.Float(),
            uAnimalAScale:          new GLOW.Float(),
            uAnimalBScale:          new GLOW.Float()
        },
        interleave: {
            aVertexAnimalAFrame0:   false,
            aVertexAnimalAFrame1:   false,
            aVertexAnimalBFrame0:   false,
            aVertexAnimalBFrame1:   false,
            aColorAnimalA:          false,
            aColorAnimalB:          false,
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
            uPerspectiveMatrix:         cameraFBO.projection,
            uViewMatrix:                particleSimulationNode.viewMatrix,
            uViewportSize:              new GLOW.Vector2( sqrtParticles, sqrtParticles ),
            uDepthFBO:                  undefined,
            uParticlesFBO:              undefined,
            uTime:                      new GLOW.Float( 0.001 ),
            aSimulationDataPositions:   undefined,
            aParticlePositions:         undefined,
        }
    };
    
    // The particle render shader uses the data that the
    // particle simulation shader has written and renders
    // the actual 3D-particle to the screen
    
    var particleRenderShaders;
    var particleRenderShaderConfig = {
        vertexShader:       undefined,
        fragmentShader:     undefined,
        triangles:          undefined,
        data: {
            uPerspectiveMatrix:     camera.projection,
            uViewMatrix:            particleRenderNode.viewMatrix,
            uParticlesFBO:          undefined,
            aParticlePositions:     undefined,
            aParticleDirections:    undefined,
            aParticleNormals:       undefined,
            aParticleDarkness:      undefined
        }
    };

    // post effect shader
    
    var postShader;
    var postShaderConfig = {
        vertexShader:       undefined,
        fragmentShader:     undefined,
        triangles:          GLOW.Geometry.Plane.elements(),
        data: {
            aVertices:              GLOW.Geometry.Plane.vertices(),
            aUVs:                   GLOW.Geometry.Plane.uvs(),
            uFBO0:                  undefined,
            uFBO1:                  undefined,
            uFBO2:                  undefined,
            uFBO3:                  undefined
        }
    }
        
    // Temporary debug shader that I've used 
    // to look at the data in the FBOs
    
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
    
    // Methods
    // load is called from the index.html
    
    var load = function() {
        new GLOW.Load( {
            
            // The things we want to load...
            
            animal:                     "animals.js",
            depthShader:                "Depth.glsl",
            particleSimulationShader:   "ParticleSimulation.glsl",
            particleRenderShader:       "ParticleRender.glsl",
            depthToScreenShader:        "DepthToScreen.glsl",
            postShader:                 "Post.glsl",

            // ...and what we do when they are loaded.

            onLoadComplete: function( loadedData ) {
                
                // Setup the WebGL context
                // We need to do this first as the animation frames creation
                // uses the global GL to create buffers.
              
                context = new GLOW.Context();
                
                if( context.GL === null ) {
                    alert( "Couldn't initialize WebGL" );
                    return;
                }
                
                context.setupClear( { red: 1, green: 1, blue: 1 } );
                document.getElementById( "container" ).appendChild( context.domElement );

                // Parse animal faces (Three.js format).
                // We're really just interested in faces so we're skipping the rest. 
                // Colors are taken out in a separate loop.
                // Code snatched from Three.js by @mrdoob and @alteredq
                  
                var f, t, fl, i, n;
                var animalTriangles = [];
                var threeJsFaces = loadedData.animal.faces;
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
                
                // Create colors
                // In the next loop we're putting these next to the animation
                // frame buffers for easy access in the update loop
                
                colorsByAnimal = {};
                
                var name, 
                    colors, 
                    threeJsMorphColors = loadedData.animal.morphColors;
                
                for( f = 0, fl = threeJsMorphColors.length; f < fl; f++ ) {
                    name   = threeJsMorphColors[ f ].name.slice( 0, threeJsMorphColors[ f ].name.indexOf( "_" ));
                    colors = threeJsMorphColors[ f ].colors;
                     
                    colorsByAnimal[ name ] = GL.createBuffer();
                    GL.bindBuffer( GL.ARRAY_BUFFER, colorsByAnimal[ name ] );
                    GL.bufferData( GL.ARRAY_BUFFER, new Float32Array( colors ), GL.STATIC_DRAW );                
                }
                
                // Create animation frames
                // We're just interested in having the WebGL buffers (GLOW.Attribute.buffer)
                // for each frame so we're creating them using the global GL
                
                frames = [];
                framesByAnimal = {};
                
                var threeJsMorphTargets = loadedData.animal.morphTargets;
                for( f = 0, fl = threeJsMorphTargets.length; f < fl; f++ ) {
                    frames[ f ]              = {};
                    frames[ f ].name         =           threeJsMorphTargets[ f ].name.slice( 0, threeJsMorphTargets[ f ].name.indexOf( "_" )).toLowerCase();
                    frames[ f ].frame        = parseInt( threeJsMorphTargets[ f ].name.slice( threeJsMorphTargets[ f ].name.lastIndexOf( "_" ) + 1 ) - 1, 10 );
                    frames[ f ].colorBuffer  = colorsByAnimal[ frames[ f ].name ];
                    frames[ f ].vertexBuffer = GL.createBuffer();
                    
                    GL.bindBuffer( GL.ARRAY_BUFFER, frames[ f ].vertexBuffer );
                    GL.bufferData( GL.ARRAY_BUFFER, new Float32Array( threeJsMorphTargets[ f ].vertices ), GL.STATIC_DRAW );                
                }
                
                // Create frames by animal object
                
                for( f = 0, fl = frames.length; f < fl; f++ ) {
                    if( framesByAnimal[ frames[ f ].name ] === undefined )
                        framesByAnimal[ frames[ f ].name ] = [];
                    
                    framesByAnimal[ frames[ f ].name ][ frames[ f ].frame ] = { vertexBuffer: frames[ f ].vertexBuffer, colorBuffer: frames[ f ].colorBuffer };
                    framesByAnimal[ frames[ f ].name ].time   = 0;
                    framesByAnimal[ frames[ f ].name ].frame0 = 0;
                    framesByAnimal[ frames[ f ].name ].frame1 = 1;
                    framesByAnimal[ frames[ f ].name ].morph  = 0;
                }

                // Now to the fun part, setting up the shaders and FBOs...
                
                // First we create all the data we need for the particle simulation shader,
                // particle render shader and the particle FBO.
                
                var particlePositions = [];
                var particleDirections = [];
                var particleDarkness = [];
                var particleTriangles = [];
                var particleUVs = [];
                var simulationPoints = [];
                var simulationPositions = [];
                var simulationDataXYs = [];
                var simulationData = [];
                var y, z, u, v, s;
                for( var i = 0; i < numParticles; i++ ) {

                    // First simulation specific stuff...
                    // This is the points array, containing
                    // offsets to the data created below (simulationDataXYUV).
                    // We're not using triangles but points as we need to run
                    // the vertex and fragment shader once for each pixel in the 
                    // particlesFBO (one pixel = one particle)
                    
                    simulationPoints.push( i );
                    
                    // The simulation data XY is for reading/writing data fromt/to the FBO
                    // For reading the data in the particle renderer we need UV (0->1) and for 
                    // writing the data in the particle simulation we need XY (-1->1). Reading
                    // the data in the particle simulation is handled using gl_FragCoord

                    u =           ( i % sqrtParticles ) / sqrtParticles;
                    v = Math.floor( i / sqrtParticles ) / sqrtParticles;
                    
                    simulationDataXYs.push( u * 2 - 1 + 1 / sqrtParticles );    // write position X (-1 -> 1)
                    simulationDataXYs.push( v * 2 - 1 + 1 / sqrtParticles );    // write position Y (-1 -> 1)

                    // This is the particle YZ space position. We calculate the X using the time
                    // stored in the FBO. As the amount of elements for the simulation
                    // and render missmatch we need to store them once for the simulation
                    // and once for the render (further down below). We use UV to get an even distribution
                    // of the particles. 

                    y = u * 2000 - 1000;
                    z = v * 2000 - 1000;
                    
                    simulationPositions.push( y );
                    simulationPositions.push( z );

                    // This is the data sent to the particleFBO at start - 4 floats per pixel/particle

                    simulationData.push( Math.random());                            // x = translation time (0->1)
                    simulationData.push( Math.random() * 2 * 3.1415 );              // y = rotation
                    simulationData.push( 0.0 );                                     // z = size 
                    simulationData.push( 0.1 );                                     // w = luminence
                    
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
                    
                    // Again, because the amount of elements in the renderer and the 
                    // simulation missmatch, we need to store the UVs again
                    // for the render (we created u and v above)
                    
                    particleUVs.push( u ); particleUVs.push( v );
                    particleUVs.push( u ); particleUVs.push( v );
                    particleUVs.push( u ); particleUVs.push( v );
                    particleUVs.push( u ); particleUVs.push( v );
                    
                    // This is the data to expand each position to create 
                    // a 3D-particle. We store this separately to be able
                    // to rotate and scale the particle in the shader.
                    // We use some randomness so not every particle looks
                    // the same.
                    
                    particleDirections.push( 0.0 + /*Math.random() */ 0.2 );
                    particleDirections.push( 0.7 + /*Math.random() */ 0.2 );
                    particleDirections.push( 1.3 + /*Math.random() */ 0.2 );
                    
                    particleDirections.push( -1.0 + /*Math.random() */ 0.2 );
                    particleDirections.push(  0.7 + /*Math.random() */ 0.2 );
                    particleDirections.push( -0.7 + /*Math.random() */ 0.2 );
    				
    				particleDirections.push(  1.0 + /*Math.random() */ 0.2 );
    				particleDirections.push(  0.7 + /*Math.random() */ 0.2 );
    				particleDirections.push( -0.7 + /*Math.random() */ 0.2 );
    				
    				particleDirections.push(  0.0 + /*Math.random() */ 0.2 );
    				particleDirections.push( -1.3 + /*Math.random() */ 0.2 );
    				particleDirections.push(  0.0 + /*Math.random() */ 0.2 );
                }

                // Now let's enable floating point textures and setup 
                // the depth and particle FBOs. Note that we're using
                // type FLOAT and send in an Float32Array with the inital
                // simulation data. We're also setting NEAREST for mag and
                // min filter to avoid leaking of data between pixels (particles).
                // The particle FBO doesn't need any depth buffer, so we disable that
                
                // The depthFBO has to be twice as wide as high
                // as we're rendering the back to the left and the front to 
                // the right

                if( !context.enableExtension( "OES_texture_float" )) {
                    alert( "Your graphics card doesn't support floating point textures. Sorry!" );
                    return;
                }
                
                if( !context.maxVertexTextureImageUnits() ) {
                    alert( "Your graphics card and browser combination doesn't supprt vertex shader textures. Sorry!" );
                    return;
                }

                depthFBO = new GLOW.FBO( { width: 256, 
                                           height: 128,
                                           magFilter: GL.NEAREST, 
                                           minFilter: GL.NEAREST,
                                           clear: { red: 0, green: 1, blue: 1, alpha: 0 } } ); 

                particlesFBO = new GLOW.FBO( { width: sqrtParticles,     
                                               height: sqrtParticles, 
                                               type: GL.FLOAT, 
                                               magFilter: GL.NEAREST, 
                                               minFilter: GL.NEAREST, 
                                               depth: false,
                                               data: new Float32Array( simulationData ) } );

                postFBO = new GLOW.FBO( { clear: { red: 1, green: 1, blue: 1, alpha: 0 }, magFilter: GL.NEAREST, minFilter: GL.NEAREST } )

                // Setup the config and create the particle simulation shader

                particleSimulationShaderConfig.vertexShader              = loadedData.particleSimulationShader.vertexShader;
                particleSimulationShaderConfig.fragmentShader            = loadedData.particleSimulationShader.fragmentShader;
                particleSimulationShaderConfig.points                    = new Uint16Array( simulationPoints );
                particleSimulationShaderConfig.data.aSimulationDataXYs   = new Float32Array( simulationDataXYs );
                particleSimulationShaderConfig.data.aSimulationPositions = new Float32Array( simulationPositions );
                particleSimulationShaderConfig.data.uDepthFBO            = depthFBO;
                particleSimulationShaderConfig.data.uParticlesFBO        = particlesFBO;
                
                particleSimulationShader = new GLOW.Shader( particleSimulationShaderConfig );

                // Setup the shader config for the particle render 

                particleRenderShaderConfig.vertexShader             = loadedData.particleRenderShader.vertexShader;
                particleRenderShaderConfig.fragmentShader           = loadedData.particleRenderShader.fragmentShader;
                particleRenderShaderConfig.triangles                = particleTriangles;
                particleRenderShaderConfig.data.aParticleUVs        = particleUVs;
                particleRenderShaderConfig.data.aParticlePositions  = particlePositions;
                particleRenderShaderConfig.data.aParticleDirections = particleDirections;
                particleRenderShaderConfig.data.aParticleNormals    = undefined;            // calculated below
                particleRenderShaderConfig.data.aParticleDarkness   = undefined;            // calculated below
                particleRenderShaderConfig.data.uParticlesFBO       = particlesFBO;
                
                // The data we created above wasn't flat shaded so we're using the nifty little
                // helper to flat shade the particles and then compute normals. 
                // The attribute data sizes defines the size of the attributes (2=vec2, 3=vec3)
                
                var attributeDataSizes = { aParticleUVs: 2, 
                                           aParticlePositions: 2,
                                           aParticleDirections: 3,
                                           aParticleNormals: 3 };
                
                GLOW.Geometry.flatShade( particleRenderShaderConfig, attributeDataSizes );
                particleRenderShaderConfig.data.aParticleNormals  = GLOW.Geometry.faceNormals( particleRenderShaderConfig.data.aParticleDirections, particleRenderShaderConfig.triangles );
                particleRenderShaderConfig.data.aParticleDarkness = GLOW.Geometry.randomArray( particleRenderShaderConfig.triangles.length, 0.5, 0.4, 3 );

                // Because we now have higher attribute indices than 65535 we need to create
                // multiple shaders. We use the brand new shader util createMultiple to this, which
                // returns an array of shaders 

                particleRenderShaders = GLOW.ShaderUtils.createMultiple( particleRenderShaderConfig, attributeDataSizes );

                // Lets create the depth shader, which renders the animal
                // into the depth FBO.
                // We set dummy vertex and color data as we're overwriting the buffer
                // later with the frames create above. The depth FBO will be created
                // later and bound before drawing this shader.
                
                depthShaderConfig.vertexShader              = loadedData.depthShader.vertexShader;
                depthShaderConfig.fragmentShader            = loadedData.depthShader.fragmentShader;
                depthShaderConfig.triangles                 = new Uint16Array( animalTriangles );
                depthShaderConfig.data.aVertexAnimalAFrame0 = new Float32Array( 1 );
                depthShaderConfig.data.aVertexAnimalAFrame1 = new Float32Array( 1 );
                depthShaderConfig.data.aVertexAnimalBFrame0 = new Float32Array( 1 );
                depthShaderConfig.data.aVertexAnimalBFrame1 = new Float32Array( 1 );
                depthShaderConfig.data.aColorAnimalA        = new Float32Array( 1 );
                depthShaderConfig.data.aColorAnimalB        = new Float32Array( 1 );
                
                depthShader = new GLOW.Shader( depthShaderConfig );

                
                // Lastly, let's create the post shader
                
                postShaderConfig.vertexShader   = loadedData.postShader.vertexShader;
                postShaderConfig.fragmentShader = loadedData.postShader.fragmentShader;
                postShaderConfig.data.uFBO      = postFBO;
                
                postShader = new GLOW.Shader( postShaderConfig );


                // This shader is for debug use only
                
                depthToScreenShaderConfig.vertexShader   = loadedData.depthToScreenShader.vertexShader;
                depthToScreenShaderConfig.fragmentShader = loadedData.depthToScreenShader.fragmentShader;
                depthToScreenShaderConfig.data.uFBO      = particlesFBO;
                depthToScreenShader                      = new GLOW.Shader( depthToScreenShaderConfig );

                // setup mouse
                
                document.onclick = function() {
                    changeAnimal = true;
                };
                
                document.onmousemove = function( e ) {
                    mouseX = ( e.clientX - window.innerWidth  * 0.5 ) / window.innerWidth;
                    mouseY = ( e.clientY - window.innerHeight * 0.5 ) / window.innerHeight;
                }

                // start render (using setInterval as WebGLInspector seems to have problems with requestAnimationFrame)

                setInterval( render, 1000 / 60 );
                
                // remove loading
                
                document.getElementById( "loading" ).style.visibility = 'hidden'; 
            }
        } );
    };

    var time = 0;
    
    var render = function() {
        
        // update animal, particle simulation and render nodes
        
        var rotation = Math.PI * 2 * mouseX + Math.PI * 0.5;
        
        animalNode.localMatrix.setPosition( 0, -650, -3000 );
        animalNode.localMatrix.setRotation( 0.0, rotation, 0.0 );
        animalNode.update( undefined, cameraFBO.inverse );
        
        particleSimulationNode.localMatrix.setPosition( 0, 0, -3000 );
        particleSimulationNode.localMatrix.setRotation( 0.0, rotation, 0.0 );
        particleSimulationNode.update( undefined, cameraFBO.inverse );

        particleRenderNode.localMatrix.copy( particleSimulationNode.localMatrix );
        particleRenderNode.update( undefined, camera.inverse );
    
        time += 0.01;
    
        // Update animal animation
		
		if( changeAnimal ) {
		    animalMorph += 0.05;
		    
		    if( animalMorph >= 1.0 ) {
		        animalMorph = 0;
		        currentAnimalIndex = ( currentAnimalIndex + 1 ) % animals.length;
		        currentAnimal = animals[ currentAnimalIndex ];
		        nextAnimal    = animals[ ( currentAnimalIndex + 1 ) % animals.length ];
		        changeAnimal  = false;
		    }
		}
		
        updateAnimaion( currentAnimal );
        updateAnimaion( nextAnimal );
        
        // Updated the uniforms
        
        depthShader.uAnimalMorph.set( animalMorph );
        depthShader.uFrameMorphA.set( framesByAnimal[ currentAnimal ].morph );
        depthShader.uFrameMorphB.set( framesByAnimal[ nextAnimal    ].morph );
        depthShader.uAnimalAScale.set( animalsScale[ currentAnimalIndex ] );
        depthShader.uAnimalBScale.set( animalsScale[ ( currentAnimalIndex + 1 ) % animals.length ] );
        
        // Update the attributes' buffers
        
        depthShader.aVertexAnimalAFrame0.buffer = framesByAnimal[ currentAnimal ][ framesByAnimal[ currentAnimal ].frame0 ].vertexBuffer;
        depthShader.aVertexAnimalAFrame1.buffer = framesByAnimal[ currentAnimal ][ framesByAnimal[ currentAnimal ].frame1 ].vertexBuffer;
        depthShader.aVertexAnimalBFrame0.buffer = framesByAnimal[ nextAnimal    ][ framesByAnimal[ nextAnimal    ].frame0 ].vertexBuffer;
        depthShader.aVertexAnimalBFrame1.buffer = framesByAnimal[ nextAnimal    ][ framesByAnimal[ nextAnimal    ].frame1 ].vertexBuffer;
        depthShader.aColorAnimalA.buffer        = framesByAnimal[ currentAnimal ][ framesByAnimal[ currentAnimal ].frame0 ].colorBuffer;
        depthShader.aColorAnimalB.buffer        = framesByAnimal[ nextAnimal    ][ framesByAnimal[ nextAnimal    ].frame0 ].colorBuffer;
        
        // Clear context and cache and we're ready to go rendering
        
		context.cache.clear();

        // Draw back and front animal to depth FBO
        // We draw back of volume to the left and the front
        // of the volume to the right

        context.enableDepthTest( true );
        context.setupCulling( { cullFace: GL.FRONT } );
        
        depthFBO.bind( { x: 0, width: depthFBO.width * 0.5 } );
        depthFBO.clear();

        depthShader.draw();

        depthFBO.setupViewport( { x: depthFBO.width * 0.5, width: depthFBO.width * 0.5 } );
        context.setupCulling( { cullFace: GL.BACK } );

        depthShader.draw();
        depthFBO.unbind( false );

        // Update particle simulation
        
        context.enableDepthTest( false );
        
        particlesFBO.bind();
        particleSimulationShader.uTime.set( 0.01 - Math.abs( mouseY ) * 0.0099 );
        particleSimulationShader.draw();
        particlesFBO.unbind();

        context.enableDepthTest( true );

        // Draw all particles (because we've got indices greater
        // than 65536 we split up the shader into multiple shaders
        // and thus need to loop through all of them to draw all
        // particles)
        
        postFBO.bind();
        postFBO.clear();
        
        for( var i = 0; i < particleRenderShaders.length; i++ )
            particleRenderShaders[ i ].draw();

        postFBO.unbind();
        postShader.draw();

        // debug purposes only
        //depthFBO.setupViewport( { x: 128, y: 128, width: 128, height: 128 } );
        //depthToScreenShader.draw();
        //depthFBO.setupViewport( { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight } );
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
