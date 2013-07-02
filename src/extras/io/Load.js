GLOW.Load = (function() {
    
    "use strict"; "use restrict";
    
    var precision = "";

    // constructor
    function load( parameters ) {
        this.parameters         = parameters;
        this.onLoadComplete     = undefined;
        this.onLoadContext      = null;
        this.onLoadItem         = undefined;
        this.numItemsToLoad     = 0;
        this.numItemsLeftToLoad = 0;

        for( var p in parameters ) {
            if( p !== "onLoadComplete" && p !== "onLoadItem" && p!== "dontParseJS" && p !== "onLoadContext" ) {
                this.numItemsToLoad++;
            } else {
                this[ p ] = parameters[ p ];
                delete parameters[ p ];
            }
        }
        this.numItemsLeftToLoad = this.numItemsToLoad;
        
        for( var p in parameters ) {
            var originalURL  = parameters[ p ];
            var lowerCaseURL = parameters[ p ];
            if( lowerCaseURL.indexOf( ".png" ) !== -1 ||
                lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                lowerCaseURL.indexOf( ".jpg" ) !== -1 ||
                lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                parameters[ p ] = new Image();
                parameters[ p ].scope = this;
                parameters[ p ].onload = this.onLoadImage;
                parameters[ p ].onerror = this.onLoadError;
                parameters[ p ].onabort = this.onLoadError;
                parameters[ p ].src = originalURL;
            } else if( lowerCaseURL.indexOf( ".glsl" ) !== -1 ) {
                parameters[ p ] = new XMLHttpRequest();
                parameters[ p ].scope = this;
                parameters[ p ].parametersProperty = p;
                parameters[ p ].open( "GET", originalURL );
                parameters[ p ].onreadystatechange = this.onLoadGLSL;
                parameters[ p ].onerror = this.onLoadError;
                parameters[ p ].onabort = this.onLoadError;
                parameters[ p ].send();
            } else if( lowerCaseURL.indexOf( ".js" ) !== -1 || lowerCaseURL.indexOf( ".json" ) !== -1 ) {
                parameters[ p ] = new XMLHttpRequest();
                parameters[ p ].scope = this;
                parameters[ p ].parametersProperty = p;
                parameters[ p ].open( "GET", originalURL );
                parameters[ p ].onreadystatechange = this.onLoadJSON;
                parameters[ p ].onerror = this.onLoadError;
                parameters[ p ].onabort = this.onLoadError;
                parameters[ p ].send();
            } else {
                parameters[ p ] = document.createElement( "video" );
                parameters[ p ].scope = this;
                parameters[ p ].addEventListener( "loadeddata", this.onLoadVideo, false );
                parameters[ p ].src = originalURL;
            }
        }
    }
    
    // methods
    load.prototype.handleLoadedItem = function() {
        this.numItemsLeftToLoad--;
        if( this.onLoadItem !== undefined ) {
            this.onLoadItem.call( this.onLoadContext, 1 - this.numItemsLeftToLoad / this.numItemsToLoad );
        }
        if( this.numItemsLeftToLoad <= 0 ) {
            this.onLoadComplete.call( this.onLoadContext, this.parameters );
        }
    };

    load.prototype.onLoadJSON = function() {
        if( this.readyState === 4 ) {
   /*         var originalData;
            var data = {};
            
            // Three.js
            if( this.scope.dontParseJS !== true ) {
                if( this.responseText.indexOf( "var model = {" ) !== -1 ) {
                    var dataString = this.responseText.slice( this.responseText.indexOf( "var model = {" ) + 12,
                                                              this.responseText.indexOf( "};" ) + 1 );
                    originalData = JSON.parse( dataString );
                    data = this.scope.parseThreeJS( originalData );
                // J3D
                } else {
                    originalData = JSON.parse( this.responseText );

                    if( originalData.vertices && originalData.vertices.length > 0 ) data.vertices = new Float32Array( originalData.vertices );
                    if( originalData.normals && originalData.normals.length > 0 ) data.normals = new Float32Array( originalData.normals );
                    if( originalData.uv1 && originalData.uv1.length > 0 ) data.uv1 = new Float32Array( originalData.uv1 );
                    if( originalData.uv2 && originalData.uv2.length > 0 ) data.uv2 = new Float32Array( originalData.uv2 );
                    if( originalData.colors && originalData.colors.length > 0 ) data.colors = new Float32Array( originalData.colors );
                    if( originalData.tris && originalData.tris.length > 0 ) data.triangles = new Uint16Array( originalData.tris );
                }
            } else {
                data = JSON.parse( this.responseText );
            }*/

            this.scope.parameters[ this.parametersProperty ] = JSON.parse( this.responseText );
            this.scope.handleLoadedItem();
        }
    };

    load.prototype.onLoadImage = function() {
        this.scope.handleLoadedItem();
    };

    load.prototype.onLoadVideo = function() {
        this.removeEventListener( "loadeddata", this.scope.onLoadVideo, false );
        this.scope.handleLoadedItem();
    };
    
    /*
    * GLSL parser by Bartek Drozyz
    * Slightly modified to suit GLOW by Mikael Emtinger
    */
    
    load.prototype.onLoadGLSL = function() {
        if( this.readyState === 4 ) {
            // glsl parser by Bartek Drozyz
            var vs = "";
            var fs = "";
            var ls = this.responseText.split( "\n" );
            var buf = "";
            for( var i = 0; i < ls.length; i++ ) {
                if( ls[ i ].indexOf( "//#" ) > -1 ) {
                    if( ls[ i ].indexOf( "Fragment" ) > -1 ) {
                        vs = buf;
                        buf = "";
                    }
                } else {
                    var l = ls[ i ];
                    if( l.indexOf( "//" ) > -1 ) {
                        l = l.substring( 0, l.indexOf( "//" ));
                    }
                    if( l.indexOf( ";" ) === -1 ) {
                        l += "\n";
                    }
                    buf += l;
                }
            }
            fs = buf;

            if( precision === "" ) {
                if( typeof GL === "object" && typeof GL.getShaderPrecisionFormat === "function" ) {
                    var precisionInfo = GL.getShaderPrecisionFormat(GL.FRAGMENT_SHADER, GL.HIGH_FLOAT);
                    if( precisionInfo.rangeMax >= 62 && precisionInfo.rangeMin >= 62 && precisionInfo.precision >= 16 ) {
                        precision = "precision highp float;";
                    } else {
                        precision = "precision mediump float;";
                    }
                } else {
                    precision = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n#if GL_FRAGMENT_PRECISION_HIGH == 1\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n#else\nprecision mediump float;\n#endif";
                }
            }

            this.scope.parameters[ this.parametersProperty ] = { fragmentShader: precision + "\n" + fs, vertexShader: vs };
            this.scope.handleLoadedItem();
        }
    };
    
    load.prototype.onLoadError = function( event ) {
        GLOW.error( "GLOW.Load.onLoadError: Error " + event.target.status );
    };

    /*
     * Three.js file format parser by
     * @author mrdoob / http://mrdoob.com/
     * @author alteredq / http://alteredqualia.com/
     * Slightly modified to suit GLOW by Mikael Emtinger
     */
    
    load.prototype.parseThreeJS = function( json ) {
        var geometry = {};
        var scale = ( json.scale !== undefined ) ? 1.0 / json.scale : 1.0;

        parseModel( scale );
        parseSkin();
        parseMorphing( scale );
        parseEdges();

        function parseModel( scale ) {
            if( json.version === undefined || json.version != 2 ) {
                GLOW.error( 'Deprecated file format.' );
                return;
            }

            function isBitSet( value, position ) {
                return value & ( 1 << position );
            };

            var i, j, fi,
            offset, zLength, nVertices,
            colorIndex, normalIndex, uvIndex, materialIndex,
            type,
            isQuad,
            hasMaterial,
            hasFaceUv, hasFaceVertexUv,
            hasFaceNormal, hasFaceVertexNormal,
            hasFaceColor, hasFaceVertexColor,
            vertex, face, color, normal,
            uvLayer, uvs, u, v,
            faces = json.faces,
            vertices = json.vertices,
            normals = json.normals,
            colors = json.colors,
            nUvLayers = 0;

            // disregard empty arrays

            for( i = 0; i < json.uvs.length; i++ ) {
                if ( json.uvs[ i ].length ) nUvLayers ++;
            }

            for( i = 0; i < nUvLayers; i++ ) {
                geometry.faceUvs[ i ] = [];
                geometry.faceVertexUvs[ i ] = [];

            }

            offset = 0;
            zLength = vertices.length;

            while( offset < zLength ) {

                vertex = new THREE.Vertex();

                vertex.position.x = vertices[ offset ++ ] * scale;
                vertex.position.y = vertices[ offset ++ ] * scale;
                vertex.position.z = vertices[ offset ++ ] * scale;

                geometry.vertices.push( vertex );

            }

            offset = 0;
            zLength = faces.length;

            while ( offset < zLength ) {

                type = faces[ offset ++ ];


                isQuad              = isBitSet( type, 0 );
                hasMaterial         = isBitSet( type, 1 );
                hasFaceUv           = isBitSet( type, 2 );
                hasFaceVertexUv     = isBitSet( type, 3 );
                hasFaceNormal       = isBitSet( type, 4 );
                hasFaceVertexNormal = isBitSet( type, 5 );
                hasFaceColor        = isBitSet( type, 6 );
                hasFaceVertexColor  = isBitSet( type, 7 );

                //GLOW.log("type", type, "bits", isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);

                if ( isQuad ) {

                    face = new THREE.Face4();

                    face.a = faces[ offset ++ ];
                    face.b = faces[ offset ++ ];
                    face.c = faces[ offset ++ ];
                    face.d = faces[ offset ++ ];

                    nVertices = 4;

                } else {

                    face = new THREE.Face3();

                    face.a = faces[ offset ++ ];
                    face.b = faces[ offset ++ ];
                    face.c = faces[ offset ++ ];

                    nVertices = 3;

                }

                if ( hasMaterial ) {

                    materialIndex = faces[ offset ++ ];
                    face.materials = geometry.materials[ materialIndex ];

                }

                // to get face <=> uv index correspondence

                fi = geometry.faces.length;

                if ( hasFaceUv ) {

                    for ( i = 0; i < nUvLayers; i++ ) {

                        uvLayer = json.uvs[ i ];

                        uvIndex = faces[ offset ++ ];

                        u = uvLayer[ uvIndex * 2 ];
                        v = uvLayer[ uvIndex * 2 + 1 ];

                        geometry.faceUvs[ i ][ fi ] = new THREE.UV( u, v );

                    }

                }

                if ( hasFaceVertexUv ) {

                    for ( i = 0; i < nUvLayers; i++ ) {

                        uvLayer = json.uvs[ i ];

                        uvs = [];

                        for ( j = 0; j < nVertices; j ++ ) {

                            uvIndex = faces[ offset ++ ];

                            u = uvLayer[ uvIndex * 2 ];
                            v = uvLayer[ uvIndex * 2 + 1 ];

                            uvs[ j ] = new THREE.UV( u, v );

                        }

                        geometry.faceVertexUvs[ i ][ fi ] = uvs;

                    }

                }

                if ( hasFaceNormal ) {

                    normalIndex = faces[ offset ++ ] * 3;

                    normal = new THREE.Vector3();

                    normal.x = normals[ normalIndex ++ ];
                    normal.y = normals[ normalIndex ++ ];
                    normal.z = normals[ normalIndex ];

                    face.normal = normal;

                }

                if ( hasFaceVertexNormal ) {

                    for ( i = 0; i < nVertices; i++ ) {

                        normalIndex = faces[ offset ++ ] * 3;

                        normal = new THREE.Vector3();

                        normal.x = normals[ normalIndex ++ ];
                        normal.y = normals[ normalIndex ++ ];
                        normal.z = normals[ normalIndex ];

                        face.vertexNormals.push( normal );

                    }

                }


                if ( hasFaceColor ) {

                    colorIndex = faces[ offset ++ ];

                    color = new THREE.Color( colors[ colorIndex ] );
                    face.color = color;

                }


                if ( hasFaceVertexColor ) {

                    for ( i = 0; i < nVertices; i++ ) {

                        colorIndex = faces[ offset ++ ];

                        color = new THREE.Color( colors[ colorIndex ] );
                        face.vertexColors.push( color );

                    }

                }

                geometry.faces.push( face );

            }

        };

        function parseSkin() {

            var i, l, x, y, z, w, a, b, c, d;

            if ( json.skinWeights ) {

                for ( i = 0, l = json.skinWeights.length; i < l; i += 2 ) {

                    x = json.skinWeights[ i     ];
                    y = json.skinWeights[ i + 1 ];
                    z = 0;
                    w = 0;

                    geometry.skinWeights.push( new THREE.Vector4( x, y, z, w ) );

                }

            }

            if ( json.skinIndices ) {

                for ( i = 0, l = json.skinIndices.length; i < l; i += 2 ) {

                    a = json.skinIndices[ i     ];
                    b = json.skinIndices[ i + 1 ];
                    c = 0;
                    d = 0;

                    geometry.skinIndices.push( new THREE.Vector4( a, b, c, d ) );

                }

            }

            geometry.bones = json.bones;
            geometry.animation = json.animation;

        };

        function parseMorphing( scale ) {

            if ( json.morphTargets !== undefined ) {

                var i, l, v, vl, x, y, z, dstVertices, srcVertices;

                for ( i = 0, l = json.morphTargets.length; i < l; i++ ) {

                    geometry.morphTargets[ i ] = {};
                    geometry.morphTargets[ i ].name = json.morphTargets[ i ].name;
                    geometry.morphTargets[ i ].vertices = [];

                    dstVertices = geometry.morphTargets[ i ].vertices;
                    srcVertices = json.morphTargets [ i ].vertices;

                    for( v = 0, vl = srcVertices.length; v < vl; v += 3 ) {

                        x = srcVertices[ v ] * scale;
                        y = srcVertices[ v + 1 ] * scale;
                        z = srcVertices[ v + 2 ] * scale;

                        dstVertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

                    }

                } 

            }

            if ( json.morphColors !== undefined ) {

                var i, l, c, cl, dstColors, srcColors, color;

                for ( i = 0, l = json.morphColors.length; i < l; i++ ) {

                    geometry.morphColors[ i ] = {};
                    geometry.morphColors[ i ].name = json.morphColors[ i ].name;
                    geometry.morphColors[ i ].colors = [];

                    dstColors = geometry.morphColors[ i ].colors;
                    srcColors = json.morphColors [ i ].colors;

                    for ( c = 0, cl = srcColors.length; c < cl; c += 3 ) {

                        color = new THREE.Color( 0xffaa00 );
                        color.setRGB( srcColors[ c ], srcColors[ c + 1 ], srcColors[ c + 2 ] );
                        dstColors.push( color );

                    }

                } 

            }

        };

        function parseEdges() {

            if( json.edges !== undefined ) {

                var i, il, v1, v2;

                for ( i = 0; i < json.edges.length; i+= 2 ) {

                    v1 = json.edges[ i ];
                    v2 = json.edges[ i + 1 ];

                    geometry.edges.push( new THREE.Edge( geometry.vertices[ v1 ], geometry.vertices[ v2 ], v1, v2 ) );

                }

            }

        };
    }
    
    
    return load;
})();

