GLOW.ThreeJS = (function(){
    
    "use strict"; "use restrict";
    
    // construct
    
    var threejs = {};
    
    
    // methods
    // init - set up uniform to handle THREE math
    
    threejs.init = function() {
        
        GLOW.Uniform.prototype.getNativeValue = function() {

            if( !this.data.GLOW ) {
                if( this.data instanceof THREE.Vector2 ) {
                    this.data.GLOW = new Float32Array( 2 );
                    this.getNativeValue = function() {
                        this.data.GLOW[ 0 ] = this.data.x;
                        this.data.GLOW[ 1 ] = this.data.y;
                        return this.data.GLOW;
                    }
                } else if( this.data instanceof THREE.Vector3 ) {
                    this.data.GLOW = new Float32Array( 3 );
                    this.getNativeValue = function() {
                        this.data.GLOW[ 0 ] = this.data.x;
                        this.data.GLOW[ 1 ] = this.data.y;
                        this.data.GLOW[ 2 ] = this.data.z;
                        return this.data.GLOW;
                    }
                } else if( this.data instanceof THREE.Vector4 ) {
                    this.data.GLOW = new Float32Array( 4 );
                    this.getNativeValue = function() {
                        this.data.GLOW[ 0 ] = this.data.x;
                        this.data.GLOW[ 1 ] = this.data.y;
                        this.data.GLOW[ 2 ] = this.data.z;
                        this.data.GLOW[ 3 ] = this.data.w;
                        return this.data.GLOW;
                    }
                } else if( this.data instanceof THREE.Color ) {
                    this.data.GLOW = new Float32Array( 3 );
                    this.getNativeValue = function() {
                        this.data.GLOW[ 0 ] = this.data.r;
                        this.data.GLOW[ 1 ] = this.data.g;
                        this.data.GLOW[ 2 ] = this.data.b;
                        return this.data.GLOW;
                    }
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
                    }
                } else if( this.data instanceof THREE.Matrix4 ) {
                    this.data.GLOW = new Float32Array( 16 );
                    this.getNativeValue = function() {
                        this.data.flattenToArray( this.data.GLOW );
                        return this.data.GLOW;
                    }
                }
                
                return this.getNativeValue();
            }
        }
    }

    return threejs;
})();