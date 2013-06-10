// GLOWThreeCompatibility.js r1.1 - http://github.com/empaempa/GLOW
GLOW.ThreeJS = (function() {
    
    "use strict"; "use restrict";

    // methods
    // init - set up uniform to handle THREE math
    return { 
        init: function() {
            if( THREE === undefined ) {
                GLOW.error( "GLOW.ThreeJS.init: THREE is not loaded. Quitting." );
                return;
            }

            GLOW.Uniform.prototype.getNativeValue = function() {
                if( !this.data.GLOW ) {
                    if( this.data instanceof THREE.Vector2 ) {
                        this.data.GLOW = new Float32Array( 2 );
                        this.getNativeValue = function() {
                            this.data.GLOW[ 0 ] = this.data.x;
                            this.data.GLOW[ 1 ] = this.data.y;
                            return this.data.GLOW;
                        };
                    } else if( this.data instanceof THREE.Vector3 ) {
                        this.data.GLOW = new Float32Array( 3 );
                        this.getNativeValue = function() {
                            this.data.GLOW[ 0 ] = this.data.x;
                            this.data.GLOW[ 1 ] = this.data.y;
                            this.data.GLOW[ 2 ] = this.data.z;
                            return this.data.GLOW;
                        };
                    } else if( this.data instanceof THREE.Vector4 ) {
                        this.data.GLOW = new Float32Array( 4 );
                        this.getNativeValue = function() {
                            this.data.GLOW[ 0 ] = this.data.x;
                            this.data.GLOW[ 1 ] = this.data.y;
                            this.data.GLOW[ 2 ] = this.data.z;
                            this.data.GLOW[ 3 ] = this.data.w;
                            return this.data.GLOW;
                        };
                    } else if( this.data instanceof THREE.Color ) {
                        this.data.GLOW = new Float32Array( 3 );
                        this.getNativeValue = function() {
                            this.data.GLOW[ 0 ] = this.data.r;
                            this.data.GLOW[ 1 ] = this.data.g;
                            this.data.GLOW[ 2 ] = this.data.b;
                            return this.data.GLOW;
                        };
                    } else if( this.data instanceof THREE.Matrix3 ) {
                        this.data.GLOW = new Float32Array( 9 );
                        this.getNativeValue = function() {
                            this.data.GLOW[ 0 ] = this.data.n11; 
                            this.data.GLOW[ 1 ] = this.data.n21; 
                            this.data.GLOW[ 2 ] = this.data.n31;
                            this.data.GLOW[ 3 ] = this.data.n12; 
                            this.data.GLOW[ 4 ] = this.data.n22; 
                            this.data.GLOW[ 5 ] = this.data.n32; 
                            this.data.GLOW[ 6 ] = this.data.n13; 
                            this.data.GLOW[ 7 ] = this.data.n23; 
                            this.data.GLOW[ 8 ] = this.data.n33;
                            return this.data.GLOW;
                        };
                    } else if( this.data instanceof THREE.Matrix4 ) {
                        this.data.GLOW = new Float32Array( 16 );
                        this.getNativeValue = function() {
                            this.data.flattenToArray( this.data.GLOW );
                            return this.data.GLOW;
                        };
                    }
                        return this.getNativeValue();
                }
            };
        },

        // parse geometry
        parseGeometry: function( geometry ) {
            
            if( geometry.GLOW ) return geometry.GLOW;
            
            var elements = [];
            var vertices = [];
            var normals = [];
            var uvs = [];
            var colors = [];
            var edges = [];
            var e, el = geometry.faces.length, ei = 0;
            var i, il, iLetters = [ "a", "b", "c", "d" ];
            var element, vertex, uv, color, normal;

            for( e = 0; e < el; e++ ) {
                // elements
                element = geometry.faces[ e ];
                if( element instanceof THREE.Face3 ) {
                    elements.push( ei++ );
                    elements.push( ei++ );
                    elements.push( ei++ );
                    il = 3;
                } else {
                    elements.push( ei + 0 );
                    elements.push( ei + 1 );
                    elements.push( ei + 2 );
                    elements.push( ei + 0 );
                    elements.push( ei + 2 );
                    elements.push( ei + 3 );
                    ei += 4;
                    il = 4;
                }

                // vertices
                for( i = 0; i < il; i++ ) {
                    vertex = geometry.vertices[ element[ iLetters[ i ]]].position;
                    vertices.push( vertex.x );
                    vertices.push( vertex.y );
                    vertices.push( vertex.z );
                }

                // colors
                if( element.vertexColors && element.vertexColors.length ) {
                    for( i = 0; i < il; i++ ) {
                        color = element.vertexColors[ i ];
                        colors.push( color.r );
                        colors.push( color.g );
                        colors.push( color.b );
                    }
                } else if( element.color ) {
                    color = element.color;
                    for( i = 0; i < il; i++ ) {
                        color = element.vertexColors[ i ];
                        colors.push( color.r );
                        colors.push( color.g );
                        colors.push( color.b );
                    }
                }

                // normals
                if( element.vertexNormals && element.vertexNormals.length ) {
                    for( i = 0; i < il; i++ ) {
                        normal = element.vertexNormal[ i ];
                        normals.push( normal.x );
                        normals.push( normal.y );
                        normals.push( normal.z );
                    }
                } else if( element.normal ) {
                    normal = element.normal;
                    for( i = 0; i < il; i++ ) {
                        normals.push( normal.x );
                        normals.push( normal.y );
                        normals.push( normal.z );
                    }
                }
            }

            geometry.GLOW = {
                elements: new Float32Array( elements ),
                vertices: new Float32Array( vertices ),
                colors: new Float32Array( colors ),
                normals: new Float32Array( normals )
            };
            
            return geometry.GLOW;
        }
    };
})();

