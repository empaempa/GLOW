GLOW.Texture = function( url ) {
	
	var texture = {}
	
	texture.id = GLOW.uniqueId();
	texture.image = new Image();
	texture.textureUnit = -1;
	texture.texture = undefined;

	//--- init ---

	function init( textureUnit ) {
		
		texture.textureUnit = textureUnit;
		texture.image.onload = onLoad;
		texture.image.src = url;
		
	}
	
	//--- onload ---
	
	function onLoad() {
		
		texture.texture = GL.createTexture();
		
		GL.bindTexture( GL.TEXTURE_2D, texture.texture );
		GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, texture.image );

		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT );
		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT );

		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR );
		GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR );

		GL.generateMipmap( GL.TEXTURE_2D );
		
	}
	
	
	//--- public ---
	
	texture.init = init;
	return texture;
}