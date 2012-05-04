/*
* GLOW - Just-Above-Low-Level WebGL API
*/

var GLOW = (function() {
    "use strict"; "use restrict";

    var glow = {};
    var contexts = {};
    var uniqueIdCounter = -1;
    var listeners = [];

    // internal listener object

    function Listener( flags, callback, context ) {
        this.flags    = flags;
        this.callback = callback;
        this.context  = context;
    }

    Listener.prototype.dispatch = function( flags, message ) {
        if( this.flags === flags ) {
            if( this.context ) {
                this.callback.call( this.context, message );
            } else {
                this.callback( message );
            }
        }
    }

    // log flags

    glow.LOGS     = 1;
    glow.WARNINGS = 2;
    glow.ERRORS   = 4;
    glow.logFlags = glow.ERRORS;// glow.LOGS | glow.WARNINGS | glow.ERRORS;
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
        if( glow.logFlags & glow.LOGS ) {
            console.log( message );
        }
        glow.dispatch( glow.LOGS, message );
    }

    glow.warn = function( message ) {
        if( glow.logFlags & glow.WARNINGS ) {
            console.warn( message );
        }
        glow.dispatch( glow.WARNINGS, message );
    }

    glow.error = function( message ) {
        if( glow.logFlags  & glow.ERRORS ){
            console.error( message );
        }
        glow.dispatch( glow.ERRORS, message );
    }

    glow.addEventListener = function( flags, callback, context ) {
        listeners.push( new Listener( flags, callback, context ));
        return listeners[ listeners.length - 1 ];
    }

    glow.removeEventListener = function( listener ) {
        var i = listeners.indexOf( listener );
        if( i !== -1 ) {
            listeners.splice( i, 1 );
            return;
        }
        glow.warn( "GLOW.removeEventListener: Couldn't find listener object" );
    }

    glow.dispatch = function( flags, message ) {
        var l = listeners.length;
        while( l-- ) {
            listeners[ l ].dispatch( flags, message );
        }
    }

    return glow;
}());

/*
* Current GL - set to latest registered or enabled GL context 
*/
var GL = {};