GLOW.ThreeJS.Mesh = (function() {
    
    
    if( THREE ) {
        "use strict"; "use restrict";
     
        // constructor
        function mesh( geometry, parameters ) {
        
            THREE.Object3D.call( this );
            
            // parse geometry
            this.geometry = geometry;
            GLOW.ThreeJS.parseGeometry( this.geometry );
            
            if( parameters ) {
                parameters.elements = this.geometry.GLOW.elements;
                for( var d in parameters.data ) {
                    if( parameters.data[ d ] === "vertices" ) {
                        parameters.data[ d ] = this.geometry.GLOW.vertices;
                    } else if( parameters.data[ d ] === "colors" ) {
                        parameters.data[ d ] = this.geometry.GLOW.colors;
                    } else if( parameters.data[ d ] === "normals" ) {
                        parameters.data[ d ] = this.geometry.GLOW.normals;
                    } else if( parameters.data[ d ] === "matrix" ) {
                        parameters.data[ d ] = this.matrix;
                    } else if( parameters.data[ d ] === "matrixWorld" ) {
                        parameters.data[ d ] = this.matrixWorld;
                    } else if( parameters.data[ d ] === "matrixRotationWorld" ) {
                        parameters.data[ d ] = this.matrixRotationWorld;
                    } else if( parameters.data[ d ] === "position" ) {
                        parameters.data[ d ] = this.position;
                    } else if( parameters.data[ d ] === "rotation" ) {
                        parameters.data[ d ] = this.rotation;
                    } else if( parameters.data[ d ] === "scale" ) {
                        parameters.data[ d ] = this.scale;
                    }
                }

                this.shader = new GLOW.Shader( parameters );
            }
        }

        // inherit
        mesh.prototype = new THREE.Object3D();
        mesh.prototype.constructor = mesh;

        // methods
        mesh.prototype.draw = function() {
            this.shader.draw();
        };

        mesh.prototype.clone = function( except ) {

            // create material-less mesh
            var clone = new GLOW.ThreeJS.Mesh( this.geometry );

            // match exceptions
            for( var e in except ) {
                if( except[ e ] === "matrix" ) {
                    except[ e ] = clone.matrix;
                } else if( except[ e ] === "matrixWorld" ) {
                    except[ e ] = clone.matrixWorld;
                } else if( except[ e ] === "matrixRotationWorld" ) {
                    except[ e ] = clone.matrixRotationWorld;
                } else if( except[ e ] === "position" ) {
                    except[ e ] = clone.position;
                } else if( except[ e ] === "rotation" ) {
                    except[ e ] = clone.rotation;
                } else if( except[ e ] === "scale" ) {
                    except[ e ] = clone.scale;
                }
            }

            // create shader
            clone.shader = this.shader.clone( except );
            
            // create and return
            return clone;
        };

        return mesh;
    } 
    
    return function() { GLOW.error( "GLOW.ThreeJS.Mesh.construct: THREE not loaded"); };
})();
