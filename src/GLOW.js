/*
* GLOW - Just-Above-Low-Level WebGL API
*/

GLOW = (function() {
	
	var that = {}; 
	var contexts = {};
	var currentContext;
	var uniqueIdCounter = -1;


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
			
		console.error( "Couldn't find context id " + id + ", returning current with id " + currentContext.id );
		return currentContext;
		
	};


	//--- enable context ---

	that.enableContext = function( contextOrId ) {
		
		if( typeof( contextOrId ) === 'string' ) {
			
			currentContext = getContextById[ contextOrId ];
			
		} else {
			
			currentContext = contextOrId;
		
		}
		
		GL = that.GL = currentContext.GL;
	
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

GL = {};
