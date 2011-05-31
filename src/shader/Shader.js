/*
* Shader.js
*/

GLOW.Shader = function( declaration ) {
	
	"use strict";
	
	this.id = GLOW.uniqueId();
	this.uniforms = {};
	this.attributes = {};
	this.elements;
	this.program;
	this.vertexShader;
	this.fragmentShader;
	this.declaration = declaration;

	if( declaration.vertexShader && declaration.fragmentShader ) {
		
		this.compileVertexShader();
		this.compileFragmentShader();
		this.linkProgram();
	
		delete declaration.vertexShader;
		delete declaration.fragmentShader;
		declaration.program = this.program;
	
	} else if( declaration.program ) {
		
		this.program = declaration.program;
		
	} else {
		
		console.error( "GLOW.Shader.construct: Missing vertex/fragment/program. Cannot create shader. Quitting." );
	}
	

	this.extractAndCreateUniforms();
	this.extractAndCreateAttributes();
	this.createElements();
	this.attachUniformAndAttributeData();
}

/*
* Prototype
*/

GLOW.Shader.prototype.compileVertexShader = function() {
	
	this.vertexShader = GL.createShader( GL.VERTEX_SHADER );
	GL.shaderSource ( this.vertexShader, this.declaration.vertexShader );
	GL.compileShader( this.vertexShader );

    if( !GL.getShaderParameter( this.vertexShader, GL.COMPILE_STATUS )) {
	
		console.error( "GLOW.Shader.compileVertexShader: " + GL.getShaderInfoLog( this.vertexShader ), true );
	}
}

GLOW.Shader.prototype.compileFragmentShader = function() {
	
	this.fragmentShader = GL.createShader( GL.FRAGMENT_SHADER );
	GL.shaderSource ( this.fragmentShader, this.declaration.fragmentShader );
	GL.compileShader( this.fragmentShader );

    if( !GL.getShaderParameter( this.fragmentShader, GL.COMPILE_STATUS )) {
	
		console.error( "GLOW.Shader.compileFragmentShader: " + GL.getShaderInfoLog( this.fragmentShader ), true );
	}
}

GLOW.Shader.prototype.linkProgram = function() {
	
    this.program = GL.createProgram();
	this.program.id = GLOW.uniqueId();

    GL.attachShader( this.program, this.vertexShader );
    GL.attachShader( this.program, this.fragmentShader );
    GL.linkProgram ( this.program );

    if( !GL.getProgramParameter( this.program, GL.LINK_STATUS )) {
	
		console.error( "GLOW.Shader.linkProgram: Could not initialise program", true );
    }
}

GLOW.Shader.prototype.extractAndCreateUniforms = function() {

	var uniformInformation, name, uniformLocation = -1, textureUnit = -1;
	var declaration = this.declaration, uniformLocations;
	var uniforms = this.uniforms;

	if( !declaration.uniformLocations ) {
		declaration.uniformLocations = [];
	}
	
	uniformLocations = declaration.uniformLocations;


	while( true ) {
		
		++uniformLocation;
		
		if( uniformLocations[ uniformLocation ] ) {
			uniformInformation = uniformLocations[ uniformLocation ];
		} else {
			uniformInformation = uniformLocations[ uniformLocation ] = GL.getActiveUniform( this.program, uniformLocation );
		}
		

		if( uniformInformation !== null && uniformInformation !== -1 && uniformInformation !== undefined ) {
			
			name = uniformInformation.name.split( "[" )[ 0 ]; 
			
			if( declaration[ name ] === undefined ) {
				
				console.warning( "GLOW.Shader.extractAndCreateUniforms: missing declaration for uniform " + name );

			} else if( declaration[ name ] instanceof GLOW.Uniform ) {

				uniforms[ name ] = declaration[ name ];

			} else {

				uniformInformation.location       = GL.getUniformLocation( this.program, name );
				uniformInformation.locationNumber = uniformLocation;
				uniformInformation.data           = declaration[ name ];
				
				if( uniformInformation.type === GL.SAMPLER_2D ) {
					uniformInformation.data.init( ++textureUnit );
				}
				
				declaration[ name ] = uniforms[ name ] = new GLOW.Uniform( uniformInformation );
			}

		} else break;
	}
}

