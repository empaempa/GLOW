//# ParticleSimulationVertex

attribute	vec2	aSimulationDataXYs;
attribute	vec2	aSimulationPositions;

varying		vec2	vSimulationPositions;

void main(void) {
	vSimulationPositions = aSimulationPositions;
	gl_Position = vec4( aSimulationDataXYs.x, aSimulationDataXYs.y, 1.0, 1.0 );
}

//# ParticleSimulationFragment

const		float		PI = 3.14159265;

uniform     mat4    	uViewMatrix;
uniform     mat4    	uPerspectiveMatrix;
uniform		vec2		uViewportSize;
uniform		sampler2D	uDepthFBO;
uniform		sampler2D	uParticlesFBO;
uniform		float		uTime;

varying		vec2	vSimulationDataUV;
varying		vec2	vSimulationPositions;

void main( void ) {
	
	// get data and calculate particle space, projected and UV position
	
	vec4 particleData = texture2D( uParticlesFBO, gl_FragCoord.xy / uViewportSize );
	vec4 particlePosition = vec4( particleData.x * 2000.0 - 1000.0, vSimulationPositions.x, vSimulationPositions.y, 1.0 );
	vec4 particleProjected = uPerspectiveMatrix * uViewMatrix * particlePosition;
	vec2 particleUV = ( particleProjected.xy / particleProjected.w ) * 0.5 + 0.5;
	particleUV = clamp( particleUV, vec2( 0.0, 0.0), vec2( 1.0, 1.0 ));
	particleProjected.z = smoothstep( 0.0, 8000.0, particleProjected.z );
	
	// sample volume back and front depth and luminence
	
	vec2 backDepthLuminence  = texture2D( uDepthFBO, vec2( particleUV.x * 0.5,       particleUV.y )).xy; 
	vec2 frontDepthLuminence = texture2D( uDepthFBO, vec2( particleUV.x * 0.5 + 0.5, particleUV.y )).xy;
	
	// update data dependent on inside or outside volume
	
	float oldTime = particleData.x;
	
	if( particleProjected.z > frontDepthLuminence.x && particleProjected.z < backDepthLuminence.x ) {
		particleData.y += 0.03;									// rotation
		particleData.z  = min( 48.0, particleData.z + 20.0 );	// size
	} else {
		particleData.y += 0.05;									// rotation
		particleData.z  = max( 6.0, particleData.z - 2.0 );		// size
	}

	particleData.x  = mod( particleData.x + uTime, 1.0 );								// time
	particleData.z *= 1.0 - smoothstep( 950.0, 1100.0, length( particlePosition.xyz ));	// size in the ends
	particleData.w += ( frontDepthLuminence.y - particleData.w ) / 5.0;					// luminence
	
    gl_FragColor = particleData;
}
