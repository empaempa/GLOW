/*
* Shader.js
* Parameters:
* use: GLOW.ShaderCompiledData
* except: object, holding data that should be overwritten in GLOW.ShaderCompiledData
* vertexShader: string, vertex shader code
* fragmentShader: string, fragment shader code
* data: attributes and uniforms
* elements: elements (array or UInt16Array)
*/

GLOW.Shader = function( parameters ) {
	
	"use strict";
	
	this.id = GLOW.uniqueId();

	if( parameters.use ) {
		this.compiledData = parameters.use.clone( parameters.except );
	} else {
		this.compiledData = GLOW.Compiler.compile( parameters.vertexShader, parameters.fragmentShader, parameters.data, parameters.elements );
	}
	
	this.attachData();
}

/*
* Prototype
*/


GLOW.Shader.prototype.attachData = function() {
	
	var u, a;
	
	for( u in this.compiledData.uniforms ) {
		
		if( this[ u ] === undefined ) {
			this[ u ] = this.compiledData.uniforms[ u ].data;
		} else {
			console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on uniform " + u + ", not attaching for easy access. Please use Shader.uniforms." + u + ".data to access data." );
		}
	}

	for( a in this.compiledData.attributes ) {
		
		if( this[ a ] === undefined ) {
			this[ a ] = this.compiledData.attributes[ a ].data;
		} else {
			console.warn( "GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " + a + ", not attaching for easy access. Please use Shader.attributes." + a + ".data to access data." );
		}
	}
}

GLOW.Shader.prototype.draw = function() {

	var compiledData = this.compiledData;

	if( !GLOW.currentContext.cache.programCached( compiledData.program )) {
		
		var diff = GLOW.currentContext.cache.setProgramHighestAttributeNumber( compiledData.program );
		
		if( diff ) {
			
			// enable / disable attribute streams
			
			var highestAttrib = compiledData.program.highestAttributeNumber;
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
		
		GL.useProgram( compiledData.program );
	}
	
	for( var u in compiledData.uniforms ) {
		compiledData.uniforms[ u ].set();
	}
	
	for( var a in compiledData.attributes ) {
		compiledData.attributes[ a ].bind();
	}
	
	compiledData.elements.draw();
}


GLOW.Shader.prototype.dispose = function() {
	
	// TODO
}

