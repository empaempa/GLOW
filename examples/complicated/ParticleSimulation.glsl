//# ParticleSimulationVertex

attribute	vec4	aSimulationDataXYUVs;
attribute	vec2	aSimulationPositions;

varying		vec2	vSimulationDataUV;
//varying		vec2	vSimulationPositions;

void main(void) {
	vSimulationDataUV    = aSimulationDataXYUVs.zw;
//	vSimulationPositions = aSimulationPositions;
	gl_Position = vec4( aSimulationDataXYUVs.x, aSimulationDataXYUVs.y, 1.0, 1.0 );
}

//# ParticleSimulationFragment

//uniform     mat4    	uViewMatrix;
//uniform     mat4    	uPerspectiveMatrix;
//uniform		sampler2D	uDepthFBO;
uniform		sampler2D	uParticlesFBO;

varying		vec2	vSimulationDataUV;
//varying		vec2	vSimulationPositions;

void main( void ) {
/*	vec4 particlePosition = vec4( mod( aParticlePositions.x + uTime * aParticleSpeeds, 4000.0 ) - 2000.0, aParticlePositions.y, aParticlePositions.z, 1.0 );
	
	vec4 particleUVZ = uPerspectiveMatrix * uViewMatrix * particlePosition;
	vParticleUVZ.x   = ( particleUVZ.x / 128.0 ) * 0.5 + 0.5;
	vParticleUVZ.y   = ( particleUVZ.y / 128.0 ) * 0.5 + 0.5;
	vParticleUVZ.z   = particleUVZ.z / particleUVZ.w;

	vUV = aSimulationPositions / 128.0;



	float backDepth  = texture2D( uDepthFBO, vec2( 0.25, 0.5 )).r;//       vParticleUVZ.x, vParticleUVZ.y )).a;
	float frontDepth = texture2D( uDepthFBO, vec2( 0.75, 0.5 )).r;//0.5 + vParticleUVZ.x, vParticleUVZ.y )).a;
	
	vec4 current = texture2D( uParticlesFBO, vUV );
	current.x   += 0.1;									// rotation
	current.y    = max( 0.0, current.y - 0.10 );		// color decay
	current.z    = max( 0.0, current.z * 0.25 );		// size decay
	
	if( backDepth > 0.0 ) { // vParticleUVZ.z > frontDepth && vParticleUVZ.z < backDepth ) {
		current.x += 0.1;
		current.y  = 1.0;
		current.z  = 1.0;
	}*/

//	vec4 particleData = texture2D( uDepthFBO, normalize( vSimulationPositions.xy ));
	vec4 current = texture2D( uParticlesFBO, vSimulationDataUV );
	current.x = mod( current.x + 0.01, 1.0 );

    gl_FragColor = vec4( current.x, current.x, current.x, 1.0 );
}

