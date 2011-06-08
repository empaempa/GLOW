// GLOWCore.js r1 - http://github.com/empaempa/GLOW
var GLOW=function(){var b={},a={},d=-1;b.currentContext={};b.registerContext=function(c){a[c.id]=c;b.enableContext(c)};b.getContextById=function(c){if(a[c])return a[c];console.error("Couldn't find context id "+c+", returning current with id "+b.currentContext.id);return b.currentContext};b.enableContext=function(a){b.currentContext=typeof a==="string"?getContextById(a):a;GL=b.GL=b.currentContext.GL};b.uniqueId=function(){return++d};return b}(),GL={};
GLOW.Context=function(){function b(a){a===void 0&&(a={});this.id=a.id!==void 0?a.id:GLOW.uniqueId();this.alpha=a.alpha!==void 0?a.alpha:!0;this.depth=a.depth!==void 0?a.depth:!0;this.antialias=a.antialias!==void 0?a.antialias:!0;this.stencil=a.stencil!==void 0?a.stencil:!1;this.premultipliedAlpha=a.premultipliedAlpha!==void 0?a.premultipliedAlpha:!0;this.preserveDrawingBuffer=a.preserveDrawingBuffer!==void 0?a.preserveDrawingBuffer:!1;this.width=a.width!==void 0?a.width:window.innerWidth;this.height=
a.height!==void 0?parmaeters.height:window.innerHeight;this.cache=new GLOW.Cache;if(a.context)this.GL=a.context,GLOW.registerContext(this);else{try{this.domElement=document.createElement("canvas"),this.GL=this.domElement.getContext("experimental-webgl",{alpha:this.alpha,depth:this.depth,antialias:this.antialias,stencil:this.stencil,premultipliedAlpha:this.premultipliedAlpha,preserveDrawingBuffer:this.preserveDrawingBuffer}),this.domElement.width=this.width,this.domElement.height=this.height}catch(d){console.error("GLOW.Context.construct: "+
d)}GLOW.registerContext(this);this.enableCulling(!0,{frontFace:GL.CCW,cullFace:GL.BACK});this.enableDepthTest(!0,{func:GL.LEQUAL,write:!0,zNear:0,zFar:1});this.enableBlend(!1);this.setupClear({clearBits:GL.COLOR_BUFFER_BIT|GL.DEPTH_BUFFER_BIT});this.setupViewport({x:0,y:0,width:this.width,height:this.height});this.clear()}}b.prototype.setupClear=function(a){var d=a.depth!==void 0?Math.min(1,Math.max(0,a.depth)):1;GL.clearColor(a.red!==void 0?Math.min(1,Math.max(0,a.red)):0,a.green!==void 0?Math.min(1,
Math.max(0,a.green)):0,a.blue!==void 0?Math.min(1,Math.max(0,a.blue)):0,a.alpha!==void 0?Math.min(1,Math.max(0,a.alpha)):1);GL.clearDepth(d);this.clearBits=a.clearBits!==void 0?a.clearBits:this.clearBits;return this};b.prototype.clear=function(a){if(a===void 0)a=this.clearBits;GL.clear(a);return this};b.prototype.enableBlend=function(a,d){a?(GL.enable(GL.BLEND),d&&this.setupBlend(d)):GL.disable(GL.BLEND);return this};b.prototype.setupBlend=function(a){if(a.equationRGB)try{a.equationAlpha&&GL.blendEquationSeparate(a.equationRGB,
a.equationAlpha),a.srcRGB&&GL.blendFuncSeparate(a.srcRGB,a.dstRGB,a.srcAlpha,a.dstAlpha)}catch(d){console.error("GLOW.Context.setupBlend: "+d)}else try{a.equation&&GL.blendEquation(a.equation),a.src&&GL.blendFunc(a.src,a.dst)}catch(c){console.error("GLOW.Context.setupBlend: "+c)}return this};b.prototype.enableDepthTest=function(a,d){a?(GL.enable(GL.DEPTH_TEST),d&&this.setupDepthTest(d)):GL.disable(GL.DEPTH_TEST);return this};b.prototype.setupDepthTest=function(a){try{a.func!==void 0&&GL.depthFunc(a.func),
a.write!==void 0&&GL.depthMask(a.write),a.zNear!==void 0&&a.zFar!==void 0&&a.zNear<=a.zFar&&GL.depthRange(Math.max(0,Math.min(1,a.zNear)),Math.max(0,Math.min(1,a.zFar)))}catch(d){console.log("GLOW.Context.setupDepthTest: "+d)}return this};b.prototype.enableStencilTest=function(a,d){a?(GL.enable(GL.STENCIL_TEST),d&&this.setupStencilTest(d)):GL.disable(GL.STENCIL_TEST);return this};b.prototype.setupStencilTest=function(){return this};b.prototype.enableCulling=function(a,d){a?(GL.enable(GL.CULL_FACE),
d&&this.setupCulling(d)):GL.disable(GL.CULL_FACE);return this};b.prototype.setupCulling=function(a){try{a.frontFace&&GL.frontFace(a.frontFace),a.cullFace&&GL.cullFace(a.cullFace)}catch(d){console.error("GLOW.Context.setupCulling: "+d)}return this};b.prototype.enableScissorTest=function(a,d){a?(GL.enable(GL.SCISSOR_TEST),d&&this.setupScissorTest(d)):GL.disable(GL.SCISSOR_TEST);return this};b.prototype.setupScissorTest=function(){return this};b.prototype.setupViewport=function(a){var a=a!==void 0?a:
{},d=a.x!==void 0?a.x:0,c=a.y!==void 0?a.y:0,b=this.width=a.width!==void 0?a.width:window.innerWidth,a=this.height=a.height!==void 0?a.height:window.innerHeight;this.GL.viewport(d,c,b,a);return this};return b}();
GLOW.Compiler=function(){var b={},a=[];b.compile=function(d){var c,f=a.length,e;for(c=0;c<f;c++)if(e=a[c],d.vertexShader===e.vertexShader&&d.fragmentShader===e.fragmentShader)break;c===f?(c=b.linkProgram(b.compileVertexShader(d.vertexShader),b.compileFragmentShader(d.fragmentShader)),a.push({vertexShader:d.vertexShader,fragmentShader:d.fragmentShader,program:c})):c=e.program;return new GLOW.CompiledData(c,b.createUniforms(b.extractUniforms(c),d.data),b.createAttributes(b.extractAttributes(c),d.data),
b.createElements(d.elements))};b.compileVertexShader=function(a){var c;c=GL.createShader(GL.VERTEX_SHADER);c.id=GLOW.uniqueId();GL.shaderSource(c,a);GL.compileShader(c);GL.getShaderParameter(c,GL.COMPILE_STATUS)||console.error("GLOW.Compiler.compileVertexShader: "+GL.getShaderInfoLog(c));return c};b.compileFragmentShader=function(a){var c;c=GL.createShader(GL.FRAGMENT_SHADER);c.id=GLOW.uniqueId();GL.shaderSource(c,a);GL.compileShader(c);GL.getShaderParameter(c,GL.COMPILE_STATUS)||console.error("GLOW.Compiler.compileFragmentShader: "+
GL.getShaderInfoLog(c));return c};b.linkProgram=function(a,c){var b;b=GL.createProgram();b.id=GLOW.uniqueId();GL.attachShader(b,a);GL.attachShader(b,c);GL.linkProgram(b);GL.getProgramParameter(b,GL.LINK_STATUS)||console.error("GLOW.Compiler.linkProgram: Could not initialise program");return b};b.extractUniforms=function(a){for(var c={},b,e=0;;){b=GL.getActiveUniform(a,e);if(b!==null&&b!==-1&&b!==void 0)b={name:b.name.split("[")[0],size:b.size,type:b.type,location:GL.getUniformLocation(a,b.name.split("[")[0]),
locationNumber:e},c[b.name]=b;else break;e++}return c};b.extractAttributes=function(a){for(var c,b=0,e={};;){c=GL.getActiveAttrib(a,b);if(c!==null&&c!==-1&&c!==void 0)c={name:c.name,size:c.size,type:c.type,location:GL.getAttribLocation(a,c.name),locationNumber:b},e[c.name]=c;else break;b++}a.highestAttributeNumber=b-1;return e};b.createUniforms=function(a,b){var f,e={},h,g,i=0;for(f in a)h=a[f],g=h.name,b[g]===void 0?console.warn("GLOW.Compiler.createUniforms: missing declaration for uniform "+g):
b[g]instanceof GLOW.Uniform?e[g]=b[g]:(e[g]=new GLOW.Uniform(h,b[g]),e[g].type===GL.SAMPLER_2D&&e[g].data.init(i++));return e};b.createAttributes=function(a,b){var f,e,h,g={};for(f in a)e=a[f],h=e.name,b[h]===void 0?console.warn("GLOW.Compiler.createAttributes: missing declaration for attribute "+h):g[h]=b[h]instanceof GLOW.Attribute?b[h]:new GLOW.Attribute(e,b[h]);return g};b.createElements=function(a){var b;a?a instanceof GLOW.Elements?b=a:(a instanceof Uint16Array||(a=new Uint16Array(a)),b=new GLOW.Elements(a)):
console.error("GLOW.Compiler.createElements: missing 'elements' in supplied data. Quitting.");return b};return b}();
GLOW.CompiledData=function(){function b(a,b,c,f){this.program=a;this.uniforms=b!==void 0?b:{};this.attributes=c!==void 0?c:{};this.elements=f}b.prototype.clone=function(a){var b=new GLOW.CompiledData,c;for(c in this.uniforms)b.uniforms[c]=a&&a[c]?new GLOW.Uniform(this.uniforms[c],a[c]):this.uniforms[c];for(var f in this.attributes)b.attributes[f]=a&&a[f]?new GLOW.Attribute(this.attributes[f],a[f]):this.attributes[f];b.elements=a&&a.elements?new GLOW.Elements(a.elements):this.elements;b.program=this.program;
return b};return b}();
GLOW.Cache=function(){function b(){this.highestAttributeNumber=-1;this.uniformByLocation=[];this.attributeByLocation=[];this.textureByLocation=[];this.programId=this.elementId=-1}b.prototype.programCached=function(a){if(a.id===this.programId)return!0;this.programId=a.id;return!1};b.prototype.setProgramHighestAttributeNumber=function(a){var b=this.highestAttributeNumber;this.highestAttributeNumber=a.highestAttributeNumber;return a.highestAttributeNumber-b};b.prototype.uniformCached=function(a){if(this.uniformByLocation[a.locationNumber]===
a.id)return!0;this.uniformByLocation[a.locationNumber]=a.id;return!1};b.prototype.attributeCached=function(a){if(this.attributeByLocation[a.locationNumber]===a.id)return!0;this.attributeByLocation[a.locationNumber]=a.id;return!1};b.prototype.textureCached=function(a){if(this.textureByLocation[a.textureUnit]===a.id)return!0;this.textureByLocation[a.textureUnit]=a.id;return!1};b.prototype.elementsCached=function(a){if(a.id===this.elementId)return!0;this.elementId=a.id;return!1};b.prototype.clear=function(){this.highestAttributeNumber=
-1;this.uniformByLocation.length=0;this.attributeByLocation.length=0;this.textureByLocation.length=0;this.programId=this.elementId=-1};return b}();
GLOW.FBO=function(){function b(a){a=a!==void 0?a:{};this.id=GLOW.uniqueId();this.width=a.width!==void 0?a.width:window.innerWidth;this.height=a.height!==void 0?a.height:window.innerHeight;var b=a.wrapS!==void 0?a.wrapS:GL.CLAMP_TO_EDGE,c=a.wrapT!==void 0?a.wrapT:GL.CLAMP_TO_EDGE,f=a.magFilter!==void 0?a.magFilter:GL.LINEAR,e=a.minFilter!==void 0?a.minFilter:GL.LINEAR,h=a.format!==void 0?a.format:GL.RGBA,g=a.depth!==void 0?a.depth:!0,a=a.stencil!==void 0?paramaters.stencil:!1;this.textureUnit=-1;this.frameBuffer=
GL.createFramebuffer();this.renderBuffer=GL.createRenderbuffer();this.texture=GL.createTexture();this.viewport={x:0,y:0,width:this.width,height:this.height};try{GL.bindTexture(GL.TEXTURE_2D,this.texture),GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_S,b),GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_T,c),GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MAG_FILTER,f),GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MIN_FILTER,e),GL.texImage2D(GL.TEXTURE_2D,0,h,this.width,this.height,0,h,GL.UNSIGNED_BYTE,null),
GL.bindRenderbuffer(GL.RENDERBUFFER,this.renderBuffer),GL.bindFramebuffer(GL.FRAMEBUFFER,this.frameBuffer),GL.framebufferTexture2D(GL.FRAMEBUFFER,GL.COLOR_ATTACHMENT0,GL.TEXTURE_2D,this.texture,0),g&&!a?(GL.renderbufferStorage(GL.RENDERBUFFER,GL.DEPTH_COMPONENT16,this.width,this.height),GL.framebufferRenderbuffer(GL.FRAMEBUFFER,GL.DEPTH_ATTACHMENT,GL.RENDERBUFFER,this.renderBuffer)):g&&a?(GL.renderbufferStorage(GL.RENDERBUFFER,GL.DEPTH_STENCIL,width,height),GL.framebufferRenderbuffer(GL.FRAMEBUFFER,
GL.DEPTH_STENCIL_ATTACHMENT,GL.RENDERBUFFER,this.renderBuffer)):GL.renderbufferStorage(GL.RENDERBUFFER,GL.RGBA4,this.width,this.height),GL.bindTexture(GL.TEXTURE_2D,null),GL.bindRenderbuffer(GL.RENDERBUFFER,null),GL.bindFramebuffer(GL.FRAMEBUFFER,null)}catch(i){console.error("GLOW.FBO.construct: "+i)}}b.prototype.init=function(a){this.textureUnit=a};b.prototype.bind=function(){GL.bindFramebuffer(GL.FRAMEBUFFER,this.frameBuffer);GL.viewport(this.viewport.x,this.viewport.y,this.viewport.width,this.viewport.height);
return this};b.prototype.unbind=function(){GL.bindFramebuffer(GL.FRAMEBUFFER,null);GL.viewport(0,0,GLOW.currentContext.width,GLOW.currentContext.height);return this};b.prototype.setupViewport=function(a){this.viewport.x=a.x!==void 0?a.x:0;this.viewport.y=a.y!==void 0?a.y:0;this.viewport.width=a.width!==void 0?a.width:window.innerWidth;this.viewport.height=a.height!==void 0?a.height:window.innerHeight;return this};b.prototype.resize=function(){return this};b.prototype.generateMipMaps=function(){GL.bindTexture(GL.TEXTURE_2D,
this.texture);GL.generateMipmap(GL.TEXTURE_2D);GL.bindTexture(GL.TEXTURE_2D,null);return this};return b}();GLOW.Texture=function(b){this.url=b;this.id=GLOW.uniqueId();this.textureUnit=-1;this.texture=void 0;this.image=new Image;this.image.scope=this};GLOW.Texture.prototype.init=function(b){this.textureUnit=b;this.image.onload=this.onLoad;this.image.src=this.url};
GLOW.Texture.prototype.onLoad=function(){var b=this.scope;b.texture=GL.createTexture();GL.bindTexture(GL.TEXTURE_2D,b.texture);GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA,GL.RGBA,GL.UNSIGNED_BYTE,this);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_S,GL.REPEAT);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_T,GL.REPEAT);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MAG_FILTER,GL.LINEAR);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MIN_FILTER,GL.LINEAR_MIPMAP_LINEAR);GL.generateMipmap(GL.TEXTURE_2D)};
GLOW.Shader=function(){function b(a){this.id=GLOW.uniqueId();this.compiledData=a.use?a.use.clone(a.except):GLOW.Compiler.compile(a);this.attachData()}b.prototype.attachData=function(){var a,b;this.uniforms=this.compiledData.uniforms;this.attributes=this.compiledData.attributes;this.elements=this.compiledData.elements;this.program=this.compiledData.program;for(a in this.compiledData.uniforms)this[a]===void 0?this[a]=this.compiledData.uniforms[a].data:console.warn("GLOW.Shader.attachUniformAndAttributeData: name collision on uniform "+
a+", not attaching for easy access. Please use Shader.uniforms."+a+".data to access data.");for(b in this.compiledData.attributes)this[b]===void 0?this[b]=this.compiledData.attributes[b].data:console.warn("GLOW.Shader.attachUniformAndAttributeData: name collision on attribute "+b+", not attaching for easy access. Please use Shader.attributes."+b+".data to access data.")};b.prototype.draw=function(){var a=this.compiledData,b=GLOW.currentContext.cache;if(!b.programCached(a.program)){var c=b.setProgramHighestAttributeNumber(a.program);
if(c){var f=a.program.highestAttributeNumber,e=f-c+1;if(c>0)for(;e<=f;e++)GL.enableVertexAttribArray(e);else for(;e>=f;e--)GL.disableVertexAttribArray(e)}GL.useProgram(a.program)}for(var h in a.uniforms)b.uniformCached(a.uniforms[h])||a.uniforms[h].load();for(var g in a.attributes)b.attributeCached(a.attributes[g])||a.attributes[g].bind();a.elements.draw()};b.prototype.clone=function(a){return new GLOW.Shader({use:this.compiledData,except:a})};b.prototype.dispose=function(){};return b}();
GLOW.Elements=function(){function b(a){this.id=GLOW.uniqueId();this.elements=GL.createBuffer();this.length=a.length;GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.elements);GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,a,GL.STATIC_DRAW)}b.prototype.draw=function(){GLOW.currentContext.cache.elementsCached(this)||GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,this.elements);GL.drawElements(GL.TRIANGLES,this.length,GL.UNSIGNED_SHORT,0)};return b}();
GLOW.Uniform=function(){function b(){c[GL.INT]=function(){GL.uniform1iv(this.location,this.getNativeValue())};c[GL.FLOAT]=function(){GL.uniform1fv(this.location,this.getNativeValue())};c[GL.INT_VEC2]=function(){GL.uniform2iv(this.location,this.getNativeValue())};c[GL.INT_VEC3]=function(){GL.uniform3iv(this.location,this.getNativeValue())};c[GL.INT_VEC4]=function(){GL.uniform4iv(this.location,this.getNativeValue())};c[GL.FLOAT_VEC2]=function(){GL.uniform2fv(this.location,this.getNativeValue())};c[GL.FLOAT_VEC3]=
function(){GL.uniform3fv(this.location,this.getNativeValue())};c[GL.FLOAT_VEC4]=function(){GL.uniform4fv(this.location,this.getNativeValue())};c[GL.FLOAT_MAT2]=function(){GL.uniformMatrix2fv(this.location,!1,this.getNativeValue())};c[GL.FLOAT_MAT3]=function(){GL.uniformMatrix3fv(this.location,!1,this.getNativeValue())};c[GL.FLOAT_MAT4]=function(){GL.uniformMatrix4fv(this.location,!1,this.getNativeValue())};c[GL.SAMPLER_2D]=function(){this.data.texture!==void 0&&this.data.textureUnit!==-1&&!GLOW.currentContext.cache.textureCached(this.data)&&
(GL.uniform1i(this.location,this.data.textureUnit),GL.activeTexture(GL.TEXTURE0+this.data.textureUnit),GL.bindTexture(GL.TEXTURE_2D,this.data.texture))};c[GL.SAMPLER_CUBE]=function(){}}function a(a,e){d||(d=!0,b());this.id=GLOW.uniqueId();this.data=e;this.name=a.name;this.length=a.length;this.type=a.type;this.location=a.location;this.locationNumber=a.locationNumber;this.load=a.loadFunction||c[this.type]}var d=!1,c=[];a.prototype.getNativeValue=function(){return this.data.value};return a}();
GLOW.Attribute=function(){function b(b,f,e){a||(a=!0,d[GL.INT]=1,d[GL.INT_VEC2]=2,d[GL.INT_VEC3]=3,d[GL.INT_VEC4]=4,d[GL.FLOAT]=1,d[GL.FLOAT_VEC2]=2,d[GL.FLOAT_VEC3]=3,d[GL.FLOAT_VEC4]=4,d[GL.FLOAT_MAT2]=4,d[GL.FLOAT_MAT3]=9,d[GL.FLOAT_MAT4]=16);this.id=GLOW.uniqueId();this.data=f;this.location=b.location;this.locationNumber=b.locationNumber;this.offset=this.stride=0;this.size=d[b.type];this.buffer=GL.createBuffer();this.name=b.name;this.type=b.type;if(!e)if(this.data instanceof Float32Array)this.setData(this.data);
else{for(var b=this.data.length,e=this.size,h=new Float32Array(b*e),g=0,i=0;i<b;i++)for(var j=0;j<e;j++)h[g++]=f[i].value[j];this.setData(h)}}var a=!1,d=[];b.prototype.interleave=function(a,b,d){this.stride=b;this.offset=d};b.prototype.setData=function(a){this.data=a;GL.bindBuffer(GL.ARRAY_BUFFER,this.buffer);GL.bufferData(GL.ARRAY_BUFFER,this.data,GL.STATIC_DRAW)};b.prototype.bind=function(){GL.bindBuffer(GL.ARRAY_BUFFER,this.buffer);GL.vertexAttribPointer(this.location,this.size,GL.FLOAT,!1,this.stride,
this.offset)};return b}();
