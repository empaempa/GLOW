GLOW.Node = function() {
	
	var node = {};
	var localMatrix = GLOW.Matrix4();
	var globalMatrix = GLOW.Matrix4();
	var children = [];

	
	//--- update ---
	
	function update( parentGlobalMatrix ) {
		
		if( parentGlobalMatrix ) {

			globalMatrix.multiply( parentGlobalMatrix, localMatrix );

		} else {

			globalMatrix.copy( localMatrix );
		}
		

		var c, cl = children.length;

		for( c = 0; c < cl; c++ ) {
			children[ c ].update( globalMatrix );
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
	
	node.localMatrix = localMatrix;
	node.globalMatrix = globalMatrix;
	node.parent = undefined;
	node.children = children;
	node.update = update;
	node.addChild = addChild;
	node.removeChild = removeChild;
	
	return node;
}