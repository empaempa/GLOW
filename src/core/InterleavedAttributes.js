GLOW.InterleavedAttributes = (function() {
    "use strict"; "use restrict";

    // constructor
    function GLOWInterleavedAttributes( attributes ) {
        this.id = GLOW.uniqueId();
        this.attributes = attributes;
        
        // interleave data from the attributes
        var l, ll = attributes[ 0 ].data.length / attributes[ 0 ].size;
        var a, al = attributes.length;
        var b, bl;
        var i, indices = [];
        var attributeData, interleavedData = [];
        
        for( a = 0; a < al; a++ ) {
            indices[ a ] = 0;
        }
        
        for( l = 0; l < ll; l++ ) {
            for( a = 0; a < al; a++ ) {
                attributeData = attributes[ a ].data;
                i = indices[ a ];
                for( b = 0, bl = attributes[ a ].size; b < bl; b++ ) {
                    interleavedData.push( attributeData[ i++ ] );
                }
                indices[ a ] = i;
            }
        }
        this.data = new Float32Array( interleavedData );

        // match usage from the attributes
        this.usage = attributes[ 0 ].usage;
        for( a = 0; a < al; a++ ) {
            if( this.usage !== attributes[ a ].usage ) {
                GLOW.warn( "GLOW.InterleavedAttributes.construct: Attribute " + attributes[ a ].name + " has different usage, defaulting to STATIC_DRAW." );
                this.usage = GL.STATIC_DRAW;
                break;
            }
        }
 
        this.bufferData( this.data, this.usage );
        
        
        // setup stride and offset for each attribute
        var stride = 0;
        for( a = 0; a < al; a++ ) {
            stride += attributes[ a ].size * 4;
        }
        
        var currentOffset = 0;
        for( a = 0; a < al; a++ ) {
            attributes[ a ].setupInterleave( currentOffset, stride );
            currentOffset += attributes[ a ].size * 4;
        }
    }
    
    // methods
    GLOWInterleavedAttributes.prototype.bufferData = function( data, usage ) {
        if( data !== undefined && this.data !== data ) this.data = data;
        if( this.buffer === undefined ) this.buffer = GL.createBuffer();

        GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
        GL.bufferData( GL.ARRAY_BUFFER, this.data, usage ? usage : GL.STATIC_DRAW );
    };

    GLOWInterleavedAttributes.prototype.bind = function() {
        GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
        
        var a = this.attributes.length;
        while( a-- ) {
            this.attributes[ a ].bind();
        }
    };

    GLOWInterleavedAttributes.prototype.dispose = function() {
        if( this.buffer ) {
            GL.deleteBuffer( this.buffer );
            delete this.buffer;
        }
        delete this.data;

        if( this.attributes ) {
            var a = this.attributes.length;
            while( a-- ) {
                this.attributes[ a ].dispose();
            }
            delete this.attributes;
        }
    };
    
    
    return GLOWInterleavedAttributes;
})();
