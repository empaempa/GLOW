//# ParticleSimulationVertex

attribute	vec4	aSimulationDataXYUVs;
attribute	vec3	aSimulationPositions;

varying		vec2	vSimulationDataUV;
varying		vec3	vSimulationPositions;

void main(void) {
	vSimulationDataUV    = aSimulationDataXYUVs.zw;
	vSimulationPositions = aSimulationPositions;
	gl_Position = vec4( aSimulationDataXYUVs.x, aSimulationDataXYUVs.y, 1.0, 1.0 );
}

//# ParticleSimulationFragment

const		float		PI = 3.14159265;

uniform     mat4    	uViewMatrix;
uniform     mat4    	uPerspectiveMatrix;
uniform		sampler2D	uDepthFBO;
uniform		sampler2D	uParticlesFBO;

varying		vec2	vSimulationDataUV;
varying		vec3	vSimulationPositions;

void main( void ) {
	
	vec4 particleData = texture2D( uParticlesFBO, vSimulationDataUV );
	vec4 particlePosition = vec4( particleData.x * 3000.0 - 1500.0, vSimulationPositions.x, vSimulationPositions.y, 1.0 );
	vec4 particleProjected = uPerspectiveMatrix * uViewMatrix * particlePosition;
	vec2 particleUV = ( particleProjected.xy / particleProjected.w ) * 0.5 + 0.5;
	particleProjected.z = smoothstep( 0.0, 8000.0, particleProjected.z );
	
	vec2 backDepthLuminence  = texture2D( uDepthFBO, vec2( particleUV.x * 0.5,       particleUV.y )).xy; 
	vec2 frontDepthLuminence = texture2D( uDepthFBO, vec2( particleUV.x * 0.5 + 0.5, particleUV.y )).xy;
	
	// update data
	
	float oldTime = particleData.x;
	
	if( particleProjected.z > frontDepthLuminence.x && particleProjected.z < backDepthLuminence.x ) {
		particleData.y += 0.05;									// rotation
		particleData.z  = min( 35.0, particleData.z + 10.0 );	// size
	} else {
		particleData.y += 0.05;									// rotation
		particleData.z  = max( 10.0, particleData.z - 2.0 );	// size
	}

	particleData.x  = mod( particleData.x + 0.006, 1.0 );							// time
	particleData.z *= 1.0 - smoothstep( 1000.0, 1500.0, abs( particlePosition.x ));	// size in the ends
	particleData.w  = frontDepthLuminence.y;										// luminence
	
    gl_FragColor = particleData;
}
