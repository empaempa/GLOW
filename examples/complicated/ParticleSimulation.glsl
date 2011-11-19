//# ParticleSimulationVertex

attribute	vec4	aSimulationDataXYUVs;
attribute	vec2	aSimulationPositions;

varying		vec2	vSimulationDataUV;
varying		vec2	vSimulationPositions;

void main(void) {
	vSimulationDataUV    = aSimulationDataXYUVs.zw;
	vSimulationPositions = aSimulationPositions;
	gl_Position = vec4( aSimulationDataXYUVs.x, aSimulationDataXYUVs.y, 1.0, 1.0 );
}

//# ParticleSimulationFragment

uniform     mat4    	uViewMatrix;
uniform     mat4    	uPerspectiveMatrix;
uniform		sampler2D	uDepthFBO;
uniform		sampler2D	uParticlesFBO;

varying		vec2	vSimulationDataUV;
varying		vec2	vSimulationPositions;

void main( void ) {
	
	vec4 particleData = texture2D( uParticlesFBO, vSimulationDataUV );
	vec4 particleSpace = vec4( particleData.x * 4000.0 - 2000.0, vSimulationPositions.x, vSimulationPositions.y, 1.0 );
	vec4 particleProjected = uPerspectiveMatrix * uViewMatrix * particleSpace;
	
	particleProjected.x  = particleProjected.x * 0.5 + 0.5;
	particleProjected.y  = particleProjected.y * 0.5 + 0.5;
	particleProjected.z /= particleProjected.w;

	float backDepth  = texture2D( uDepthFBO, vec2( particleProjected.x * 0.5,       particleProjected.y )).r;
	float frontDepth = texture2D( uDepthFBO, vec2( particleProjected.x * 0.5 + 0.5, particleProjected.y )).r;
	
	// update data
	
	particleData.x = mod( particleData.x + 0.01, 1.0 );
	if( backDepth > 0.0 ) particleData.y = 10.0;
	else                particleData.y = 5.0;

    gl_FragColor = vec4( particleData.x, particleData.x, particleData.x, 1.0 );
}

