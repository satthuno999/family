(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,24223,e=>{"use strict";var t=e.i(43476),o=e.i(71645);let a=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,r=`#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uGloss;
uniform float uDepth;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uStarGlow;
uniform float uFlareGain;
uniform float uSquash;
uniform float uSaturation;
uniform float uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationAngle;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform int uLayers;
uniform vec3 uColors[4];
uniform int uColorCount;
uniform float uWarp;
uniform float uReveal;
uniform float uMode;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;

#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare, vec2 radial, float invReach) {
#ifdef WARP
  float along = dot(uv, radial);
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));
#else
  float d = length(uv);
#endif
  float m = uStarGlow / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uFlareGain;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uFlareGain;
  m *= smoothstep(1.0, 0.2, d * invReach);
#ifdef WARP
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));
#endif
  return m;
}

vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

#ifdef PALETTE
      float pick = Hash21(si + 7.0) * float(uColorCount);
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];
#else
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
#endif

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      vec2 shift = vec2(0.0);
      float invReach = 1.0;
#ifdef REPEL
      vec2 away = si + 0.5 + pad - repelAt;
      float dist = length(away);
      float q = dist * spread;
      float cells = pushCells * exp(-q * q);
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);
      shift = away * (moved / max(dist, 0.0001));
      invReach = 1.0 / (1.0 - moved);
#endif
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * twinkle * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution;
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  vec2 repelAt = vec2(0.0);
  float strength = 0.0;
  float push = 0.0;
  if (uAutoCenterRepulsion > 0.0) {
    strength = uAutoCenterRepulsion;
    push = strength * 0.05;
  } else if (uMouseRepulsion > 0.5) {
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;
    strength = max(uRepulsionStrength, 0.0);
    push = strength * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }
  float radius = 0.16 + 0.04 * strength;

  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);
  float angle = uRotationAngle;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;

  vec3 col = vec3(0.0);
  float layers = float(uLayers);
  for (int k = 0; k < 8; k++) {
    if (k >= uLayers) break;
    float i = float(k) / layers;
    float depth = fract(i + uDepth);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    vec2 offset = vec2(i * 453.32);
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;
  }
  col *= uReveal;

  if (uMode > 1.5) {
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));
    float energy = max(max(lit.r, lit.g), lit.b);
    vec3 tint = lit / max(energy, 0.0001);
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);
  } else if (uMode > 0.5) {
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;
    outColor = vec4(col * alpha, alpha);
  } else {
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);
  }
}`,n=(e,t,o)=>Math.min(o,Math.max(t,e));e.s(["default",0,({focal:e=[.5,.5],rotation:i=[1,0],starSpeed:l=.5,density:u=1,hueShift:s=140,disableAnimation:f=!1,speed:c=1,mouseInteraction:m=!0,glowIntensity:d=.3,saturation:v=0,mouseRepulsion:p=!0,repulsionStrength:h=2,twinkleIntensity:g=.3,rotationSpeed:R=.1,autoCenterRepulsion:y=0,transparent:x=!0,lightMode:A=!1,starColors:b,starSize:w=1,flareIntensity:S=1,layers:M=4,direction:C="forward",clickWarp:E=!0,intro:T=!0,backgroundColor:L,opacity:F=1,dpr:k,className:P="",style:O,..._})=>{let I=(0,o.useRef)(null),B=(0,o.useRef)(null),D=(0,o.useRef)(null),U=Array.isArray(b)?b.filter(Boolean).slice(0,4):[],G={focal:Array.isArray(e)?e:[.5,.5],rotation:Array.isArray(i)?i:[1,0],starSpeed:l,density:Math.max(.01,u),hueShift:s,disableAnimation:f,speed:c,mouseInteraction:m,glowIntensity:Math.max(0,d),saturation:Math.max(0,v),mouseRepulsion:p,repulsionStrength:h,twinkleIntensity:n(g,0,1),rotationSpeed:R,autoCenterRepulsion:Math.max(0,y),transparent:x,lightMode:A,palette:U,starSize:Math.max(0,w),flareIntensity:Math.max(0,S),layers:n(Math.round(M),2,8),reverse:"backward"===C,clickWarp:E,intro:T,backgroundColor:L,opacity:n(F,0,1),dpr:k},H=(0,o.useRef)(G);return H.current=G,(0,o.useEffect)(()=>{let e=I.current,t=B.current,o=t?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!e||!t||!o)return;let i=o.getExtension("KHR_parallel_shader_compile"),l=new Map,u=(e,t,n)=>{let i=4*!!e+2*!!t+ +!!n,u=l.get(i);if(!u){let s,f,c,m;u={program:(s=`${e?"#define PALETTE\n":""}${t?"#define REPEL\n":""}${n?"#define WARP\n":""}`,f=o.createProgram(),c=o.createShader(o.VERTEX_SHADER),m=o.createShader(o.FRAGMENT_SHADER),f&&c&&m?(o.shaderSource(c,a),o.shaderSource(m,r.replace("\n",`
${s}`)),o.compileShader(c),o.compileShader(m),o.attachShader(f,c),o.attachShader(f,m),o.bindAttribLocation(f,0,"aPosition"),o.linkProgram(f),o.deleteShader(c),o.deleteShader(m),f):null),linked:null,done:!1},l.set(i,u)}return u},s=(e,t,a,r)=>{let n=u(e,t,a);if(!n.done&&n.program){if(!r&&i&&!o.getProgramParameter(n.program,i.COMPLETION_STATUS_KHR))return null;n.linked=((e,t)=>{if(!e.getProgramParameter(t,e.LINK_STATUS))return null;let o={},a=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<a;r++){let a=e.getActiveUniform(t,r);a&&(o[a.name.replace("[0]","")]=e.getUniformLocation(t,a.name))}return{program:t,uniforms:o}})(o,n.program),n.done=!0}return n.linked},f=H.current;if(!s(f.palette.length>0,!1,!1,!0))return void l.forEach(e=>e.program&&o.deleteProgram(e.program));let c=o.createBuffer(),m=o.createVertexArray();o.bindVertexArray(m),o.bindBuffer(o.ARRAY_BUFFER,c),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);let d=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),v=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,p=new Map,h=(e,t)=>{if(!e)return t;let o=String(e),a=p.get(o);if(a)return a;let r=t;if(d){d.clearRect(0,0,1,1),d.fillStyle="#000000",d.fillStyle=o,d.fillRect(0,0,1,1);let[e,t,a]=d.getImageData(0,0,1,1).data;r=[e/255,t/255,a/255]}return p.set(o,r),r},g=new Float32Array(12),R={x:.5,y:.5,inside:!1},y={time:0,gloss:0,depth:0,angle:0,mx:.5,my:.5,active:0,boost:0,reveal:H.current.intro&&!v?0:1},x=0,A=0,b=!0,w=()=>{let e=H.current;e.palette.forEach((e,t)=>g.set(h(e,[1,1,1]),3*t));let a=e.lightMode?e.transparent?3:2:+!!e.transparent,r=h(e.backgroundColor,e.lightMode?[1,1,1]:[0,0,0]),n=y.reveal,i=e.palette.length>0,l=e.autoCenterRepulsion>0||e.mouseRepulsion&&e.repulsionStrength>0&&y.active>0,u=y.boost>0,f=s(i,!1,!1,!0);if(!f)return;let c=(l||u?s(i,l,u,!1):null)??f,d=c.uniforms;o.viewport(0,0,t.width,t.height),o.useProgram(c.program),o.bindVertexArray(m),o.uniform1f(d.uTime,y.time),o.uniform2f(d.uResolution,t.width,t.height),o.uniform2f(d.uFocal,e.focal[0],e.focal[1]),o.uniform2f(d.uRotation,e.rotation[0],e.rotation[1]),o.uniform1f(d.uGloss,y.gloss),o.uniform1f(d.uDepth,y.depth),o.uniform1f(d.uDensity,e.density),o.uniform1f(d.uHueShift,e.hueShift),o.uniform1f(d.uSpeed,e.speed),o.uniform2f(d.uMouse,y.mx,y.my);let v=1+5*y.boost;o.uniform1f(d.uStarGlow,.05*e.glowIntensity*e.starSize/Math.pow(v,.6)),o.uniform1f(d.uFlareGain,e.glowIntensity*e.flareIntensity),o.uniform1f(d.uSquash,1-1/(v*v)),o.uniform1f(d.uSaturation,e.saturation),o.uniform1f(d.uMouseRepulsion,+!!e.mouseRepulsion),o.uniform1f(d.uTwinkleIntensity,e.twinkleIntensity),o.uniform1f(d.uRotationAngle,y.angle),o.uniform1f(d.uRepulsionStrength,e.repulsionStrength),o.uniform1f(d.uMouseActiveFactor,y.active),o.uniform1f(d.uAutoCenterRepulsion,e.autoCenterRepulsion),o.uniform1i(d.uLayers,e.layers),o.uniform3fv(d.uColors,g),o.uniform1i(d.uColorCount,e.palette.length),o.uniform1f(d.uWarp,y.boost);let p=Math.min(1,n/.35);o.uniform1f(d.uReveal,p*p*(3-2*p)),o.uniform1f(d.uMode,a),o.uniform3fv(d.uBackground,r),o.uniform1f(d.uOpacity,e.opacity),o.drawArrays(o.TRIANGLES,0,3)},S=e=>{if(x=0,!b||document.hidden)return;let t=H.current,o=A?n((e-A)/1e3,5e-4,.05):1/60;A=e;let a=t.disableAnimation||v?0:1;t.intro&&!v&&y.reveal<1?(y.reveal=Math.min(1,y.reveal+o/2.2),y.boost=Math.max(y.boost,1.4*Math.pow(1-y.reveal,2))):(!t.intro||v)&&(y.reveal=1);let r=t.starSpeed/10*(t.reverse?-1:1);y.time+=o*a,y.gloss+=o*r*a,y.depth+=o*r*t.speed*a*(1+14*y.boost),y.angle+=o*t.rotationSpeed*a,y.boost*=Math.exp(-(1.3*o)),y.boost<.001&&(y.boost=0);let i=1-Math.exp(-o/.325),l=t.mouseInteraction&&R.inside&&!v;l&&(y.mx+=(R.x-y.mx)*i,y.my+=(R.y-y.my)*i);let u=+!!l;y.active+=(u-y.active)*i,.001>Math.abs(u-y.active)&&(y.active=u),w(),a>0||y.boost>0||y.active!==u||y.reveal<1?x=requestAnimationFrame(S):A=0},M=()=>{x||!b||document.hidden||(x=requestAnimationFrame(S))},C=()=>{let o=H.current,a=Math.max(1,e.clientWidth),r=Math.max(1,e.clientHeight),n=Math.min(o.dpr||window.devicePixelRatio||1,2);t.width=Math.max(1,Math.round(a*n)),t.height=Math.max(1,Math.round(r*n)),w(),M()},E=t=>{let o=e.getBoundingClientRect(),a=t.clientX-o.left,r=t.clientY-o.top;R.inside=a>=0&&r>=0&&a<=o.width&&r<=o.height,R.x=a/Math.max(1,o.width),R.y=1-r/Math.max(1,o.height)},T=e=>{E(e),M()},L=e=>{let t=H.current;E(e),R.inside&&t.clickWarp&&!v&&(y.boost=Math.min(1.6,y.boost+1),M())},F=e=>{"mouse"!==e.pointerType&&(R.inside=!1)},k=()=>{R.inside=!1},P=()=>{A=0,M()},O=new ResizeObserver(C);O.observe(e);let _=new IntersectionObserver(e=>{(b=e.some(e=>e.isIntersecting))&&(A=0,M())});_.observe(e),window.addEventListener("pointermove",T,{passive:!0}),window.addEventListener("pointerdown",L,{passive:!0}),window.addEventListener("pointerup",F,{passive:!0}),window.addEventListener("pointercancel",F,{passive:!0}),document.documentElement.addEventListener("pointerleave",k),document.addEventListener("visibilitychange",P),C();let U=f.autoCenterRepulsion>0||f.mouseInteraction&&f.mouseRepulsion,G=f.palette.length>0;(f.clickWarp||f.intro)&&u(G,!1,!0),U&&u(G,!0,!1),U&&f.clickWarp&&u(G,!0,!0);let W=H.current.dpr;return D.current=()=>{let e=H.current;if(e.dpr!==W){W=e.dpr,C();return}x||w(),M()},()=>{cancelAnimationFrame(x),D.current=null,O.disconnect(),_.disconnect(),window.removeEventListener("pointermove",T),window.removeEventListener("pointerdown",L),window.removeEventListener("pointerup",F),window.removeEventListener("pointercancel",F),document.documentElement.removeEventListener("pointerleave",k),document.removeEventListener("visibilitychange",P),l.forEach(e=>e.program&&o.deleteProgram(e.program)),o.deleteBuffer(c),o.deleteVertexArray(m),o.getExtension("WEBGL_lose_context")?.loseContext()}},[]),(0,o.useEffect)(()=>{D.current?.()}),(0,t.jsx)("div",{ref:I,className:`galaxy-container${P?` ${P}`:""}`,style:O,..._,children:(0,t.jsx)("canvas",{ref:B,className:"galaxy-canvas","aria-hidden":"true"})})}])},30609,function(e){e.n(e.i(24223))}]);