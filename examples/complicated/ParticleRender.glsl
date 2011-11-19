//# ParticleRenderVertex
uniform     mat4    	uViewMatrix;
uniform     mat4    	uPerspectiveMatrix;
uniform		sampler2D	uParticlesFBO;

attribute	vec2	aParticleUVs;
attribute	vec2	aParticlePositions;
attribute	vec3	aParticleDirections;

void main(void)
{
	vec4 particleData = texture2D( uParticlesFBO, aParticleUVs );
	vec3 particlePosition = vec3( particleData.x * 4000.0 - 2000.0, aParticlePositions.x, aParticlePositions.y );
	
	vec3 rotatedDirection;
	float cosRot = cos( particleData.x );
	float sinRot = sin( particleData.x );
	rotatedDirection.x = ( cosRot * aParticleDirections.x - sinRot * aParticleDirections.y );
	rotatedDirection.y = ( sinRot * aParticleDirections.x + cosRot * aParticleDirections.y );
	rotatedDirection.z = aParticleDirections.z;

	particlePosition += rotatedDirection * 10.0;// * ( 10.0 + particleInfo.z * 30.0 );
	
	gl_Position = uPerspectiveMatrix * uViewMatrix * vec4( particlePosition, 1.0 );
}


//# ParticleRenderFragment

void main( void ) {
    gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}

