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

	compileVertexShader();
	compileFragmentShader();
	linkProgram();
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
				
				if( declaration[ name ] !== undefined ) {
					
					uniformInformation.location = GL.getUniformLocation( program, name );
					uniformInformation.data     = declaration[ name ];
					

					if( uniformInformation.type === GL.SAMPLER_2D ) {
						
						uniformInformation.data.load( ++textureUnit );
					
					}
					

					uniforms[ name ] = GLOW.Uniform( uniformInformation );

				} else {

					console.error( "GLOW.Shader.extractAndCreateUniforms: missing declaration for uniform " + name );
					return;

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
				
				if( declaration[ name ] !== undefined ) {
					
					attributeInformation.location       = GL.getAttribLocation( program, name );
					attributeInformation.locationNumber = attributeLocation;
					attributeInformation.data           = declaration[ name ];
					
					attributes[ name ] = GLOW.Attribute( attributeInformation, false );
					
				} else {
					
					console.error( "GLOW.Shader.extractAndCreateAttributes: missing declaration for attribute " + name );
					return;
					
				}
				
			} else break;
		}
		
		program.numberOfAttributes = attributeLocation - 1;
	}
	
	
	//--- create elements ---
	
	function createElements() {
		
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
			
			// TODO: handle enable/disable vertex attrib location depending on program.numberOfAttributes
			
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