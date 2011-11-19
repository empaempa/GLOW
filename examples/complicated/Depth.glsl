// The depth shader handles animation and morph, rendering the depth of
// each pixel into the red channel of a FLOAT texture.

//# DepthVertex

uniform     mat4    uViewMatrix;
uniform     mat4    uPerspectiveMatrix;
uniform		float	uFrameMorphA;
uniform		float	uFrameMorphB;
uniform		float	uAnimalMorph;
attribute   vec3    aVertexAnimalAFrame0;
attribute   vec3    aVertexAnimalAFrame1;
attribute   vec3    aVertexAnimalBFrame0;
attribute   vec3    aVertexAnimalBFrame1;


void main(void) {
	vec4 vertex = vec4( mix( mix( aVertexAnimalAFrame0, aVertexAnimalAFrame1, uFrameMorphA ), mix( aVertexAnimalBFrame0, aVertexAnimalBFrame1, uFrameMorphB ), uAnimalMorph ), 1.0 );
    gl_Position = uPerspectiveMatrix * uViewMatrix * vertex;
}


//# DepthFragment

void main(void) {
	float dist = smoothstep( 0.0, 6000.0, gl_FragCoord.z / gl_FragCoord.w );
	gl_FragColor = vec4( dist, dist, dist, 1.0 );
}

