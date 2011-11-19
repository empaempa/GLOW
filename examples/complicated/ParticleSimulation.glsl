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
	vec4 particlePosition = vec4( particleData.x * 2000.0 - 1000.0, vSimulationPositions.x, vSimulationPositions.y, 1.0 );
	vec4 particleProjected = uPerspectiveMatrix * uViewMatrix * particlePosition;
	vec2 particleUV = ( particleProjected.xy / particleProjected.w ) * 0.5 + 0.5;
	//particleProjected.z /= particleProjected.w;
	
	float backDepth  = texture2D( uDepthFBO, vec2( particleUV.x * 0.5,       particleUV.y )).r;// vec2( particleUV.x * 0.5,       particleUV.y )).r;
	float frontDepth = texture2D( uDepthFBO, vec2( particleUV.x * 0.5 + 0.5, particleUV.y )).r;//vec2( particleUV.x * 0.5 + 0.5, particleUV.y )).r;
	
	// update data
	
	particleData.x  = mod( particleData.x - 0.001, 1.0 );
	particleData.y += 0.1;
	
	if( particleProjected.z > frontDepth && particleProjected.z < backDepth ) particleData.z = 20.0;
	else                   particleData.z = max( 5.0, particleData.z - 1.0 );

	particleData.w = 1.0;
    gl_FragColor = particleData;
}

