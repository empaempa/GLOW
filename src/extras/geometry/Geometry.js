GLOW.Geometry = {
	
	randomVector3Array: function( amount, factor ) {
		factor = factor !== undefined ? factor : 1;
		
		var a, array = [];
		var doubleFactor = factor * 2;
		for( a = 0; a < amount; a++ ) {
			array.push( GLOW.Vector3( Math.random() * doubleFactor - factor, 
									  Math.random() * doubleFactor - factor, 
									  Math.random() * doubleFactor - factor ));
		}
		return array;
	},
	
	randomArray: function( length, base, factor, repeat ) {
	    var array = [];
	    var value = 0;
	    var r, l;
	    for( l = 0; l < length / repeat; l++ ) {
	        value = base + Math.random() * factor;
	        for( r = 0; r < repeat; r++ ) {
	            array.push( value );
	        }
	    }
	    return array;
	},
	
	triangles: function( amount ) {
	    return this.elements( amount );
	},
	
	elements: function( amount ) {
		var i = 0, a, array = new Uint16Array( amount * 3 );
		for( a = 0; a < amount; a++ ) {
			array[ i ] = i++;
			array[ i ] = i++;
			array[ i ] = i++;
		}
		return array;
	},
	
	faceNormals: function( vertices, elements ) {
		var normals = new Array( vertices.length );
		var e, el = elements.length;
		var a, b, c;
		var av = new GLOW.Vector3();
		var bv = new GLOW.Vector3();
		var cv = new GLOW.Vector3();
		var nv = new GLOW.Vector3();
		for( e = 0; e < el; ) {
			
			a = elements[ e++ ] * 3;
			b = elements[ e++ ] * 3;
			c = elements[ e++ ] * 3;
			
			av.set( vertices[ a + 0 ], vertices[ a + 1 ], vertices[ a + 2 ] );
			bv.set( vertices[ b + 0 ], vertices[ b + 1 ], vertices[ b + 2 ] );
			cv.set( vertices[ c + 0 ], vertices[ c + 1 ], vertices[ c + 2 ] );
			
			bv.subSelf( av );
			cv.subSelf( av );
			
			nv.cross( bv, cv ).normalize();
			
			normals[ a + 0 ] = nv.value[ 0 ]; normals[ a + 1 ] = nv.value[ 1 ]; normals[ a + 2 ] = nv.value[ 2 ];
			normals[ b + 0 ] = nv.value[ 0 ]; normals[ b + 1 ] = nv.value[ 1 ]; normals[ b + 2 ] = nv.value[ 2 ];
			normals[ c + 0 ] = nv.value[ 0 ]; normals[ c + 1 ] = nv.value[ 1 ]; normals[ c + 2 ] = nv.value[ 2 ];
		}

		return normals;
	},
	
	/*
	* Flatshade a shader config object
	* shaderConfig:
	*   .triangles: vertex shaded triangles
	*   .data.xyz: attribute arrays
	* attributeSizes:
	*   .xyz: size of attribute (2 for vec2, 3 for vec3 etc.)
	*
	* Please note that attribute data need to be 
	* untyped array (ordinary Arrray, not Float32Array for example)
	*/
	
	flatShade: function( shaderConfig, attributeSizes ) {
	    
	    if( shaderConfig.triangles === undefined || 
	        shaderConfig.data      === undefined ) {
	        console.error( "GLOW.Geometry.flatShade: missing .data and/or .triangles in shader config object. Quitting." );
	        return;
	    }
	    
	    if( attributeSizes === undefined ) {
	        console.error( "GLOW.Geometry.flatShade: missing attribute data sizes. Quitting." );
	        return;
	    }
	    
	    var triangles = shaderConfig.triangles;
	    var numTriangles =  triangles.length / 3;
	    var vertexShadedData = shaderConfig.data;
	    var flatShadedTriangles = [];
	    var flatShadedData, vertexShadedAttribute, size;
	    var d, i, il, n, nl;
	    
	    for( d in attributeSizes ) {
	        if( vertexShadedData[ d ] ) {
    	        vertexShadedAttribute = vertexShadedData[ d ];
    	        flatShadedAttribute   = [];
    	        size                  = attributeSizes[ d ];

                for( i = 0, il = numTriangles * 3; i < il; i++ ) {
                    for( n = 0, nl = size; n < nl; n++ ) {
                        flatShadedAttribute.push( vertexShadedAttribute[ triangles[ i ] * size + n ] );
                    }
                }

        	    vertexShadedAttribute.length = 0;
        	    for( i = 0, il = flatShadedAttribute.length; i < il; i++ ) 
        	        vertexShadedAttribute[ i ] = flatShadedAttribute[ i ];
	        }
	    }
	    
	    for( i = 0, il = numTriangles, n = 0; i < il; i++ ) {
	        flatShadedTriangles[ n ] = n++;
	        flatShadedTriangles[ n ] = n++;
	        flatShadedTriangles[ n ] = n++;
	    }
	    
	    shaderConfig.triangles = flatShadedTriangles;
	}
}

