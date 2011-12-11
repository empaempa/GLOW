//# ParticleRenderVertex

const		float		PI = 3.14159265;

uniform     mat4    	uViewMatrix;
uniform     mat4    	uPerspectiveMatrix;
uniform		sampler2D	uParticlesFBO;

attribute	vec2	aParticleUVs;
attribute	vec2	aParticlePositions;
attribute	vec3	aParticleDirections;
attribute	vec3	aParticleNormals;

varying		vec3	vColor;

void main(void)
{
	// particle position
	
	vec4 particleData = texture2D( uParticlesFBO, aParticleUVs );
	vec3 particlePosition = vec3( particleData.x * 2000.0 - 1000.0, aParticlePositions.x, aParticlePositions.y );
	
	// particle rotation and size
	
	float cosRot = cos( -particleData.y );
	float sinRot = sin( -particleData.y );

	vec3 rotatedDirection;
	rotatedDirection.x = cosRot * aParticleDirections.x - sinRot * aParticleDirections.y;
	rotatedDirection.y = sinRot * aParticleDirections.x + cosRot * aParticleDirections.y;
	rotatedDirection.z = aParticleDirections.z;

	particlePosition += rotatedDirection * particleData.z;
	
	// particle normal rotation
	
	vec3 rotatedNormal;
	rotatedNormal.x = cosRot * aParticleNormals.x - sinRot * aParticleNormals.y;
	rotatedNormal.y = sinRot * aParticleNormals.x + cosRot * aParticleNormals.y;
	rotatedNormal.z = aParticleNormals.z;

	// light and color

	float light = ( dot( vec3( 0.0, 1.0, 0.0 ), rotatedNormal ) + 1.0 ) * 0.75 + 0.5;
	vColor      = mix( vec3( 0.9 ), vec3( 0.3 ), smoothstep( 10.0, 20.0, particleData.z )) * light * particleData.w;
	
	gl_Position = uPerspectiveMatrix * uViewMatrix * vec4( particlePosition, 1.0 );

}


//# ParticleRenderFragment

varying vec3 vColor;

void main( void ) {
    gl_FragColor = vec4( vColor, 1.0 );
}

