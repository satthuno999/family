(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,5856,e=>{"use strict";var t=e.i(43476),r=e.i(71645);let o=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,i=`
uniform vec2 uView;
uniform float uScale;
uniform float uRotation;
uniform float uTime;
uniform float uWave;
uniform float uRipple;
uniform float uFold;
uniform vec2 uShift;
uniform vec4 uPointer;
uniform vec2 uDrag;
uniform vec4 uWaves[4];

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2 r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2 rot = mat2(c, -s, s, c);
  return rot * uv;
}

vec2 bend(vec2 uv) {
  vec2 aspect = vec2(uView.x / uView.y, 1.0);
  vec2 offset = (uv - uPointer.xy) * aspect;
  float touch = uPointer.z * exp(-dot(offset, offset) / (uPointer.w * uPointer.w));
  uv -= uDrag * touch;
  for (int i = 0; i < 4; i++) {
    vec4 wave = uWaves[i];
    if (wave.w <= 0.0) continue;
    vec2 q = (uv - wave.xy) * aspect;
    float dist = length(q);
    float front = dist - wave.z;
    float ring = exp(-front * front * 60.0) * wave.w;
    uv += q / max(dist, 0.0001) / aspect * ring * 0.034 * sin(front * 34.0);
  }
  return uv;
}

float silk(vec2 vUv) {
  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv * uScale + uShift;
  float tOffset = uTime;
  tex.y += 0.03 * uWave * sin(8.0 * tex.x - tOffset);
  return 0.6 + 0.4 * uFold * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + uRipple * sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));
}
`,a=`#version 300 es
precision highp float;
${i}
out vec4 outColor;

void main() {
  vec2 vUv = gl_FragCoord.xy / uView;
  float pattern = silk(bend(vUv));
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);
  outColor = vec4(pow(n, 6.0), 0.0, 0.0, 1.0);
}`,n=`#version 300 es
precision highp float;
${i}
uniform sampler2D uBloom;
uniform vec3 uColor;
uniform vec3 uSheenColor;
uniform float uNoiseIntensity;
uniform float uDepth;
uniform float uSheen;
uniform float uGlow;
uniform float uLightMode;
uniform vec3 uLight;
uniform vec2 uStep;
uniform float uPresence;
uniform float uFade;
out vec4 outColor;

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 softClip(vec3 c) {
  vec3 over = max(c - 0.75, 0.0);
  return min(c, 0.75) + 0.25 * (1.0 - exp(-over * 4.0));
}

void main() {
  vec2 vUv = gl_FragCoord.xy / uView;
  vec2 coord = bend(vUv);
  float pattern = silk(coord);
  float rnd = noise(gl_FragCoord.xy);
  float n = clamp((pattern - 0.2) / 0.8, 0.0, 1.0);

  float gx = silk(coord + vec2(uStep.x, 0.0)) - pattern;
  float gy = silk(coord + vec2(0.0, uStep.y)) - pattern;
  vec3 normal = normalize(vec3(-gx * 26.0, -gy * 26.0, 1.0));
  vec3 toLight = normalize(vec3(uLight.xy, 0.85));
  float relief = 1.0 + (dot(normal, toLight) - toLight.z) * 1.8 * uDepth;
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));
  float gloss = pow(max(dot(normal, halfway), 0.0), 48.0) * smoothstep(0.25, 0.85, n);
  float crest = pow(n, 5.0);
  float shine = (gloss * 0.85 + crest * 0.4) * uSheen * (1.0 + uLight.z * 0.6);

  float bloom = 0.0;
  if (uGlow > 0.0) {
    bloom += textureLod(uBloom, vUv, 1.0).r * 0.35;
    bloom += textureLod(uBloom, vUv, 2.0).r * 0.3;
    bloom += textureLod(uBloom, vUv, 3.0).r * 0.2;
    bloom += textureLod(uBloom, vUv, 4.0).r * 0.15;
  }

  vec3 result;
  if (uLightMode > 0.5) {
    float fold = smoothstep(0.28, 0.9, pattern);
    float specular = smoothstep(0.72, 0.98, pattern);
    vec3 shadowColor = uColor * (0.72 - 0.12 * uDepth);
    vec3 bodyColor = min(uColor * 1.18, vec3(1.0));
    vec3 lightBase = mix(shadowColor, bodyColor, fold) * mix(1.0, relief, 0.6);
    lightBase = mix(lightBase, vec3(1.0), clamp(specular * 0.92 + shine * 0.22 + bloom * uGlow * 0.2, 0.0, 1.0));
    float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));
    float grainSignal = (rnd + fineNoise - 1.0);
    float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);
    result = clamp(lightBase + grainSignal * grainStrength, 0.0, 1.0);
  } else {
    float grain = rnd / 15.0 * uNoiseIntensity;
    float floorValue = mix(0.2, 0.03, uDepth);
    float curve = uDepth > 0.0 ? pow(n, 1.0 + 1.4 * uDepth) : n;
    float shade = uDepth > 0.0 ? floorValue + (1.0 - floorValue) * curve : pattern;
    vec3 tone = mix(uColor, pow(uColor, vec3(1.45)), (1.0 - n) * uDepth);
    vec3 lit = tone * shade * relief - vec3(grain);
    vec3 tint = mix(uColor, uSheenColor, 0.8);
    vec3 extra = tint * (shine + bloom * uGlow * 0.55);
    float blend = clamp((uSheen + uGlow) * 4.0, 0.0, 1.0);
    result = mix(clamp(lit, 0.0, 1.0), clamp(softClip(lit + extra), 0.0, 1.0), blend);
  }

  float edge = uFade * 0.5;
  float mask = 1.0;
  if (edge > 0.0) {
    mask = smootherstep01(vUv.x / edge) * smootherstep01((1.0 - vUv.x) / edge);
    mask *= smootherstep01(vUv.y / edge) * smootherstep01((1.0 - vUv.y) / edge);
  }
  float alpha = uPresence * mask;
  outColor = vec4(result * alpha, alpha);
}`,l=Math.hypot(-.55,.7),u=(e,t,r)=>Math.min(r,Math.max(t,e)),f=(e,t,r)=>{let o=e.createShader(t);return o?(e.shaderSource(o,r),e.compileShader(o),e.getShaderParameter(o,e.COMPILE_STATUS))?o:(e.deleteShader(o),null):null},h=(e,t)=>{let r=f(e,e.VERTEX_SHADER,o),i=f(e,e.FRAGMENT_SHADER,t),a=e.createProgram();if(!r||!i||!a)return null;if(e.attachShader(a,r),e.attachShader(a,i),e.bindAttribLocation(a,0,"aPosition"),e.linkProgram(a),e.deleteShader(r),e.deleteShader(i),!e.getProgramParameter(a,e.LINK_STATUS))return e.deleteProgram(a),null;let n={},l=e.getProgramParameter(a,e.ACTIVE_UNIFORMS);for(let t=0;t<l;t++){let r=e.getActiveUniform(a,t);r&&(n[r.name.replace(/\[0\]$/,"")]=e.getUniformLocation(a,r.name))}return{program:a,uniforms:n}};e.s(["default",0,({speed:e=5,scale:o=1,color:i="#7B7481",sheenColor:f="#ffffff",noiseIntensity:s=1.5,rotation:c=0,sheen:m=.5,depth:d=.5,glow:v=.3,ripple:g=1,wave:p=1,variation:x=0,mouseInteraction:w=!0,interactionStrength:E=1,clickRipple:R=!0,intro:T=!0,fade:y=0,lightMode:M=!1,paused:b=!1,dpr:A,className:S="",style:U})=>{let C=(0,r.useRef)(null),F=(0,r.useRef)(null),P=(0,r.useRef)(null),_=(0,r.useRef)(null);return _.current={speed:e,scale:o,color:String(i),sheenColor:String(f),noiseIntensity:Math.max(0,s),rotation:c,sheen:Math.max(0,m),depth:u(d,0,1),glow:Math.max(0,v),ripple:Math.max(0,g),wave:Math.max(0,p),variation:x,mouseInteraction:w,interactionStrength:Math.max(0,E),clickRipple:R,intro:T,fade:u(y,0,1),lightMode:M,paused:b,dpr:A},(0,r.useEffect)(()=>{let e=C.current,t=F.current,r=t?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!e||!t||!r)return;let o=h(r,a),i=h(r,n);if(!o||!i)return;let f=r.createBuffer(),s=r.createVertexArray();r.bindVertexArray(s),r.bindBuffer(r.ARRAY_BUFFER,f),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW),r.enableVertexAttribArray(0),r.vertexAttribPointer(0,2,r.FLOAT,!1,0,0);let c=r.createTexture(),m=r.createFramebuffer(),d={width:0,height:0},v=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),g=new Map,p=e=>{if(g.has(e))return g.get(e);let t=[1,1,1];if(v){v.clearRect(0,0,1,1),v.fillStyle="#ffffff",v.fillStyle=e,v.fillRect(0,0,1,1);let[r,o,i]=v.getImageData(0,0,1,1).data;t=[r/255,o/255,i/255]}return g.set(e,t),t},x=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,w={width:1,height:1,ratio:1},E={x:0,y:0,inside:!1},R=[],T=new Float32Array(16),y={flow:0,intro:_.current.intro&&!x?0:1,touch:0,x:0,y:0,dragX:0,dragY:0,lightX:-.55,lightY:.7},M=0,b=0,A=!0,S=(e,t,o,i,a)=>{let[n,l]=(e=>{let t=Number(e)||0;if(!t)return[0,0];let r=e=>{let r=43758.5453*Math.sin(12.9898*t+78.233*e);return r-Math.floor(r)-.5};return[6*r(1),6*r(2)]})(i.variation);r.uniform2f(e.uView,t,o),r.uniform1f(e.uScale,i.scale),r.uniform1f(e.uRotation,i.rotation),r.uniform1f(e.uTime,y.flow-1.6*(1-a)),r.uniform1f(e.uWave,i.wave),r.uniform1f(e.uRipple,i.ripple),r.uniform1f(e.uFold,.25+.75*a),r.uniform2f(e.uShift,n,l),r.uniform4f(e.uPointer,y.x/w.width,1-y.y/w.height,y.touch*i.interactionStrength,.32),r.uniform2f(e.uDrag,y.dragX,y.dragY),r.uniform4fv(e.uWaves,T)},U=()=>{let e,a=_.current,n=(e=y.intro)*e*e*(e*(6*e-15)+10),l=1-Math.pow(1-y.intro,3);if(r.bindVertexArray(s),T.fill(0),R.slice(-4).forEach((e,t)=>{T.set([e.x,e.y,.6*e.age,Math.exp(-e.age/.7200000000000001)],4*t)}),a.glow>0){var u,f;u=Math.max(1,Math.round(t.width/4)),f=Math.max(1,Math.round(t.height/4)),(d.width!==u||d.height!==f)&&(d.width=u,d.height=f,r.bindTexture(r.TEXTURE_2D,c),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,u,f,0,r.RGBA,r.UNSIGNED_BYTE,null),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR_MIPMAP_LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.bindFramebuffer(r.FRAMEBUFFER,m),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,c,0)),r.bindFramebuffer(r.FRAMEBUFFER,m),r.viewport(0,0,d.width,d.height),r.useProgram(o.program),S(o.uniforms,d.width,d.height,a,n),r.drawArrays(r.TRIANGLES,0,3),r.bindTexture(r.TEXTURE_2D,c),r.generateMipmap(r.TEXTURE_2D)}let h=i.uniforms;r.bindFramebuffer(r.FRAMEBUFFER,null),r.viewport(0,0,t.width,t.height),r.useProgram(i.program),S(h,t.width,t.height,a,n),r.uniform3fv(h.uColor,p(a.color)),r.uniform3fv(h.uSheenColor,p(a.sheenColor)),r.uniform1f(h.uNoiseIntensity,a.noiseIntensity),r.uniform1f(h.uDepth,a.depth),r.uniform1f(h.uSheen,a.sheen),r.uniform1f(h.uGlow,a.glow),r.uniform1f(h.uLightMode,+!!a.lightMode),r.uniform3f(h.uLight,y.lightX,y.lightY,y.touch*a.interactionStrength),r.uniform2f(h.uStep,w.ratio/t.width,w.ratio/t.height),r.uniform1f(h.uPresence,l),r.uniform1f(h.uFade,a.fade),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,c),r.uniform1i(h.uBloom,0),r.drawArrays(r.TRIANGLES,0,3)},L=e=>{if(M=0,!A||document.hidden)return;let t=_.current,r=b?Math.min(.05,(e-b)/1e3):1/60;b=e;let o=!t.paused&&!x&&0!==t.speed;o&&(y.flow+=.1*r*t.speed),!t.intro||x?y.intro=1:y.intro<1&&(y.intro=Math.min(1,y.intro+r/2.2));let i=t.mouseInteraction&&E.inside&&!x;i&&y.touch<.01&&(y.x=E.x,y.y=E.y);let a=1-Math.exp(-(10*r)),n=y.x,f=y.y;y.x+=(E.x-y.x)*a,y.y+=(E.y-y.y)*a;let h=(y.x-n)/Math.max(r,.001)/w.height,s=(y.y-f)/Math.max(r,.001)/w.height,c=1-Math.exp(-(4*r));y.dragX+=(u(.03*h,-.06,.06)-y.dragX)*c,y.dragY+=(u(-(.03*s),-.06,.06)-y.dragY)*c,y.touch+=(!!i-y.touch)*(1-Math.exp(-r*(i?3.5:1.4)));let m=-.55,d=.7;if(i){let e=(E.x/w.width-.5)*(w.width/w.height),t=.5-E.y/w.height,r=Math.hypot(e,t);r>.04?(m=e/r*l,d=t/r*l):(m=y.lightX,d=y.lightY)}let v=1-Math.exp(-(3*r));y.lightX+=(m-y.lightX)*v,y.lightY+=(d-y.lightY)*v;for(let e=R.length-1;e>=0;e--)R[e].age+=r,R[e].age>4&&R.splice(e,1);U();let g=y.intro<1||R.length>0||Math.abs(!!i-y.touch)>.002||Math.abs(y.dragX)+Math.abs(y.dragY)>2e-4||Math.abs(E.x-y.x)+Math.abs(E.y-y.y)>.3||Math.abs(m-y.lightX)+Math.abs(d-y.lightY)>.001;o||g?M=requestAnimationFrame(L):b=0},D=()=>{M||!A||document.hidden||(M=requestAnimationFrame(L))},X=()=>{let r=_.current,o=Math.max(1,e.clientWidth),i=Math.max(1,e.clientHeight),a=Math.min(r.dpr||window.devicePixelRatio||1,2);w.width=o,w.height=i,w.ratio=a,t.width=Math.max(1,Math.round(o*a)),t.height=Math.max(1,Math.round(i*a)),M||U(),D()},B=t=>{let r=e.getBoundingClientRect(),o=t.clientX-r.left,i=t.clientY-r.top;return{x:o,y:i,inside:o>=0&&i>=0&&o<=r.width&&i<=r.height}},I=e=>{let t=B(e);E.x=t.x,E.y=t.y,E.inside=t.inside,D()},N=e=>{if(!_.current.clickRipple||x)return;let t=B(e);t.inside&&(R.push({x:t.x/w.width,y:1-t.y/w.height,age:0}),R.length>4&&R.shift(),D())},G=()=>{E.inside=!1,D()},V=()=>{b=0,D()},O=new ResizeObserver(X);O.observe(e);let Y=new IntersectionObserver(e=>{(A=e.some(e=>e.isIntersecting))&&(b=0,D())});Y.observe(e),window.addEventListener("pointermove",I,{passive:!0}),window.addEventListener("pointerdown",N,{passive:!0}),document.documentElement.addEventListener("pointerleave",G),document.addEventListener("visibilitychange",V),X();let k=_.current.dpr;return P.current=()=>{let e=_.current;if(e.dpr!==k){k=e.dpr,X();return}M||U(),D()},()=>{cancelAnimationFrame(M),P.current=null,O.disconnect(),Y.disconnect(),window.removeEventListener("pointermove",I),window.removeEventListener("pointerdown",N),document.documentElement.removeEventListener("pointerleave",G),document.removeEventListener("visibilitychange",V),r.deleteTexture(c),r.deleteFramebuffer(m),r.deleteProgram(o.program),r.deleteProgram(i.program),r.deleteBuffer(f),r.deleteVertexArray(s),r.getExtension("WEBGL_lose_context")?.loseContext()}},[]),(0,r.useEffect)(()=>{P.current?.()}),(0,t.jsx)("div",{ref:C,className:`silk-container${S?` ${S}`:""}`,style:U,children:(0,t.jsx)("canvas",{ref:F,className:"silk-canvas","aria-hidden":"true"})})}])},76561,function(e){e.n(e.i(5856))}]);