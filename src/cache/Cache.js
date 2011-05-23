GLOW.Cache = (function() {
	
	var that = {};
	
	//--- clear ---
	
	that.clear = function() {
		
		that.Program.clear();
		that.Uniforms.clear();
		that.Attriubtes.clear();
		that.Elements.clear();
		that.Textures.clear();
		
	}
	
	return that;
	
}());