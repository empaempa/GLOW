GLOW.Compiler = (function() {
	
	"use strict";
	
	var compiler = {};
	var compiledCode = [];
	
	//--- compile ------------------------------------------
	// vertexShaderCode = string, the vertex shader code
	// fragmentShaderCode = string, the framgnet shader code
	// data = object, for example { transform: GLOW.Matrix4 }
	
	compiler.compile = function( vertexShaderCode, fragmentShaderCode, data, elements ) {
		
		var c, cl = compiledCode.length;
		var code;
		var program;
		
		for( c = 0; c < cl; c++ ) {
			
			code = compiledCode[ c ];
			
			if( vertexShaderCode   === code.vertexShaderCode &&
				fragmentShaderCode === code.fragmentShaderCode ) { break; }
		}

		if( c === cl ) {
			
			program = compiler.linkProgram( compiler.compileVertexShader  ( vertexShaderCode   ),
			                                compiler.compileFragmentShader( fragmentShaderCode ));

			compiledCode.push( { vertexShaderCode: vertexShaderCode, 
				                 fragmentShaderCode: fragmentShaderCode,
				                 program: program } );

		} else {
			
			program = code.program;
		}
		
		return new GLOW.CompiledData( program, 
			                          compiler.extractAndCreateUniforms  ( program, data ),
			                          compiler.extractAndCreateAttributes( program, data ),
			                          compiler.createElements            ( elements ));
	}


	//--- compile vertex shader ---

	compiler.compileVertexShader = function( vertexShaderCode ) {

		var vertexShader;

		vertexShader    = GL.createShader( GL.VERTEX_SHADER );
		vertexShader.id = GLOW.uniqueId();
		
		GL.shaderSource ( vertexShader, vertexShaderCode );
		GL.compileShader( vertexShader );

	    if( !GL.getShaderParameter( vertexShader, GL.COMPILE_STATUS )) {

			console.error( "GLOW.Compiler.compileVertexShader: " + GL.getShaderInfoLog( vertexShader ));
		}
		
		return vertexShader;
	}


	//--- compile fragment shader code ---

	compiler.compileFragmentShader = function( fragmentShaderCode ) {

		var fragmentShader;

		fragmentShader    = GL.createShader( GL.FRAGMENT_SHADER );
		fragmentShader.id = GLOW.uniqueId();
		
		GL.shaderSource ( fragmentShader, fragmentShaderCode );
		GL.compileShader( fragmentShader );

	    if( !GL.getShaderParameter( fragmentShader, GL.COMPILE_STATUS )) {

			console.error( "GLOW.Compiler.compileFragmentShader: " + GL.getShaderInfoLog( fragmentShader ));
		}
		
		return fragmentShader;
	}


	//--- link program ---

	compiler.linkProgram = function( vertexShader, fragmentShader ) {

		var program;

	    program    = GL.createProgram();
		program.id = GLOW.uniqueId();

	    GL.attachShader( program, vertexShader );
	    GL.attachShader( program, fragmentShader );
	    GL.linkProgram ( program );

	    if( !GL.getProgramParameter( program, GL.LINK_STATUS )) {

			console.error( "GLOW.Compiler.linkProgram: Could not initialise program" );
	    }
	
		return program;
	}
	
	
	//--- extract and create uniforms ---

	compiler.extractAndCreateUniforms = function( program, data ) {

		var uniforms = {};
		var information, name;
		var locationNumber = 0, textureUnit = 0;

		while( true ) {

			information = GL.getActiveUniform( program, locationNumber );

			if( information !== null && information !== -1 && information !== undefined ) {

				name = information.name.split( "[" )[ 0 ];

				if( data[ name ] === undefined ) {

					console.warn( "GLOW.Compiler.extractAndCreateUniforms: missing declaration for uniform " + name );

				} else if( data[ name ] instanceof GLOW.Uniform ) {

					uniforms[ name ] = data[ name ];

				} else {

					information.location       = GL.getUniformLocation( program, name );
					information.locationNumber = locationNumber;

					uniforms[ name ] = new GLOW.Uniform( information, data[ name ] );

					if( uniforms[ name ].type === GL.SAMPLER_2D ) {
						uniforms[ name ].data.init( textureUnit++ );
					}
				}

				locationNumber++;

			} else break;
		}
		
		return uniforms;
	}


	//--- extract and create attributes ---

	compiler.extractAndCreateAttributes = function( program, data ) {

		var information, name, locationNumber = 0;
		var attributes = {};

		while( true ) {

			information = GL.getActiveAttrib( program, locationNumber );

			if( information !== null && information !== -1 && information !== undefined ) {

				name = information.name;

				if( data[ name ] === undefined ) {

					console.warning( "GLOW.Compiler.extractAndCreateAttributes: missing declaration for attribute " + name );

				} else if( data[ name ] instanceof GLOW.Attribute ) {

					attributes[ name ] = data[ name ];

				} else {

					information.location       = GL.getAttribLocation( program, name );
					information.locationNumber = locationNumber;

					attributes[ name ] = new GLOW.Attribute( information, data[ name ] );
				}

				locationNumber++;

			} else break;
		}

		program.highestAttributeNumber = locationNumber - 1;
		return attributes;
	}
	
	
	//--- create elements ---
	
	compiler.createElements = function( data ) {

		var elements;

		if( !data ) {

			console.error( "GLOW.Compiler.createElements: missing 'elements' in supplied data. Quitting." );
			return;

		} else if( data instanceof WebGLBuffer ) {

			elements = data;

		} else {

			if( !( data instanceof Uint16Array )) {

				data = new Uint16Array( data );
			}

			elements = new GLOW.Elements( data );
		}

		return elements;
	}
	
	
	return compiler;
	
}());