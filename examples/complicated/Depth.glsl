// The depth shader handles animation and morph, rendering the depth of
// each pixel into the red channel of a FLOAT texture.

//# DepthVertex

uniform     mat4    uViewMatrix;
uniform     mat4    uPerspectiveMatrix;
uniform		float	uFrameMorphA;
uniform		float	uFrameMorphB;
uniform		float	uAnimalMorph;
uniform		float	uAnimalAScale;
uniform		float	uAnimalBScale;

attribute   vec3    aVertexAnimalAFrame0;
attribute   vec3    aVertexAnimalAFrame1;
attribute   vec3    aVertexAnimalBFrame0;
attribute   vec3    aVertexAnimalBFrame1;
attribute	vec3	aColorAnimalA;
attribute	vec3	aColorAnimalB;

varying		float	vDepth;
varying		float	vLuminence;

void main(void) {
	vec3 color  = mix( aColorAnimalA, aColorAnimalB, uAnimalMorph );
	vLuminence  = color.r * 0.3 + color.g * 0.59 + color.b * 0.11;
	
	vec3 vertex = mix( mix( aVertexAnimalAFrame0, aVertexAnimalAFrame1, uFrameMorphA ), mix( aVertexAnimalBFrame0, aVertexAnimalBFrame1, uFrameMorphB ), uAnimalMorph );
	vertex *= mix( uAnimalAScale, uAnimalBScale, uAnimalMorph );
	gl_Position = uPerspectiveMatrix * uViewMatrix * vec4( vertex, 1.0 );
	vDepth      = smoothstep( 0.0, 8000.0, gl_Position.z );
}


//# DepthFragment

varying		float	vLuminence;
varying		float	vDepth;

void main(void) {
	gl_FragColor = vec4( vDepth, vLuminence, 0.0, 1.0 );
}

