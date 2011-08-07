GLOW.Load = (function() {
    
    "use strict"; "use restrict";
    
    // constructor
    var load = function( parameters ) {
        this.parameters = parameters;
        this.numItemsToLoad = 0;
        this.numItemsLeftToLoad = 0;
        for( var p in parameters ) {
            if( p !== "onLoadComplete" && p !== "onLoadItem" ) {
                this.numItemsToLoad++;
                this.numItemsLeftToLoad++;
            }
        }
        
        for( var p in parameters ) {
            if( p === "onLoadComplete" ) {
                this.onLoadComplete = parameters[ p ];
            } else if( p === "onLoadItem" ) {
                this.onLoadItem = parameters[ p ];
            } else {
                var originalURL  = parameters[ p ];
                var lowerCaseURL = parameters[ p ];
                if( lowerCaseURL.indexOf( ".png" ) !== -1 ||
                    lowerCaseURL.indexOf( ".gif" ) !== -1 ||
                    lowerCaseURL.indexOf( ".jpg" ) !== -1 ||
                    lowerCaseURL.indexOf( "jpeg" ) !== -1 ) {
                    parameters[ p ] = new Image();
                    parameters[ p ].scope = this;
                    parameters[ p ].onload = this.onLoadImage;
                    parameters[ p ].src = originalURL;
                } else if( lowerCaseURL.indexOf( ".glsl" ) !== -1 ) {
                    parameters[ p ] = new XMLHttpRequest();
                    parameters[ p ].scope = this;
                    parameters[ p ].parametersProperty = p;
                    parameters[ p ].open( "GET", originalURL );
                    parameters[ p ].onreadystatechange = this.onLoadGLSL;
                    parameters[ p ].send();
                } else if( lowerCaseURL.indexOf( ".js" ) !== -1 || lowerCaseURL.indexOf( ".json" ) !== -1 ) {
                               
                } else {
                    parameters[ p ] = document.createElement( "video" );
        	        parameters[ p ].scope = this;
            		parameters[ p ].addEventListener( "loadeddata", this.onLoadVideo, false );
            	    parameters[ p ].src = originalURL;
                }
            } 
        }
    }
    
    // methods
    load.prototype.handleLoadedItem = function() {
        this.numItemsLeftToLoad--;
        if( this.onLoadItem !== undefined ) {
            this.onLoadItem.call( null, 1 - this.numItemsLeftToLoad / this.numItemsToLoad );
        }
        if( this.numItemsLeftToLoad <= 0 ) {
            this.onLoadComplete.call( null, this.parameters );
        }
    };

    load.prototype.onLoadImage = function() {
        this.scope.handleLoadedItem();
    };

    load.prototype.onLoadVideo = function() {
        this.removeEventListener( "loadeddata", this.scope.onLoadVideo, false );
        this.scope.handleLoadedItem();
    };
    
    load.prototype.onLoadGLSL = function() {
        if( this.readyState == 4 ) {
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
        			buf += l;
        		}
        	}
        	fs = buf;
        
            this.scope.parameters[ this.parametersProperty ] = { fragmentShader: fs, vertexShader: vs };
            this.scope.handleLoadedItem();
        }
    };
    
    return load;
})();

