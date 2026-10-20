(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,56267,e=>{"use strict";var t=e.i(43476),a=e.i(71645);let r={circle:0,square:1,ring:2,sparkle:3},o={parallax:0,repel:1,attract:2},i={none:0,up:1,down:2,forward:3},n=1/Math.tan(7.5*Math.PI/180),l=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec3 aPosition;
layout(location = 2) in vec4 aRandom;
layout(location = 3) in vec3 aColor;
uniform mat3 uRotation;
uniform vec3 uOffset;
uniform float uSpread;
uniform float uTime;
uniform float uCamera;
uniform float uAspect;
uniform vec2 uView;
uniform float uRatio;
uniform float uSize;
uniform float uRandomness;
uniform float uBlur;
uniform float uFocus;
uniform float uGlow;
uniform float uTwinkle;
uniform int uShape;
uniform int uDrift;
uniform float uTravel;
uniform vec4 uPointer;
uniform int uEffect;
uniform float uStrength;
uniform vec4 uBursts[4];
uniform int uBurstCount;
uniform float uReveal;
out vec2 vLocal;
out float vRadius;
out float vBlur;
out float vAlpha;
out float vHalo;
out float vSeed;
out vec3 vColor;

vec3 bob(vec4 r, float t) {
  return vec3(
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)
  );
}

void main() {
  vec3 pos = aPosition * uSpread;
  pos.z *= 10.0;
  vec3 wobble = bob(aRandom, uTime);
  vec3 world = uRotation * pos + uOffset + wobble;
  float edge = 1.0;
  if (uDrift == 1 || uDrift == 2) {
    float span = uSpread * 2.0 + 3.0;
    float k = mod(aRandom.w * span + uOffset.y + wobble.y + (uDrift == 1 ? uTravel : -uTravel), span);
    world.y = k - span * 0.5;
    edge = smoothstep(0.0, span * 0.12, k) * smoothstep(span, span * 0.88, k);
  } else if (uDrift == 3) {
    float span = uSpread * 10.0 * 2.0 + 3.0;
    float k = mod(aRandom.y * span + uOffset.z + wobble.z + uTravel, span);
    world.z = k - span * 0.5;
    edge = smoothstep(0.0, span * 0.1, k);
  }
  vec3 view = world - vec3(0.0, 0.0, uCamera);
  float dist = length(view);
  float ahead = -view.z;
  if (ahead < 0.10 || ahead > 100.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  edge *= smoothstep(1.0, 4.0, ahead);
  vec2 ndc = vec2(view.x * ${n.toFixed(6)} / uAspect, view.y * ${n.toFixed(6)}) / ahead;
  vec2 screen = (ndc * 0.5 + 0.5) * uView;

  vec2 shift = vec2(0.0);
  float flash = 0.0;
  if (uEffect != 0 && uPointer.z > 0.001) {
    vec2 delta = screen - uPointer.xy;
    float reach = length(delta);
    float falloff = exp(-dot(delta, delta) / (uPointer.w * uPointer.w));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    shift += (uEffect == 1 ? away * uPointer.w * 0.5 : -delta * 0.6) * falloff * uStrength * uPointer.z;
  }
  for (int i = 0; i < 4; i++) {
    if (i >= uBurstCount) break;
    vec4 burst = uBursts[i];
    vec2 delta = screen - burst.xy;
    float reach = length(delta);
    float wave = exp(-pow((reach - burst.z * 520.0) / 46.0, 2.0));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);
    flash += wave * fade;
  }
  screen += shift;

  float diameter = (uRandomness <= 0.0 ? uSize : uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / dist) * (1.0 + min(flash, 1.0) * 0.6);
  float device = diameter * uRatio;
  float radius = max(diameter, 1.0 / uRatio) * 0.5;
  float coverage = min(1.0, device * device);
  float blur = uBlur * max(uFocus - dist, 0.0) / max(dist, 1.0);
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;
  float extent = radius * (uShape == 3 ? 1.6 : 1.0) + blur + halo + 1.5;

  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));
  float far = smoothstep(100.0, 90.0, ahead);
  float focus = radius / (radius + blur);
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);

  vLocal = aCorner * extent;
  vRadius = radius;
  vBlur = blur;
  vHalo = halo;
  vSeed = aRandom.y;
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;
  vColor = aColor;
  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);
}`,f=`#version 300 es
precision highp float;
precision highp int;
uniform int uShape;
uniform float uGlow;
uniform float uRatio;
uniform float uTime;
uniform float uSoft;
uniform float uShimmer;
uniform float uOpacity;
in vec2 vLocal;
in float vRadius;
in float vBlur;
in float vAlpha;
in float vHalo;
in float vSeed;
in vec3 vColor;
out vec4 outColor;

