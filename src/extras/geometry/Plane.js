GLOW.Geometry.Plane = {
    vertices: function( size, facingUp ) {

        var a = new Float32Array( 4 * 3 );
        var i = 0;

        size = size !== undefined ? size * 0.5 : 1.0;

        if( facingUp ) {
            // top
            a[ i++ ] = -size; a[ i++ ] = 0; a[ i++ ] = -size;
            a[ i++ ] = -size; a[ i++ ] = 0; a[ i++ ] = +size;
            a[ i++ ] = +size; a[ i++ ] = 0; a[ i++ ] = +size;
            a[ i++ ] = +size; a[ i++ ] = 0; a[ i++ ] = -size;
        } else {
            // front
            a[ i++ ] = +size; a[ i++ ] = -size; a[ i++ ] = 0; 
            a[ i++ ] = +size; a[ i++ ] = +size; a[ i++ ] = 0; 
            a[ i++ ] = -size; a[ i++ ] = +size; a[ i++ ] = 0; 
            a[ i++ ] = -size; a[ i++ ] = -size; a[ i++ ] = 0; 
        }

        return a;
    },

    indices: function() {

        var a = new Uint16Array( 2 * 3 );
        var i = 0;

        a[ i++ ] = 0; a[ i++ ] = 1; a[ i++ ] = 2;
        a[ i++ ] = 0; a[ i++ ] = 2; a[ i++ ] = 3;

        return a;
    },

    indicesFlipped: function() {
        var a = new Uint16Array( 2 * 3 );
        var i = 0;

        a[ i++ ] = 0; a[ i++ ] = 2; a[ i++ ] = 1;
        a[ i++ ] = 0; a[ i++ ] = 3; a[ i++ ] = 2;

        return a;
    },

    uvs: function( facingUp ) {
        
        var a = new Float32Array( 4 * 2 );
        var i = 0;
        
        if( facingUp ) {
            a[ i++ ] = 0; a[ i++ ] = 0;
            a[ i++ ] = 0; a[ i++ ] = 1;
            a[ i++ ] = 1; a[ i++ ] = 1;
            a[ i++ ] = 1; a[ i++ ] = 0;

        } else {
            a[ i++ ] = 1; a[ i++ ] = 0;
            a[ i++ ] = 1; a[ i++ ] = 1;
            a[ i++ ] = 0; a[ i++ ] = 1;
            a[ i++ ] = 0; a[ i++ ] = 0;
        }
        
        return a;
    },
    
    primitives: function() {
        return GL.TRIANGLES;
    }
};

