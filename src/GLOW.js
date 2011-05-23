/*
* GLOW - WebGL Just Above Low Level
*/

GLOW = (function() {
	
	var that = {}; 
	var contexts = {};
	var currentContext;
	var uniqueIdCounter = -1;


	//--- Register Context ---

	that.registerContext = function( context ) {
		
		contexts[ context.id ] = context;
		that.enableContext( context );
		
	};
	
	
	//--- Get Context By Id ---
	
	that.getContextById = function( id ) {
		
		if( contexts[ id ] ) {
			
			return contexts[ id ];
			
		}
			
		console.error( "Couldn't find context id " + id + ", returning current with id " + currentContext.id );
		return currentContext;
		
	};


	//--- Enable Context ---

	that.enableContext = function( contextOrId ) {
		
		if( typeof( contextOrId ) === 'string' ) {
			
			currentContext = getContextById[ contextOrId ];
			
		} else {
			
			currentContext = contextOrId;
		
		}
		
		GL = that.GL = currentContext.GL;
	
	}


	//--- unique Id ---
	
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
