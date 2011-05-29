GLOW.Node = function( shader ) {
	
	var node = {};
	var localMatrix = GLOW.Matrix4();
	var globalMatrix = GLOW.Matrix4();
	var viewMatrix = GLOW.Matrix4();
	var children = [];
	var position = { x: 0, y: 0, z: 0 };
	var rotation = { x: 0, y: 0, z: 0 };
	var scale    = { x: 0, y: 0, z: 0 };
	

	//--- update ---
	
	function update( parentGlobalMatrix, cameraInverseMatrix ) {
		
		if( node.useXYZStyleTransform ) {
			
			localMatrix.setPosition( position.x, position.y, position.z );
			localMatrix.setRotation( rotation.x, rotation.y, rotation.z );
			localMatrix.scale( scale.x, scale.y, scale.z );
		}
		
		if( parentGlobalMatrix ) {

			globalMatrix.multiply( parentGlobalMatrix, localMatrix );

		} else {

			globalMatrix.copy( localMatrix );
		}
		
		
		if( cameraInverseMatrix ) {
			
			viewMatrix.multiply( cameraInverseMatrix, globalMatrix );
		}
		

		var c, cl = children.length;

		for( c = 0; c < cl; c++ ) {
			
			children[ c ].update( globalMatrix, cameraInverseMatrix );
		}
		
		return node;
	}
	
	
	//--- add child ---

	function addChild( child ) {
		
		if( children.indexOf( child ) === -1 ) {
			
			children.push( child );
			
			if( child.parent ) {
				
				child.parent.removeChild( child );
			}
			
			child.parent = node;
		}
		
		return node;
	}
	
	
	//--- remove child ---
	
	function removeChild( child ) {
		
		var index = children.indexOf( child );
		
		if( index !== -1 ) {
			
			children.splice( 1, index );
			child.parent = undefined;
		}
		
		return node;
	}
	
	
	//--- public ---
	
	if( shader ) {
		
		node.shader = shader;
		node.draw = shader.draw;
	}
	
	node.localMatrix = localMatrix;
	node.globalMatrix = globalMatrix;

	node.useXYZStyleTransforms = true;
	node.position = position;
	node.rotation = rotation;
	node.scale = scale;

	node.update = update;
	
	node.parent = undefined;
	node.children = children;
	node.addChild = addChild;
	node.removeChild = removeChild;
	
	return node;
}