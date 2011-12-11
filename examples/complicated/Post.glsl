//# PostVertex

attribute	vec3	aVertices;
attribute	vec2	aUVs;

varying		vec2	vUV;

void main(void)
{
	vUV = aUVs;
	gl_Position = vec4( aVertices, 1.0 );
}


//# ParticleRenderFragment
/*
uniform	sampler2D	uFBO;

varying	vec2		vUV;

void main( void ) {
    gl_FragColor = texture2D( uFBO, vUV );
}
*/

uniform sampler2D uFBO;
varying vec2 vUV;

void main() {
	float vig = max( 0.0, length( vUV * 2.0 - 1.0 ) * 0.25 - 0.15 );
	gl_FragColor = vec4( texture2D( uFBO, vUV ).rgb - vig, 1.0 );
}
