/*
* Shader.js
*/

GLOW.Shader = function( parameters ) {
	
	var that = {};
	
	var uniforms 	= GLOW.Uniforms  ( paramaters.uniforms );
	var elements    = GLOW.Elements  ( parameters.elements );
	var attributes 	= GLOW.Attributes( parameters.attributes );
	var textures    = GLOW.Textures  ( parameters.textures );
	var program 	= GLOW.Program   ( parameters, uniforms, elements, attributes, textures );
	
	
	//--- draw ---
	
	that.draw = function() {
		
		uniforms.activate();
		attributes.activate();
		textures.activate();
		elements.draw();
		
	}


	//--- dispose ---
	
	that.dispose = function() {
		
		uniforms.dispose();
		attributes.dispose();
		textures.dispose();
		elements.dispose();
		
	}
	
	
	//--- return public ---
	
	return that;
	
}