//# ParticleRenderVertex
uniform     mat4    	uViewMatrix;
uniform     mat4    	uPerspectiveMatrix;
uniform		sampler2D	uParticlesFBO;

attribute	vec2	aParticleUVs;
attribute	vec2	aParticlePositions;
attribute	vec3	aParticleDirections;

varying float green;

void main(void)
{
	vec4 particleData = texture2D( uParticlesFBO, aParticleUVs );
	vec3 particlePosition = vec3( particleData.x * 2000.0 - 1000.0, aParticlePositions.x, aParticlePositions.y );
	
	float cosRot = cos( -particleData.y );
	float sinRot = sin( -particleData.y );

	vec3 rotatedDirection;
	rotatedDirection.x = ( cosRot * aParticleDirections.x - sinRot * aParticleDirections.y );
	rotatedDirection.y = ( sinRot * aParticleDirections.x + cosRot * aParticleDirections.y );
	rotatedDirection.z = aParticleDirections.z;

	particlePosition += rotatedDirection * particleData.z;//10.0;// * ( 10.0 + particleInfo.z * 30.0 );
	
	if( particleData.z == 5.0 ) green = 1.0;
	else                        green = 0.0;
	
	gl_Position = uPerspectiveMatrix * uViewMatrix * vec4( particlePosition, 1.0 );
}


//# ParticleRenderFragment

varying float green;

void main( void ) {
    gl_FragColor = vec4( 1.0, green, 0.0, 1.0 );
}

