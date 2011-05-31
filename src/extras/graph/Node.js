GLOW.Node = function( shader ) {
	
	"use strict";
	
	this.localMatrix  = new GLOW.Matrix4();
	this.globalMatrix = new GLOW.Matrix4();
	this.viewMatrix   = new GLOW.Matrix4();
	
	this.useXYZStyleTransform = false;
	this.position = { x: 0, y: 0, z: 0 };
	this.rotation = { x: 0, y: 0, z: 0 };
	this.scale    = { x: 1, y: 1, z: 1 };

	this.children = [];
	this.parent   = undefined;
	
	if( shader ) {
		
		this.shader = shader;
		this.draw = shader.draw;
	}
}

/* 
* Prototype
*/ 

GLOW.Node.prototype.update = function( parentGlobalMatrix, cameraInverseMatrix ) {
	
	if( this.useXYZStyleTransform ) {
		
		this.localMatrix.setPosition( this.position.x, this.position.y, this.position.z );
		this.localMatrix.setRotation( this.rotation.x, this.rotation.y, this.rotation.z );
		this.localMatrix.scale( this.scale.x, this.scale.y, this.scale.z );
	}
	
	if( parentGlobalMatrix ) {

		this.globalMatrix.multiply( parentGlobalMatrix, this.localMatrix );

	} else {

		this.globalMatrix.copy( this.localMatrix );
	}
	
	
	if( cameraInverseMatrix ) {
		
		this.viewMatrix.multiply( cameraInverseMatrix, this.globalMatrix );
	}
	

	var c, cl = this.children.length;

	for( c = 0; c < cl; c++ ) {
		
		this.children[ c ].update( this.globalMatrix, cameraInverseMatrix );
	}
	
	return this;
}

GLOW.Node.prototype.addChild = function( child ) {
	
	if( this.children.indexOf( child ) === -1 ) {
		
		this.children.push( child );
		
		if( child.parent ) {
			
			child.parent.removeChild( child );
		}
		
		child.parent = this;
	}
	
	return this;
}


GLOW.Node.prototype.removeChild = function( child ) {
	
	var index = this.children.indexOf( child );
	
	if( index !== -1 ) {
		
		this.children.splice( 1, index );
		child.parent = undefined;
	}
	
	return this;
}
