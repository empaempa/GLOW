GLOW.ThreeJS = (function(){
    
    "use strict"; "use restrict";
    
    // construct
    
    var threejs = {};
    
    
    // methods
    // init - set up uniform to handle THREE math
    
    threejs.init = function() {
        
        GLOW.Uniform.prototype.getNativeValue = function() {

            if( !this.data.GLOWNativeValue ) {
                if( this.data instanceof THREE.Vector2 ) {
                    this.data.GLOWNativeValue = new Float32Array( 2 );
                    this.getNativeValue = function() {
                        this.data.GLOWNativeValue[ 0 ] = this.data.x;
                        this.data.GLOWNativeValue[ 1 ] = this.data.y;
                        return this.data.GLOWNativeValue;
                    }
                } else if( this.data instanceof THREE.Vector3 ) {
                    this.data.GLOWNativeValue = new Float32Array( 3 );
                    this.getNativeValue = function() {
                        this.data.GLOWNativeValue[ 0 ] = this.data.x;
                        this.data.GLOWNativeValue[ 1 ] = this.data.y;
                        this.data.GLOWNativeValue[ 2 ] = this.data.z;
                        return this.data.GLOWNativeValue;
                    }
                } else if( this.data instanceof THREE.Vector4 ) {
                    this.data.GLOWNativeValue = new Float32Array( 4 );
                    this.getNativeValue = function() {
                        this.data.GLOWNativeValue[ 0 ] = this.data.x;
                        this.data.GLOWNativeValue[ 1 ] = this.data.y;
                        this.data.GLOWNativeValue[ 2 ] = this.data.z;
                        this.data.GLOWNativeValue[ 3 ] = this.data.w;
                        return this.data.GLOWNativeValue;
                    }
                } else if( this.data instanceof THREE.Color ) {
                    this.data.GLOWNativeValue = new Float32Array( 3 );
                    this.getNativeValue = function() {
                        this.data.GLOWNativeValue[ 0 ] = this.data.r;
                        this.data.GLOWNativeValue[ 1 ] = this.data.g;
                        this.data.GLOWNativeValue[ 2 ] = this.data.b;
                        return this.data.GLOWNativeValue;
                    }
                } else if( this.data instanceof THREE.Matrix3 ) {
                    console.warn( "GLOW.ThreeJS.Uniform.prototype.getNativeValue: bad support for Matrix3. Matrix3 is transposed!" );
                    this.data.GLOWNativeValue = new Flaot32Array( 9 );
                    this.getNativeValue = function() {
                        this.data.transposeIntoArray( this.data.GLOWNativeValue );
                        return this.data.GLOWNativeValue;
                    }
                } else if( this.data instanceof THREE.Matrix4 ) {
                    this.data.GLOWNativeValue = new Flaot32Array( 16 );
                    this.getNativeValue = function() {
                        this.data.flattenIntoArray( this.data.GLOWNativeValue );
                        return this.data.GLOWNativeValue;
                    }
                }
            }
        }
    }

    return threejs;
})();