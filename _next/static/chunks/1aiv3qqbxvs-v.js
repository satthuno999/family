(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,56822,e=>{"use strict";var t=e.i(43476),r=e.i(71645);let a=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,o=`#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uStops[5];
uniform int uStopCount;
uniform float uAmplitude;
uniform float uBlend;
uniform float uHeight;
uniform float uScale;
uniform float uGlow;
uniform float uBrightness;
uniform int uLayers;
uniform float uFlip;
uniform vec3 uPointer;
uniform float uReveal;
uniform float uOpacity;
uniform float uLightMode;
out vec4 outColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float smootherstep(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);
  int i = int(min(floor(x), float(uStopCount - 2)));
  float f = x - float(i);
  f = f * f * (3.0 - 2.0 * f);
  vec3 lch = mix(uStops[i], uStops[i + 1], f);
  lch.x = mix(lch.x, min(lch.x, 0.7), uLightMode);
  return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float y = 1.0 - frag.y / uResolution.y;
  y = mix(y, 1.0 - y, uFlip);
  float u = frag.x / uResolution.x;
  float X = (frag.x - uResolution.x * 0.5) / uResolution.y;
  float t = uTime;
  float reach = uPointer.z * exp(-pow((X - uPointer.x) / 0.38, 2.0));

  vec3 glow = vec3(0.0);
  float cover = 0.0;
  for (int k = 0; k < 3; k++) {
    if (k >= uLayers) break;
    float layer = float(k);
    float seed = layer * 13.7;
    float pace = t * (1.0 - layer * 0.18);
    float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));
    float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72
      + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;
    float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;
    hem += reach * 0.08 * (layer < 0.5 ? 1.0 : 0.4);
    hem = mix(-0.25, hem, uReveal);

    float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);
    float rise = hem - y;
    float low = -soft - uGlow * 0.14;
    float high = 0.26 + soft * 0.6;
    float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);
    float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));
    float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);
    alpha = clamp(alpha * (1.0 + reach * 0.25 * smootherstep(0.9, 0.0, abs(y - hem))), 0.0, 1.0);

    vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);
    glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);
    cover = 1.0 - (1.0 - cover) * (1.0 - alpha);
  }

  float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;
  float strength = clamp(uBrightness, 0.0, 2.0);
  glow *= fade * min(strength, 1.0);
  cover *= fade * min(strength, 1.0);
  glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));
  float dither = (hash(frag) - 0.5) / 255.0;

  if (uLightMode > 0.5) {
    vec3 tint = cover > 0.0001 ? glow / cover : vec3(0.0);
    cover *= smootherstep(0.0, 0.25, cover);
    float alpha = cover * 0.7;
    outColor = vec4(tint * alpha + dither, clamp(alpha + dither, 0.0, 1.0));
    return;
  }
  outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));
}`,i=(e,t,r)=>Math.min(r,Math.max(t,e)),n=(e,t,r)=>{let a=e.createShader(t);return a?(e.shaderSource(a,r),e.compileShader(a),e.getShaderParameter(a,e.COMPILE_STATUS))?a:(e.deleteShader(a),null):null};e.s(["default",0,({colorStops:e=["#5227FF","#7cff67","#5227FF"],amplitude:l=1,blend:c=.5,speed:u=1,time:s,height:f=.45,scale:m=1,glow:h=.6,brightness:d=1,layers:p=1,direction:v="top",mouseInteraction:x=!0,intro:g=!0,opacity:y=1,lightMode:w=!1,paused:M=!1,dpr:b,className:S="",style:A})=>{let R=(0,r.useRef)(null),E=(0,r.useRef)(null),L=(0,r.useRef)(null),P=(Array.isArray(e)?e:[]).filter(Boolean).map(String).slice(0,5),F={stops:P.length>=2?P:1===P.length?[P[0],P[0]]:["#5227FF","#7cff67"],amplitude:Math.max(0,l),blend:i(c,0,1),speed:u,time:s,height:i(f,0,1),scale:Math.max(.1,m),glow:Math.max(0,h),brightness:Math.max(0,d),layers:i(Math.round(p),1,3),flip:+("bottom"===v),mouseInteraction:x,intro:g,opacity:i(y,0,1),lightMode:w,paused:M,dpr:b},C=(0,r.useRef)(F);return C.current=F,(0,r.useEffect)(()=>{let e=R.current,t=E.current,r=t?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!e||!t||!r)return;let l=(e=>{let t=n(e,e.VERTEX_SHADER,a),r=n(e,e.FRAGMENT_SHADER,o),i=e.createProgram();if(!t||!r||!i)return null;if(e.attachShader(i,t),e.attachShader(i,r),e.bindAttribLocation(i,0,"aPosition"),e.linkProgram(i),e.deleteShader(t),e.deleteShader(r),!e.getProgramParameter(i,e.LINK_STATUS))return e.deleteProgram(i),null;let l={},c=e.getProgramParameter(i,e.ACTIVE_UNIFORMS);for(let t=0;t<c;t++){let r=e.getActiveUniform(i,t);r&&(l[r.name.replace("[0]","")]=e.getUniformLocation(i,r.name))}return{program:i,uniforms:l}})(r);if(!l)return;let c=l.uniforms,u=r.createBuffer(),s=r.createVertexArray();r.bindVertexArray(s),r.bindBuffer(r.ARRAY_BUFFER,u),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW),r.enableVertexAttribArray(0),r.vertexAttribPointer(0,2,r.FLOAT,!1,0,0);let f=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),m=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,h=new Map,d=new Float32Array(15),p={width:1,height:1},v={x:0,y:0,inside:!1},x={clock:0,px:0,py:.5,reach:0,reveal:C.current.intro&&!m?0:1},g=0,y=0,w=!0,M=()=>{var e;let a,o,i=C.current;(o=-1===(a=(e=i.stops.map(e=>(e=>{let[t,r,a]=e.map(e=>e<=.04045?e/12.92:Math.pow((e+.055)/1.055,2.4)),o=Math.cbrt(.4122214708*t+.5363325363*r+.0514459929*a),i=Math.cbrt(.2119034982*t+.6806995451*r+.1073969566*a),n=Math.cbrt(.0883024619*t+.2817188376*r+.6299787005*a),l=[.2104542553*o+.793617785*i-.0040720468*n,1.9779984951*o-2.428592205*i+.4505937099*n,.0259040371*o+.7827717662*i-.808675766*n];return[l[0],Math.hypot(l[1],l[2]),Math.atan2(l[2],l[1])]})((e=>{let t=h.get(e);if(t)return t;let r=[1,1,1];if(f){f.clearRect(0,0,1,1),f.fillStyle="#ffffff",f.fillStyle=e,f.fillRect(0,0,1,1);let[t,a,o]=f.getImageData(0,0,1,1).data;r=[t/255,a/255,o/255]}return h.set(e,r),r})(e)))).findIndex(e=>e[1]>.02))?0:e[a][2],e.map(e=>{let t=e[1]>.02?e[2]:o;for(;t-o>Math.PI;)t-=2*Math.PI;for(;t-o<-Math.PI;)t+=2*Math.PI;return o=t,[e[0],e[1],t]})).forEach((e,t)=>d.set(e,3*t));let n=x.reveal;r.viewport(0,0,t.width,t.height),r.useProgram(l.program),r.bindVertexArray(s),r.uniform2f(c.uResolution,t.width,t.height),r.uniform1f(c.uTime,void 0!==i.time?i.time*i.speed*.1:x.clock),r.uniform3fv(c.uStops,d),r.uniform1i(c.uStopCount,i.stops.length),r.uniform1f(c.uAmplitude,i.amplitude),r.uniform1f(c.uBlend,i.blend),r.uniform1f(c.uHeight,i.height),r.uniform1f(c.uScale,i.scale),r.uniform1f(c.uGlow,i.glow),r.uniform1f(c.uBrightness,i.brightness),r.uniform1i(c.uLayers,i.layers),r.uniform1f(c.uFlip,i.flip),r.uniform3f(c.uPointer,x.px,x.py,x.reach),r.uniform1f(c.uReveal,1-Math.pow(1-n,3)),r.uniform1f(c.uOpacity,i.opacity),r.uniform1f(c.uLightMode,+!!i.lightMode),r.drawArrays(r.TRIANGLES,0,3)},b=e=>{if(g=0,!w||document.hidden)return;let t=C.current,r=y?i((e-y)/1e3,5e-4,.05):1/60;if(y=e,t.paused){x.reveal=1,M(),y=0;return}x.clock+=r*t.speed*!m;let a=t.mouseInteraction&&v.inside&&!m,o=1-Math.exp(-r/.6);if(a){let e=(v.x-p.width/2)/p.height,r=t.flip?1-v.y/p.height:v.y/p.height;x.px+=(e-x.px)*o,x.py+=(r-x.py)*o}x.reach+=(!!a-x.reach)*(1-Math.exp(-r/(a?.9:1.4))),!t.intro||m?x.reveal=1:x.reveal<1&&(x.reveal=Math.min(1,x.reveal+r/2.4)),M(),g=requestAnimationFrame(b)},S=()=>{g||!w||document.hidden||(g=requestAnimationFrame(b))},A=()=>{let r=C.current,a=Math.max(1,e.clientWidth),o=Math.max(1,e.clientHeight),i=Math.min(r.dpr||window.devicePixelRatio||1,2);p.width=a,p.height=o,t.width=Math.max(1,Math.round(a*i)),t.height=Math.max(1,Math.round(o*i)),M(),S()},P=t=>{let r=e.getBoundingClientRect();v.x=t.clientX-r.left,v.y=t.clientY-r.top;let a=v.inside;if(v.inside=v.x>=0&&v.y>=0&&v.x<=r.width&&v.y<=r.height,v.inside&&!a){let e=C.current;x.px=(v.x-r.width/2)/Math.max(1,r.height),x.py=e.flip?1-v.y/Math.max(1,r.height):v.y/Math.max(1,r.height)}C.current.paused||S()},F=e=>{"mouse"!==e.pointerType&&(v.inside=!1)},T=()=>{v.inside=!1},B=()=>{y=0,S()},z=new ResizeObserver(A);z.observe(e);let I=new IntersectionObserver(e=>{(w=e.some(e=>e.isIntersecting))&&(y=0,S())});I.observe(e),window.addEventListener("pointermove",P,{passive:!0}),window.addEventListener("pointerdown",P,{passive:!0}),window.addEventListener("pointerup",F,{passive:!0}),window.addEventListener("pointercancel",F,{passive:!0}),document.documentElement.addEventListener("pointerleave",T),document.addEventListener("visibilitychange",B),A();let k=C.current.dpr;return L.current=()=>{let e=C.current;if(e.dpr!==k){k=e.dpr,A();return}g||M(),S()},()=>{cancelAnimationFrame(g),L.current=null,z.disconnect(),I.disconnect(),window.removeEventListener("pointermove",P),window.removeEventListener("pointerdown",P),window.removeEventListener("pointerup",F),window.removeEventListener("pointercancel",F),document.documentElement.removeEventListener("pointerleave",T),document.removeEventListener("visibilitychange",B),r.deleteProgram(l.program),r.deleteBuffer(u),r.deleteVertexArray(s),r.getExtension("WEBGL_lose_context")?.loseContext()}},[]),(0,r.useEffect)(()=>{L.current?.()}),(0,t.jsx)("div",{ref:R,className:`aurora-container${S?` ${S}`:""}`,style:A,children:(0,t.jsx)("canvas",{ref:E,className:"aurora-canvas","aria-hidden":"true"})})}])},15025,function(e){e.n(e.i(56822))}]);