GLOW.Shader.prototype.extractAndCreateAttributes = function() {
	
	var attributeInformation, name, attributeLocation = -1;
	var declaration = this.declaration, attributeLocations;
	var attributes = this.attributes;
	
	if( !declaration.attributeLocations ) {
		declaration.attributeLocations = [];
	}
	
	attributeLocations = declaration.attributeLocations;
	
	
	while( true ) {
		
		++attributeLocation;
		
		if( attributeLocations[ attributeLocation ] ) {
			attributeInformation = attributeLocations[ attributeLocation ];
		} else {
			attributeInformation = attributeLocations[ attributeLocation ] = GL.getActiveAttrib( this.program, attributeLocation );
		}

		
		if( attributeInformation !== null && attributeInformation !== undefined && attributeInformation !== -1 ) {
			
			name = attributeInformation.name;
			
			if( declaration[ name ] === undefined ) {
				
				console.warning( "GLOW.Shader.extractAndCreateAttributes: missing declaration for attribute " + name );
				
			} else if( declaration[ name ] instanceof GLOW.Attribute ) {
				
				attributes[ name ] = declaration[ name ];
				
			} else {
				
				attributeInformation.location       = GL.getAttribLocation( this.program, name );
				attributeInformation.locationNumber = attributeLocation;
				attributeInformation.data           = declaration[ name ];
				
				declaration[ name ] = attributes[ name ] = new GLOW.Attribute( attributeInformation, false );
			}
		} else break;
	}
	
	this.program.highestAttributeNumber = attributeLocation - 1;
}

GLOW.Shader.prototype.createElements = function() {
	
	if( !this.declaration.elements ) {

		for( var a in this.attributes ) { break; }
		this.declaration.elements = GLOW.Geometry.elements( attributes[ a ].bufferData.length / attributes[ a ].size * 3 );
	}
	
	
	if( this.declaration.elements instanceof WebGLBuffer ) {

		this.elements = this.declaration.elements;

	} else {

		if( !( this.declaration.elements instanceof Uint16Array )) {

			this.declaration.elements = new Uint16Array( this.declaration.elements );
		}
	
		this.elements = GL.createBuffer();
		this.elements.id = GLOW.uniqueId();
		this.elements.length = this.declaration.elements.length;

		GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
		GL.bufferData( GL.ELEMENT_ARRAY_BUFFER, this.declaration.elements, GL.STATIC_DRAW );
		
		this.declaration.elements = this.elements;
	}
		
}

GLOW.Shader.prototype.attachUniformAndAttributeData = function() {
	
	var u, a;
	
	for( u in this.uniforms ) {
		
		if( this[ u ] === undefined ) {
			this[ u ] = this.uniforms[ u ].data;
		} else {
			console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on uniform " + u + ", not attaching for easy access. Please use Shader.uniforms." + u + ".data to access data." );
		}
	}

	for( a in this.attributes ) {
		
		if( this[ a ] === undefined ) {
			this[ a ] = this.attributes[ a ].data;
		} else {
			console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " + a + ", not attaching for easy access. Please use Shader.attributes." + a + ".data to access data." );
		}
	}
}

GLOW.Shader.prototype.draw = function() {

	if( !GLOW.currentContext.cache.programCached( this.program )) {
		
		var diff = GLOW.currentContext.cache.setProgramHighestAttributeNumber( this.program );
		
		if( diff ) {
			
			// enable / disable attribute streams
			
			var highestAttrib = this.program.highestAttributeNumber;
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
		
		GL.useProgram( this.program );
	}
	
	for( var u in this.uniforms ) {
		
		this.uniforms[ u ].set();
	}
	
	for( var a in this.attributes ) {
		
		this.attributes[ a ].bind();
	}
	
	if( !GLOW.currentContext.cache.elementsCached( this.elements )) {

		GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.elements );
	}
	
	GL.drawElements( GL.TRIANGLES, this.elements.length, GL.UNSIGNED_SHORT, 0 );		
}


GLOW.Shader.prototype.dispose = function() {
	
	// TODO
}

