//# DepthToScreenVertex
attribute 	vec3 	aVertices;
attribute  	vec2	aUVs;
varying 	vec2	vUV;

void main(void)
{
	vUV = aUVs;
	gl_Position = vec4( aVertices.x, aVertices.y, 1.0, 1.0 );
}


//# DepthToScreenFragment

uniform		sampler2D	uFBO;
varying		vec2		vUV;

void main(void) {
//    gl_FragColor = vec4( smoothstep( 0.0, 5000.0, texture2D( uFBO, vUV ).a ) * 0.8 + 0.2, 0.0, 0.0, 1.0 );
    gl_FragColor = texture2D( uFBO, vUV ).rrra;
}