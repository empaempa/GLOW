GLOW.Geometry.Cylinder = {
    
    vertices: function( numSegs, topRad, botRad, height ) {

        numSegs = numSegs | 7;
        topRad  = topRad  | 1;
        botRad  = botRad  | 1;
        height  = height  | 1;

        var vertices = [];
        var s, PI2 = Math.PI * 2, halfHeight = height * 0.5;

        for( s = 0; s < numSegs; s++ ) {
            vertices.push( Math.sin( PI2 * s / numSegs ) * topRad );
            vertices.push( halfHeight );
            vertices.push( Math.cos( PI2 * s / numSegs ) * topRad );
        }

        for( s = 0; s < numSegs; s++ ) {
            vertices.push( Math.sin( PI2 * s / numSegs ) * botRad );
            vertices.push( -halfHeight );
            vertices.push( Math.cos( PI2 * s / numSegs ) * botRad );
        }

        vertices.push( 0 );
        vertices.push( halfHeight );
        vertices.push( 0 );

        vertices.push( 0 );
        vertices.push( -halfHeight );
        vertices.push( 0 );

        return vertices;
    },

    indices: function( numSegs ) {

        numSegs = numSegs | 7;
        var a, b, c, d, s, indices = [];

        for( s = 0; s < numSegs; s++ ) {
            a = s;
            b = s + numSegs;
            c = numSegs + ( s + 1 ) % numSegs;
            d = ( s + 1 ) % numSegs;

            indices.push( a );
            indices.push( b );
            indices.push( c );

            indices.push( a );
            indices.push( c );
            indices.push( d );
        }

        for( s = numSegs; s < numSegs + numSegs * 0.5; s++ ) {
            a = 2 * numSegs;
            b = ( 2 * s - 2 * numSegs + 0 ) % numSegs;
            c = ( 2 * s - 2 * numSegs + 1 ) % numSegs;
            d = ( 2 * s - 2 * numSegs + 2 ) % numSegs;

            indices.push( a );
            indices.push( b );
            indices.push( c );

            indices.push( a );
            indices.push( c );
            indices.push( d );
        }

        for( s = numSegs + numSegs * 0.5; s < 2 * numSegs; s ++ ) {
            a = 2 * numSegs + 1;
            b = ( 2 * s - 2 * numSegs + 2 ) % numSegs + numSegs;
            c = ( 2 * s - 2 * numSegs + 1 ) % numSegs + numSegs;
            d = ( 2 * s - 2 * numSegs + 0 ) % numSegs + numSegs;

            indices.push( a );
            indices.push( b );
            indices.push( c );

            indices.push( a );
            indices.push( c );
            indices.push( d );
        }

        return indices;
    },

    uvs: function() {
/*
        for ( var i = 0, il = this.faces.length; i < il; i ++ ) {

            var uvs = [], face = this.faces[ i ],
            a = this.vertices[ face.a ],
            b = this.vertices[ face.b ],
            c = this.vertices[ face.c ],
            d = this.vertices[ face.d ];

            uvs.push( new THREE.UV( 0.5 + Math.atan2( a.position.x, a.position.y ) / PI2, 0.5 + ( a.position.z / height ) ) );
            uvs.push( new THREE.UV( 0.5 + Math.atan2( b.position.x, b.position.y ) / PI2, 0.5 + ( b.position.z / height ) ) );
            uvs.push( new THREE.UV( 0.5 + Math.atan2( c.position.x, c.position.y ) / PI2, 0.5 + ( c.position.z / height ) ) );

            if ( face instanceof THREE.Face4 ) {

                uvs.push( new THREE.UV( 0.5 + ( Math.atan2( d.position.x, d.position.y ) / PI2 ), 0.5 + ( d.position.z / height ) ) );

            }

            this.faceVertexUvs[ 0 ].push( uvs );

        }
*/        
    },

    primitives: function() {
        return GL.TRIANGLES;
    },

    normals: function( numSegs ) {
        return GLOW.Geometry.faceNormals( GLOW.Geometry.Cylinder.vertices( numSegs ), GLOW.Geometry.Cylinder.indices( numSegs ));
    }
};


