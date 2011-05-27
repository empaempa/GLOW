/*
* Shader.js
*/

GLOW.Shader = function( _declaration ) {
	
	var shader = {};
	var uniforms = {};
	var attributes = {};
	var elements;
	var program;
	var vertexShader;
	var fragmentShader;
	var declaration = _declaration;

	shader.id = GLOW.uniqueId();

	if( declaration.vertexShader && declaration.fragmentShader ) {
		
		compileVertexShader();
		compileFragmentShader();
		linkProgram();
	
		delete declaration.vertexShader;
		delete declaration.fragmentShader;
		declaration.program = program;
	
	} else if( declaration.program ) {
		
		program = declaration.program;
		
	} else {
		
		console.error( "GLOW.Shader.construct: Missing vertex/fragment/program. Cannot create shader. Quitting." );
	}
	

	extractAndCreateUniforms();
	extractAndCreateAttributes();
	createElements();


	//--- compile vertex shader ---
	
	function compileVertexShader() {
		
		vertexShader = GL.createShader( GL.VERTEX_SHADER );
		GL.shaderSource ( vertexShader, declaration.vertexShader );
		GL.compileShader( vertexShader );

	    if( !GL.getShaderParameter( vertexShader, GL.COMPILE_STATUS )) {
		
			console.error( "GLOW.Shader.compileVertexShader: " + GL.getShaderInfoLog( vertexShader ), true );
		}
	}
	
	
	//--- compile fragment shader ---
	
	function compileFragmentShader() {
		
		fragmentShader = GL.createShader( GL.FRAGMENT_SHADER );
		GL.shaderSource ( fragmentShader, declaration.fragmentShader );
		GL.compileShader( fragmentShader );

	    if( !GL.getShaderParameter( fragmentShader, GL.COMPILE_STATUS )) {
		
			console.error( "GLOW.Shader.compileFragmentShader: " + GL.getShaderInfoLog( fragmentShader ), true );
		}
	}

	
	//--- link program ---
	
	function linkProgram() {
		
	    program = GL.createProgram();
		program.id = GLOW.uniqueId();
	
	    GL.attachShader( program, vertexShader );
	    GL.attachShader( program, fragmentShader );
	    GL.linkProgram ( program );

	    if( !GL.getProgramParameter( program, GL.LINK_STATUS )) {
		
			console.error( "GLOW.Shader.linkProgram: Could not initialise program", true );
	    }
	}
	
	
	//--- extract and create uniforms ---
	
	function extractAndCreateUniforms() {
	
		var uniformInformation, name, uniformLocation = -1, textureUnit = -1;
	
		while( true ) {
			
			uniformInformation = GL.getActiveUniform( program, ++uniformLocation );

			if( uniformInformation !== null && uniformInformation !== -1 && uniformInformation !== undefined ) {
				
				name = uniformInformation.name.split( "[" )[ 0 ]; 
				
				// duck-type checking if declaration is GLOW.Uniform or not
				
				if( declaration[ name ] === undefined ) {
					
					console.error( "GLOW.Shader.extractAndCreateUniforms: missing declaration for uniform " + name );
					return;

				} else if( declaration[ name ].isUniform ) {

					uniforms[ name ] = declaration[ name ];

				} else {

					uniformInformation.location       = GL.getUniformLocation( program, name );
					uniformInformation.locationNumber = uniformLocation;
					uniformInformation.data           = declaration[ name ];
					
					if( uniformInformation.type === GL.SAMPLER_2D ) {
						uniformInformation.data.load( ++textureUnit );
					}
					
					declaration[ name ] = uniforms[ name ] = GLOW.Uniform( uniformInformation );
				}

			} else break;
		}
	}
	
	
	//--- extract and create attributes ---
	
	function extractAndCreateAttributes() {
		
		var attributeInformation, name, attributeLocation = -1;
		
		while( true ) {
			
			attributeInformation = GL.getActiveAttrib( program, ++attributeLocation );
			
			if( attributeInformation !== null && attributeInformation !== undefined && attributeInformation !== -1 ) {
				
				name = attributeInformation.name;
				
				if( declaration[ name ] === undefined ) {
					
					console.error( "GLOW.Shader.extractAndCreateAttributes: missing declaration for attribute " + name );
					return;
					
				} else if( declaration[ name ].isAttribute ) {
					
					attributes[ name ] = declaration[ name ];
					
				} else {
					
					attributeInformation.location       = GL.getAttribLocation( program, name );
					attributeInformation.locationNumber = attributeLocation;
					attributeInformation.data           = declaration[ name ];
					
					declaration[ name ] = attributes[ name ] = GLOW.Attribute( attributeInformation, false );
				}
				
			} else break;
		}
		
		program.highestAttributeNumber = attributeLocation - 1;
	}
	
	
	//--- create elements ---
	
	function createElements() {
		
		// duck-type checking if element already been initialized 
		
		if( declaration.elements.id === undefined ) {

			if( !declaration.elements ) {

				for( var a in attributes ) { break;	}
				declaration.elements = GLOW.Helpers.arrayElements( attributes[ a ].bufferData.length / ( attributes[ a ].size * 3 ));
			}

			if( !( declaration.elements instanceof Uint16Array )) {

				declaration.elements = new Uint16Array( declaration.elements );
			}
		
			elements = GL.createBuffer();
			elements.id = GLOW.uniqueId();
			elements.length = declaration.elements.length;

			GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, elements );
			GL.bufferData( GL.ELEMENT_ARRAY_BUFFER, declaration.elements, GL.STATIC_DRAW );
			
			declaration.elements = elements;
			
		} else {
			
			elements = declaration.elements;
		}
	}
	
	
	//--- attach uniform and attribute data ---
	
	function attachUniformAndAttributeData() {
		
		var u, a;
		
		for( u in uniforms ) {
			
			if( shader[ u ] === undefined ) {
				
				shader[ u ] = uniforms[ u ].data;
			
			} else {
		
				console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on uniform " + u + ", not attaching for easy access. Please use Shader.uniforms." + u + ".data to access data." );
			}
		}
	
	
		for( a in attributes ) {
			
			if( shader[ a ] === undefined ) {
			
				shader[ a ] = attributes[ a ].data;
			
			} else {
			
				console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " + a + ", not attaching for easy access. Please use Shader.attributes." + a + ".data to access data." );
			}
		}
	}

	
	//--- draw ---
	
	function draw() {

		if( !GLOW.Cache.programCached( program )) {
			
			var diff = GLOW.Cache.setProgramHighestAttributeNumber( program );
			
			if( diff ) {
				
				// enable / disable attribute streams
				
				var highestAttrib = program.highestAttributeNumber;
				var current = highestAttrib - diff + 1;
				
				if( diff > 0 ) {
					
					for( ; current <= highestAttrib; current++ ) {
						GL.enableVertexAttribArray( current );
					}

				} else {
					
					for( ; current >= highestAttrib; current-- ) {
						GL.disableVertexAttribArray( current ); 
					}
				}
			}
			
			
			GL.useProgram( program );
		}
		
		for( var u in uniforms ) {
			
			uniforms[ u ].set();
		}
		
		for( var a in attributes ) {
			
			attributes[ a ].bind();
		}
		
		if( !GLOW.Cache.elementsCached( elements )) {

			GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, elements );
		}
		
		GL.drawElements( GL.TRIANGLES, elements.length, GL.UNSIGNED_SHORT, 0 );		
	}


	//--- dispose ---
	
	function dispose() {
		
	}
	
	
	//--- public and attach data ---
	
	shader.draw = draw;
	shader.dispose = dispose;
	shader.program = program;
	shader.uniforms = uniforms;
	shader.attributes = attributes;

	attachUniformAndAttributeData();
	
	return shader;
}