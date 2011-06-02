/*
* GLOW.Compiler
* @author: Mikael Emtinger, gomo.se
* Compiles vertex- and fragementshader, uniforms, attributes and elements into a GLOW.CompiledData
*/

GLOW.Compiler = (function() {
	
	"use strict";
	
	var compiler = {};
	var compiledCode = [];
	
	//--- compile ------------------------------------------
	// vertexShaderCode = string, the vertex shader code
	// fragmentShaderCode = string, the framgnet shader code
	// uniformsAndAttributes = object, for example { transform: GLOW.Matrix4 }
	// elements = array or UInt16Array with elements
	
	compiler.compile = function( vertexShaderCode, fragmentShaderCode, uniformAndAttributeData, elements ) {
		
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
			                          compiler.createUniforms  ( compiler.extractUniforms  ( program ), uniformAndAttributeData ),
			                          compiler.createAttributes( compiler.extractAttributes( program ), uniformAndAttributeData ),
			                          compiler.createElements  ( elements ));
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
	
	
	//--- extract uniforms ---

	compiler.extractUniforms = function( program ) {

		var uniforms = {};
		var uniform;
		var locationNumber = 0;

		while( true ) {

			uniform = GL.getActiveUniform( program, locationNumber );

			if( uniform !== null && uniform !== -1 && uniform !== undefined ) {

				uniform.name           = uniform.name.split( "[" )[ 0 ];
				uniform.location       = GL.getUniformLocation( program, uniform.name );
				uniform.locationNumber = locationNumber;
			
				uniforms[ uniform.name ] = uniform;
			
			} else break;

			locationNumber++;
		}

		return uniforms;
	}


	//--- extract attributes ---
	
	compiler.extractAttributes = function( program ) {

		var attribute, locationNumber = 0;
		var attributes = {};

		while( true ) {

			attribute = GL.getActiveAttrib( program, locationNumber );

			if( attribute !== null && attribute !== -1 && attribute !== undefined ) {

				attribute.location       = GL.getAttribLocation( program, attribute.name );
				attribute.locationNumber = locationNumber;
				
				attributes[ attribute.name ] = attribute;

			} else break;

			locationNumber++;
		}

		program.highestAttributeNumber = locationNumber - 1;
		return attributes;
	}
	

	//--- create uniforms ---

	compiler.createUniforms = function( uniformInformation, data ) {

		var u;
		var uniforms = {};
		var uniform, name;
		var textureUnit = 0;

		for( u in uniformInformation ) {
			
			uniform = uniformInformation[ u ];
			name    = uniform.name;
			
			if( data[ name ] === undefined ) {

				console.warn( "GLOW.Compiler.createUniforms: missing declaration for uniform " + name );

			} else if( data[ name ] instanceof GLOW.Uniform ) {

				uniforms[ name ] = data[ name ];

			} else {

				uniforms[ name ] = new GLOW.Uniform( uniform, data[ name ] );

				if( uniforms[ name ].type === GL.SAMPLER_2D ) {
					uniforms[ name ].data.init( textureUnit++ );
				}
			}
		}
		
		return uniforms;
	}


	//--- create attributes ---

	compiler.createAttributes = function( attributeInformation, data ) {

		var a;
		var attribute, name;
		var attributes = {};

		for( a in attributeInformation ) {

			attribute = attributeInformation[ a ];
			name      = attribute.name;
			
			if( data[ name ] === undefined ) {

				console.warning( "GLOW.Compiler.createAttributes: missing declaration for attribute " + name );

			} else if( data[ name ] instanceof GLOW.Attribute ) {

				attributes[ name ] = data[ name ];

			} else {

				attributes[ name ] = new GLOW.Attribute( attribute, data[ name ] );
			}
		}

		return attributes;
	}
	
	
	//--- create elements ---
	
	compiler.createElements = function( data ) {

		var elements;

		if( !data ) {

			console.error( "GLOW.Compiler.createElements: missing 'elements' in supplied data. Quitting." );
			return;

		} else if( data instanceof GLOW.Elements ) {

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