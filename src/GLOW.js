/*
* GLOW - Just-Above-Low-Level WebGL API
*/

var GLOW = (function() {
	
	var that = {}; 
	var contexts = {};
	var uniqueIdCounter = -1;

	that.currentContext = {};


	//--- register context ---

	that.registerContext = function( context ) {
		
		contexts[ context.id ] = context;
		that.enableContext( context );
	};
	
	
	//--- get context by id ---
	
	that.getContextById = function( id ) {
		
		if( contexts[ id ] ) {
			
			return contexts[ id ];
		}
			
		console.error( "Couldn't find context id " + id + ", returning current with id " + that.currentContext.id );
		return that.currentContext;
	};


	//--- enable context ---

	that.enableContext = function( contextOrId ) {
		
		if( typeof( contextOrId ) === 'string' ) {
			
			that.currentContext = getContextById[ contextOrId ];
			
		} else {
			
			that.currentContext = contextOrId;
		}
		
		GL = that.GL = that.currentContext.GL;
	
	}


	//--- unique id ---
	
	that.uniqueId = function() {
		
		return ++uniqueIdCounter;
	}


	//--- return public ---

	return that;
	
}());



/*
* Current GL - set to latest registered or enabled GL context 
*/

var GL = {};
