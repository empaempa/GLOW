/*
* GLOW - Just-Above-Low-Level WebGL API
*/

var GLOW = (function() {
    "use strict"; "use restrict";

    console.log( "Hello! My name is GLOW. Great to be around." );

    var glow = {};
    var contexts = {};
    var uniqueIdCounter = -1;

    glow.LOGS     = 1;
    glow.WARNINGS = 2;
    glow.ERRORS   = 4;
    glow.logging  = glow.ERRORS;// glow.LOGS | glow.WARNINGS | glow.ERRORS;
    glow.currentContext = {};

    glow.registerContext = function( context ) {
        contexts[ context.id ] = context;
        glow.enableContext( context );
    };

    glow.getContextById = function( id ) {
        if( contexts[ id ] ) {
            return contexts[ id ];
        }
        GLOW.error( "Couldn't find context id " + id + ", returning current with id " + glow.currentContext.id );
        return glow.currentContext;
    };

    glow.enableContext = function( contextOrId ) {
        if( typeof( contextOrId ) === 'string' ) {
            glow.currentContext = getContextById(contextOrId);
        } else {
            glow.currentContext = contextOrId;
        }
        GL = glow.GL = glow.currentContext.GL;
    };

    glow.uniqueId = function() {
        return ++uniqueIdCounter;
    };

    glow.log = function( message ) {
        if( glow.logging & glow.LOGS ) 
            console.log( message );
    }

    glow.warn = function( message ) {
        if( glow.logging & glow.WARNINGS ) 
            console.warn( message );
    }

    glow.error = function( message ) {
        if( glow.logging  & glow.ERRORS ) 
            console.error( message );
    }

    return glow;
}());

/*
* Current GL - set to latest registered or enabled GL context 
*/
var GL = {};