float ray(vec2 q, float aa) {
  float width = 0.14 * max(0.0, 1.0 - q.x);
  return (1.0 - smoothstep(width - aa, width + aa, q.y)) * step(q.x, 1.0);
}

void main() {
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;
  float d = length(vLocal);
  float shape;
  if (uShape == 1) {
    float box = max(abs(vLocal.x), abs(vLocal.y));
    shape = 1.0 - smoothstep(vRadius * 0.86 - soft, vRadius * 0.86 + soft, box);
  } else if (uShape == 2) {
    float edge = max(vRadius * 0.22, 0.6 / uRatio);
    shape = 1.0 - smoothstep(edge - soft, edge + soft, abs(d - vRadius * 0.8));
  } else if (uShape == 3) {
    float reach = vRadius * 1.6;
    vec2 q = abs(vLocal) / max(reach, 0.0001);
    float aa = soft / max(reach, 0.0001);
    shape = max(max(ray(q, aa), ray(q.yx, aa)), 1.0 - smoothstep(vRadius * 0.32 - soft, vRadius * 0.32 + soft, d));
  } else {
    shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);
  }
  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.35)) * uGlow * 0.4 : 0.0;
  float alpha = clamp(shape + halo * (1.0 - shape), 0.0, 1.0) * vAlpha * uOpacity * (1.0 - uSoft);
  if (alpha < 0.002) discard;
  vec2 uv = vLocal / max(vRadius * 2.0, 0.0001) + 0.5;
  vec3 color = clamp(vColor + uShimmer * 0.2 * sin(uv.yxx + uTime + vSeed * 6.28), 0.0, 1.0);
  outColor = vec4(color * alpha, alpha);
}`,u=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aEnds;
layout(location = 2) in vec4 aTint;
uniform vec2 uView;
uniform float uRatio;
uniform float uWidth;
out float vAcross;
out float vHalf;
out vec4 vTint;

void main() {
  vec2 a = aEnds.xy;
  vec2 b = aEnds.zw;
  vec2 along = b - a;
  float span = max(length(along), 0.0001);
  vec2 normal = vec2(-along.y, along.x) / span;
  float reach = uWidth * 0.5 + 1.0 / uRatio;
  vec2 point = mix(a, b, aCorner.x * 0.5 + 0.5) + normal * aCorner.y * reach;
  vAcross = aCorner.y * reach;
  vHalf = uWidth * 0.5;
  vTint = aTint;
  gl_Position = vec4(point / uView * 2.0 - 1.0, 0.0, 1.0);
}`,s=`#version 300 es
precision highp float;
uniform float uRatio;
uniform float uOpacity;
in float vAcross;
in float vHalf;
in vec4 vTint;
out vec4 outColor;

void main() {
  float edge = 0.6 / uRatio;
  float cover = 1.0 - smoothstep(vHalf - edge, vHalf + edge, abs(vAcross));
  float alpha = cover * vTint.a * uOpacity;
  outColor = vec4(vTint.rgb * alpha, alpha);
}`,c=(e,t,a)=>Math.min(a,Math.max(t,e)),d=(e,t,a)=>{let r=e.createShader(t);return r?(e.shaderSource(r,a),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(e.deleteShader(r),null):null},h=(e,t,a)=>{let r=d(e,e.VERTEX_SHADER,t),o=d(e,e.FRAGMENT_SHADER,a),i=e.createProgram();if(!r||!o||!i)return null;if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))return e.deleteProgram(i),null;let n={},l=e.getProgramParameter(i,e.ACTIVE_UNIFORMS);for(let t=0;t<l;t++){let a=e.getActiveUniform(i,t);a&&(n[a.name.replace("[0]","")]=e.getUniformLocation(i,a.name))}return{program:i,uniforms:n}},m=(e,t)=>(e%t+t)%t;e.s(["default",0,({particleCount:e=200,particleSpread:d=10,speed:v=.1,particleColors:p=["#ffffff"],moveParticlesOnHover:x=!0,particleHoverFactor:w=1,alphaParticles:A=!1,particleBaseSize:R=100,sizeRandomness:y=1,cameraDistance:g=20,disableRotation:b=!1,pixelRatio:M,shape:F="circle",glow:E=.5,twinkle:S=.3,depthOfField:B=0,connections:T=!1,connectionDistance:C=110,hoverEffect:P="parallax",hoverRadius:_=140,clickBurst:L=!0,drift:O="none",driftSpeed:D=1,variation:k=0,intro:U=!0,opacity:V=1,lightMode:z=!1,paused:I=!1,className:Y="",style:H})=>{let q=(0,a.useRef)(null),N=(0,a.useRef)(null),W=(0,a.useRef)(null),G=(Array.isArray(p)?p:[p]).filter(Boolean).map(String),$={count:c(Math.round(e),1,2e4),spread:Math.max(.1,d),speed:v,colors:G.length?G:["#ffffff"],mouse:x,hoverFactor:Math.max(0,w),soft:A,size:Math.max(0,R),randomness:Math.max(0,y),camera:Math.max(1,g),rotate:!b,dpr:M,shape:r[F]??0,glow:Math.max(0,E),twinkle:c(S,0,1),depthOfField:Math.max(0,B),connections:T,connectionDistance:Math.max(10,C),hoverEffect:o[P]??0,hoverRadius:Math.max(20,_),clickBurst:L,drift:i[O]??0,driftSpeed:D,variation:Math.max(0,Math.round(k)),intro:U,opacity:c(V,0,1),lightMode:z,paused:I},X=(0,a.useRef)($);return X.current=$,(0,a.useEffect)(()=>{let e=q.current,t=N.current,a=t?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!e||!t||!a)return;let r=h(a,l,f),o=h(a,u,s);if(!r||!o)return;let i=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,i),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),a.STATIC_DRAW);let d=a.createBuffer(),v=a.createBuffer(),p=a.createBuffer(),x=a.createVertexArray();a.bindVertexArray(x),a.bindBuffer(a.ARRAY_BUFFER,i),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0);let w=(e,t,r)=>{a.bindBuffer(a.ARRAY_BUFFER,e),a.enableVertexAttribArray(t),a.vertexAttribPointer(t,r,a.FLOAT,!1,0,0),a.vertexAttribDivisor(t,1)};w(d,1,3),w(v,2,4),w(p,3,3);let A=a.createBuffer(),R=new Float32Array(72e3),y=a.createVertexArray();a.bindVertexArray(y),a.bindBuffer(a.ARRAY_BUFFER,i),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0),a.bindBuffer(a.ARRAY_BUFFER,A),a.bufferData(a.ARRAY_BUFFER,R.byteLength,a.DYNAMIC_DRAW),a.enableVertexAttribArray(1),a.vertexAttribPointer(1,4,a.FLOAT,!1,32,0),a.vertexAttribDivisor(1,1),a.enableVertexAttribArray(2),a.vertexAttribPointer(2,4,a.FLOAT,!1,32,16),a.vertexAttribDivisor(2,1),a.bindVertexArray(null);let g=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),b=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,M=new Map,F=e=>{let t=M.get(e);if(t)return t;let a=[1,1,1];if(g){g.clearRect(0,0,1,1),g.fillStyle="#ffffff",g.fillStyle=e,g.fillRect(0,0,1,1);let[t,r,o]=g.getImageData(0,0,1,1).data;a=[t/255,r/255,o/255]}return M.set(e,a),a},E={width:1,height:1,ratio:1},S={x:0,y:0,sx:0,sy:0,nx:0,ny:0,inside:!1,active:0},B={clock:0,spin:0,travel:0,offsetX:0,offsetY:0,reveal:X.current.intro&&!b?0:1},T=[],C=new Float32Array(16),P={key:"",count:0,positions:new Float32Array(0),randoms:new Float32Array(0),colors:new Float32Array(0)},_={x:new Float32Array(0),y:new Float32Array(0),ahead:new Float32Array(0),alpha:new Float32Array(0)},L=0,O=0,D=!0,k=()=>[B.offsetX,B.offsetY,-(70*(1-(1-Math.pow(1-c(B.reveal,0,1),3))))],U=()=>{let e=X.current;(e=>{let t,r=`${e.count}|${e.variation}|${e.colors.join(",")}|${+!!e.lightMode}`;if(r===P.key)return;P.key=r;let o=(t=7919*e.variation+1>>>0,()=>{let e=t=t+0x6d2b79f5>>>0;return e=Math.imul(e^e>>>15,1|e),(((e^=e+Math.imul(e^e>>>7,61|e))^e>>>14)>>>0)/0x100000000}),i=e.count,n=new Float32Array(3*i),l=new Float32Array(4*i),f=new Float32Array(3*i),u=e.colors.map(t=>{let a,r;return e.lightMode?(r=Math.min(1,.06/Math.max(.2126*(a=F(t).map(e=>Math.pow(e,2.2)))[0]+.7152*a[1]+.0722*a[2],1e-4)),a.map(e=>Math.pow(e*r,1/2.2))):F(t)});for(let e=0;e<i;e++){let t,a,r,i;do t=2*o()-1,i=t*t+(a=2*o()-1)*a+(r=2*o()-1)*r;while(i>1||0===i)let s=Math.cbrt(o());n.set([t*s,a*s,r*s],3*e),l.set([o(),o(),o(),o()],4*e),f.set(u[Math.floor(o()*u.length)],3*e)}P.count=i,P.positions=n,P.randoms=l,P.colors=f;let s=Math.min(i,900);_.x=new Float32Array(s),_.y=new Float32Array(s),_.ahead=new Float32Array(s),_.alpha=new Float32Array(s),a.bindBuffer(a.ARRAY_BUFFER,d),a.bufferData(a.ARRAY_BUFFER,n,a.STATIC_DRAW),a.bindBuffer(a.ARRAY_BUFFER,v),a.bufferData(a.ARRAY_BUFFER,l,a.STATIC_DRAW),a.bindBuffer(a.ARRAY_BUFFER,p),a.bufferData(a.ARRAY_BUFFER,f,a.STATIC_DRAW)})(e);let i=(e=>{let t=1e3*B.clock,a=e.rotate?.1*Math.sin(2e-4*t):0,r=e.rotate?.15*Math.cos(5e-4*t):0,o=e.rotate?B.spin:0,[i,n,l,f,u,s]=[Math.sin(a),Math.cos(a),Math.sin(r),Math.cos(r),Math.sin(o),Math.cos(o)];return[f*s+l*i*u,n*u,-l*s+f*i*u,-f*u+l*i*s,n*s,l*u+f*i*s,l*n,-i,f*n]})(e),[l,f,u]=k();if(a.viewport(0,0,t.width,t.height),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.enable(a.BLEND),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),e.connections){let t=((e,t)=>{let a=((e,t)=>{let a=Math.min(P.count,900),[r,o,i]=k(),l=E.width/E.height,f=B.clock,u=e.hoverRadius,s=0!==e.hoverEffect?S.active:0,d=2*e.spread+3,h=10*e.spread*2+3;for(let v=0;v<a;v++){let a=P.positions[3*v]*e.spread,p=P.positions[3*v+1]*e.spread,x=P.positions[3*v+2]*e.spread*10,w=P.randoms[4*v],A=P.randoms[4*v+1],R=P.randoms[4*v+2],y=P.randoms[4*v+3],g=Math.sin(f*R+6.28*y)*(.1+1.4*w),b=Math.sin(f*A+6.28*w)*(.1+1.4*y),M=Math.sin(f*y+6.28*A)*(.1+1.4*R),F=t[0]*a+t[3]*p+t[6]*x+r+g,C=t[1]*a+t[4]*p+t[7]*x+o+b,L=t[2]*a+t[5]*p+t[8]*x+i+M,O=1;if(1===e.drift||2===e.drift){let t=m(y*d+o+b+(1===e.drift?B.travel:-B.travel),d);C=t-d/2;let a=c(t/(.12*d),0,1),r=c((d-t)/(.12*d),0,1);O=a*a*(3-2*a)*r*r*(3-2*r)}else if(3===e.drift){let e=m(A*h+i+M+B.travel,h);L=e-h/2;let t=c(e/(.1*h),0,1);O=t*t*(3-2*t)}let D=e.camera-L;if(D<.1||D>100){_.alpha[v]=0;continue}let k=c((D-1)/3,0,1);O*=k*k*(3-2*k);let U=F*n/l/D*.5*E.width+E.width/2,V=C*n/D*.5*E.height+E.height/2,z=0,I=0;if(s>.001){let t=U-S.sx,a=V-S.sy,r=Math.hypot(t,a),o=Math.exp(-(t*t+a*a)/(u*u))*e.hoverFactor*s;1===e.hoverEffect&&r>.001?(z+=t/r*u*.5*o,I+=a/r*u*.5*o):2===e.hoverEffect&&(z-=.6*t*o,I-=.6*a*o)}for(let e of T){let t=e.age/1.5,a=U-e.x,r=V-e.y,o=Math.hypot(a,r);if(o<.001)continue;let i=Math.exp(-Math.pow((o-520*t)/46,2)),n=c(o/30,0,1),l=i*(1-t)*(1-t)*56*n*n*(3-2*n);z+=a/o*l,I+=r/o*l}U+=z,V+=I;let Y=c((100-D)/10,0,1),H=c(1.6*B.reveal-.6*R,0,1);_.x[v]=U,_.y[v]=V,_.ahead[v]=D,_.alpha[v]=Y*Y*(3-2*Y)*O*H*H}return a})(e,t),r=e.connectionDistance,o=Math.max(1,Math.ceil(E.width/r)+2),i=new Map;for(let e=0;e<a;e++){if(_.alpha[e]<.02)continue;let t=(Math.floor(_.y[e]/r)+1)*o+Math.floor(_.x[e]/r)+1,a=i.get(t);a?a.push(e):i.set(t,[e])}let l=0,f=r*r;for(let[e,t]of i)for(let a of[0,1,o-1,o,o+1]){let o=0===a?t:i.get(e+a);if(o)for(let e=0;e<t.length;e++){let i=t[e];for(let t=0===a?e+1:0;t<o.length;t++){let e=o[t],a=_.x[i]-_.x[e],n=_.y[i]-_.y[e],u=a*a+n*n;if(u>f)continue;let s=c(1-Math.abs(_.ahead[i]-_.ahead[e])/18,0,1);if(s<=0)continue;if(l>=9e3)return l;let d=1-Math.sqrt(u)/r,h=8*l;R[h]=_.x[i],R[h+1]=_.y[i],R[h+2]=_.x[e],R[h+3]=_.y[e],R[h+4]=(P.colors[3*i]+P.colors[3*e])/2,R[h+5]=(P.colors[3*i+1]+P.colors[3*e+1])/2,R[h+6]=(P.colors[3*i+2]+P.colors[3*e+2])/2,R[h+7]=d*d*s*.7*Math.min(_.alpha[i],_.alpha[e]),l++}}}return l})(e,i);t&&(a.useProgram(o.program),a.bindVertexArray(y),a.bindBuffer(a.ARRAY_BUFFER,A),a.bufferSubData(a.ARRAY_BUFFER,0,R.subarray(0,8*t)),a.uniform2f(o.uniforms.uView,E.width,E.height),a.uniform1f(o.uniforms.uRatio,E.ratio),a.uniform1f(o.uniforms.uWidth,1),a.uniform1f(o.uniforms.uOpacity,e.opacity),a.drawArraysInstanced(a.TRIANGLE_STRIP,0,4,t))}let s=r.uniforms,h=0;for(let e=T.length-1;e>=0&&h<4;e--)C.set([T[e].x,T[e].y,T[e].age/1.5,1],4*h),h++;a.useProgram(r.program),a.bindVertexArray(x),a.uniformMatrix3fv(s.uRotation,!1,i),a.uniform3f(s.uOffset,l,f,u),a.uniform1f(s.uSpread,e.spread),a.uniform1f(s.uTime,B.clock),a.uniform1f(s.uCamera,e.camera),a.uniform1f(s.uAspect,E.width/E.height),a.uniform2f(s.uView,E.width,E.height),a.uniform1f(s.uRatio,E.ratio),a.uniform1f(s.uSize,e.size),a.uniform1f(s.uRandomness,e.randomness),a.uniform1f(s.uBlur,14*e.depthOfField),a.uniform1f(s.uFocus,e.camera+14),a.uniform1f(s.uGlow,e.lightMode?.3*e.glow:e.glow),a.uniform1f(s.uTwinkle,e.twinkle),a.uniform1i(s.uShape,e.shape),a.uniform1i(s.uDrift,e.drift),a.uniform1f(s.uTravel,B.travel),a.uniform4f(s.uPointer,S.sx,S.sy,S.active,e.hoverRadius),a.uniform1i(s.uEffect,e.hoverEffect),a.uniform1f(s.uStrength,e.hoverFactor),a.uniform4fv(s.uBursts,C),a.uniform1i(s.uBurstCount,h),a.uniform1f(s.uReveal,B.reveal),a.uniform1f(s.uSoft,.2*!!e.soft),a.uniform1f(s.uShimmer,+!e.lightMode),a.uniform1f(s.uOpacity,e.opacity),a.drawArraysInstanced(a.TRIANGLE_STRIP,0,4,P.count),a.bindVertexArray(null)},V=e=>{if(L=0,!D||document.hidden)return;let t=X.current,a=O?c((e-O)/1e3,5e-4,.05):1/60;if(O=e,t.paused){B.reveal=1,U(),O=0;return}let r=+!b,o=a*t.speed*r;B.clock+=o,t.rotate&&(B.spin+=.6*o),B.travel+=a*t.driftSpeed*r*(3===t.drift?6:.9);let i=t.mouse&&S.inside&&!b,n=1-Math.exp(-a/.35),l=i&&0===t.hoverEffect?t.hoverFactor:0;B.offsetX+=(-S.nx*l-B.offsetX)*n,B.offsetY+=(-S.ny*l-B.offsetY)*n,S.sx+=(S.x-S.sx)*(1-Math.exp(-a/.06)),S.sy+=(S.y-S.sy)*(1-Math.exp(-a/.06)),S.active+=(!!i-S.active)*(1-Math.exp(-a/.2));for(let e=T.length-1;e>=0;e--)T[e].age+=a,T[e].age>=1.5&&T.splice(e,1);!t.intro||b?B.reveal=1:B.reveal<1&&(B.reveal=Math.min(1,B.reveal+a/1.8)),U(),L=requestAnimationFrame(V)},z=()=>{L||!D||document.hidden||(L=requestAnimationFrame(V))},I=()=>{let a=X.current,r=Math.max(1,e.clientWidth),o=Math.max(1,e.clientHeight),i=Math.min(a.dpr||window.devicePixelRatio||1,2);E.width=r,E.height=o,t.width=Math.max(1,Math.round(r*i)),t.height=Math.max(1,Math.round(o*i)),E.ratio=t.width/r,U(),z()},Y=t=>{let a=e.getBoundingClientRect(),r=t.clientX-a.left,o=t.clientY-a.top,i=S.inside;S.inside=r>=0&&o>=0&&r<=a.width&&o<=a.height,S.x=r,S.y=a.height-o,S.nx=r/Math.max(1,a.width)*2-1,S.ny=-(o/Math.max(1,a.height)*2-1),S.inside&&!i&&(S.sx=S.x,S.sy=S.y)},H=e=>{Y(e),X.current.paused||z()},G=e=>{let t=X.current;Y(e),S.inside&&t.clickBurst&&!t.paused&&!b&&(T.push({x:S.x,y:S.y,age:0}),T.length>4&&T.shift(),z())},$=e=>{"mouse"!==e.pointerType&&(S.inside=!1)},j=()=>{S.inside=!1},K=()=>{O=0,z()},J=new ResizeObserver(I);J.observe(e);let Q=new IntersectionObserver(e=>{(D=e.some(e=>e.isIntersecting))&&(O=0,z())});Q.observe(e),window.addEventListener("pointermove",H,{passive:!0}),window.addEventListener("pointerdown",G,{passive:!0}),window.addEventListener("pointerup",$,{passive:!0}),window.addEventListener("pointercancel",$,{passive:!0}),document.documentElement.addEventListener("pointerleave",j),document.addEventListener("visibilitychange",K),I();let Z=X.current.dpr;return W.current=()=>{let e=X.current;if(e.dpr!==Z){Z=e.dpr,I();return}L||U(),z()},()=>{cancelAnimationFrame(L),W.current=null,J.disconnect(),Q.disconnect(),window.removeEventListener("pointermove",H),window.removeEventListener("pointerdown",G),window.removeEventListener("pointerup",$),window.removeEventListener("pointercancel",$),document.documentElement.removeEventListener("pointerleave",j),document.removeEventListener("visibilitychange",K),a.deleteProgram(r.program),a.deleteProgram(o.program),[i,d,v,p,A].forEach(e=>a.deleteBuffer(e)),a.deleteVertexArray(x),a.deleteVertexArray(y),a.getExtension("WEBGL_lose_context")?.loseContext()}},[]),(0,a.useEffect)(()=>{W.current?.()}),(0,t.jsx)("div",{ref:q,className:`particles-container${Y?` ${Y}`:""}`,style:H,children:(0,t.jsx)("canvas",{ref:N,className:"particles-canvas","aria-hidden":"true"})})}])},24924,function(e){e.n(e.i(56267))}]);