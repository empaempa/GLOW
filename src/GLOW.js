/*
* GLOW - Just-Above-Low-Level WebGL API
*/

var GLOW = (function() {
    "use strict"; "use restrict";

    var glow = {};
    var contexts = {};
    var uniqueIdCounter = -1;

    glow.currentContext = {};

    //--- register context ---
    glow.registerContext = function( context ) {
        contexts[ context.id ] = context;
        glow.enableContext( context );
    };

    //--- get context by id ---
    glow.getContextById = function( id ) {
        if( contexts[ id ] ) {
            return contexts[ id ];
        }
        console.error( "Couldn't find context id " + id + ", returning current with id " + glow.currentContext.id );
        return glow.currentContext;
    };

    //--- enable context ---
    glow.enableContext = function( contextOrId ) {
        if( typeof( contextOrId ) === 'string' ) {
            glow.currentContext = getContextById(contextOrId);
        } else {
            glow.currentContext = contextOrId;
        }
        GL = glow.GL = glow.currentContext.GL;
    };

    //--- unique id ---
    glow.uniqueId = function() {
        return ++uniqueIdCounter;
    };

    //--- return public ---
    return glow;
}());

/*
* Current GL - set to latest registered or enabled GL context 
*/
var GL = {};
