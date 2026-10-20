(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,27715,e=>{"use strict";var t=e.i(43476),r=e.i(71645);let a=`#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,o=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uScale;
uniform float uRotation;
uniform int uDetail;
uniform float uWarp;
uniform float uHue;
uniform float uSaturation;
uniform float uBrightness;
uniform float uContrast;
uniform float uGrain;
uniform float uSeed;
uniform float uFade;
uniform float uOpacity;
uniform sampler2D uField;
uniform float uStir;
uniform vec3 uPointer;
uniform float uSheen;
uniform vec4 uSwirls[6];
in vec2 vUv;
out vec4 outColor;

vec3 hueRotate(vec3 c, float angle) {
  const vec3 k = vec3(0.57735027);
  float ca = cos(angle);
  return c * ca + cross(k, c) * sin(angle) + k * dot(k, c) * (1.0 - ca);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / edge, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 aspect = uResolution / mr;
  vec2 st = vUv - texture(uField, vUv).rg * uStir;

  for (int k = 0; k < 6; k++) {
    vec4 swirl = uSwirls[k];
    if (swirl.w == 0.0) continue;
    vec2 delta = (st - swirl.xy) * aspect;
    float angle = swirl.w * exp(-dot(delta, delta) / (swirl.z * swirl.z));
    float ca = cos(angle);
    float sa = sin(angle);
    st = swirl.xy + vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y) / aspect;
  }

  vec2 uv = (st * 2.0 - 1.0) * aspect;
  float c = cos(uRotation);
  float s = sin(uRotation);
  uv = mat2(c, -s, s, c) * uv / uScale;
  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5;
  float a = 0.0;
  for (int i = 0; i < 24; i++) {
    if (i >= uDetail) break;
    float fi = float(i);
    a += cos(fi - d - a * uv.x * uWarp);
    d += sin(uv.y * fi + a);
  }
  d += uTime * 0.5;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;

  vec2 toPointer = (vUv - uPointer.xy) * aspect;
  col += col * uPointer.z * uSheen * 0.8 * exp(-dot(toPointer, toPointer) / 0.09);

  col = hueRotate(col, uHue);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = (col - 0.5) * uContrast + 0.5;
  col *= uBrightness;
  col += (hash(gl_FragCoord.xy + uSeed) - 0.5) * uGrain * 0.12;
  col = clamp(col, 0.0, 1.0);

  float alpha = uOpacity;
  if (uFade > 0.0) {
    vec2 px = vUv * uResolution;
    float edge = uFade * mr * 0.5;
    alpha *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);
    alpha *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);
  }
  outColor = vec4(col * alpha, alpha);
}`,i=(e,t,r)=>Math.min(r,Math.max(t,e)),n=(e,t,r)=>{let a=e.createShader(t);return a?(e.shaderSource(a,r),e.compileShader(a),e.getShaderParameter(a,e.COMPILE_STATUS))?a:(e.deleteShader(a),null):null};e.s(["default",0,({color:e=[1,1,1],speed:l=1,amplitude:u=.1,mouseReact:s=!0,scale:c=1,detail:f=8,rotation:m=0,warp:d=1,hueShift:h=0,saturation:v=1,brightness:p=1.5,contrast:x=1,stir:R=.5,sheen:g=.3,clickSwirl:w=!0,grain:T=0,fade:E=0,opacity:M=1,resolution:A=1,paused:y=!1,className:S="",style:P})=>{let F=(0,r.useRef)(null),_=(0,r.useRef)(null),U=(0,r.useRef)(null),b={colorKey:Array.isArray(e)?e.join(","):String(e),color:e,speed:l,amplitude:u,mouseReact:s,scale:Math.max(.05,c),detail:i(Math.round(f),1,24),rotation:m,warp:d,hueShift:h,saturation:Math.max(0,v),brightness:Math.max(0,p),contrast:Math.max(0,x),stir:Math.max(0,R),sheen:Math.max(0,g),clickSwirl:w,grain:i(T,0,1),fade:i(E,0,1),opacity:i(M,0,1),resolution:i(A,.1,2),paused:y},D=(0,r.useRef)(b);return D.current=b,(0,r.useEffect)(()=>{let e=F.current,t=_.current,r=t?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!e||!t||!r)return;let l=n(r,r.VERTEX_SHADER,a),u=n(r,r.FRAGMENT_SHADER,o),s=r.createProgram();if(!l||!u||!s||(r.attachShader(s,l),r.attachShader(s,u),r.linkProgram(s),!r.getProgramParameter(s,r.LINK_STATUS)))return;r.useProgram(s);let c=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,c),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW);let f=r.getAttribLocation(s,"aPosition");r.enableVertexAttribArray(f),r.vertexAttribPointer(f,2,r.FLOAT,!1,0,0);let m={};for(let e of["uResolution","uTime","uColor","uMouse","uAmplitude","uScale","uRotation","uDetail","uWarp","uHue","uSaturation","uBrightness","uContrast","uGrain","uSeed","uFade","uOpacity","uField","uStir","uPointer","uSheen","uSwirls"])m[e]=r.getUniformLocation(s,e);let d=r.createTexture();r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,d),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.uniform1i(m.uField,0);let h=document.createElement("canvas");h.width=1,h.height=1;let v=h.getContext("2d",{willReadFrequently:!0}),p=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,x={x:.5,y:.5,inside:!1,tracked:!1},R={width:1,height:1,phase:0,mouse:[.5,.5],presence:0,color:[1,1,1],colorKey:"",cols:0,rows:0,field:new Float32Array(0),scratch:new Float32Array(0),fieldActive:!1,swirls:[],seed:0},g=new Float32Array(24),w=0,T=0,E=!0,M=!0,A=()=>{let e,a=D.current;(e=>{if(e.colorKey===R.colorKey)return;if(R.colorKey=e.colorKey,Array.isArray(e.color)){let t=e.color;R.color=[0,1,2].map(e=>i(Number(t[e]??1),0,1));return}if(!v)return;v.clearRect(0,0,1,1),v.fillStyle="#ffffff",v.fillStyle=String(e.color),v.fillRect(0,0,1,1);let[t,r,a]=v.getImageData(0,0,1,1).data;R.color=[t/255,r/255,a/255]})(a),e=i(Math.round(48*R.height/R.width),6,96),(48!==R.cols||e!==R.rows)&&(R.cols=48,R.rows=e,R.field=new Float32Array(48*e*2),R.scratch=new Float32Array(48*e*2),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,d),r.texImage2D(r.TEXTURE_2D,0,r.RG16F,48,e,0,r.RG,r.FLOAT,R.field)),r.viewport(0,0,t.width,t.height),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,d),r.texSubImage2D(r.TEXTURE_2D,0,0,0,R.cols,R.rows,r.RG,r.FLOAT,R.field),g.fill(0),R.swirls.forEach((e,t)=>{let r=.21*(1+.4*e.age),a=Math.exp(-(1.35*e.age))-Math.exp(-(10*e.age)),o=Math.min(1,(3.2-e.age)/.8);g.set([e.x,e.y,r,3*a*o*(.21/r)**2],4*t)}),r.uniform2f(m.uResolution,R.width,R.height),r.uniform1f(m.uTime,R.phase),r.uniform3f(m.uColor,R.color[0],R.color[1],R.color[2]),r.uniform2f(m.uMouse,R.mouse[0],R.mouse[1]),r.uniform1f(m.uAmplitude,a.amplitude),r.uniform1f(m.uScale,a.scale),r.uniform1f(m.uRotation,a.rotation*Math.PI/180),r.uniform1i(m.uDetail,a.detail),r.uniform1f(m.uWarp,a.warp),r.uniform1f(m.uHue,a.hueShift*Math.PI/180),r.uniform1f(m.uSaturation,a.saturation),r.uniform1f(m.uBrightness,a.brightness),r.uniform1f(m.uContrast,a.contrast),r.uniform1f(m.uGrain,a.grain),r.uniform1f(m.uSeed,R.seed),r.uniform1f(m.uFade,a.fade),r.uniform1f(m.uOpacity,a.opacity),r.uniform1f(m.uStir,a.mouseReact?a.stir:0),r.uniform3f(m.uPointer,x.x,x.y,a.mouseReact?R.presence:0),r.uniform1f(m.uSheen,a.sheen),r.uniform4fv(m.uSwirls,g),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT),r.drawArrays(r.TRIANGLES,0,3)},y=e=>{if(w=0,!M||!E)return;let t=D.current,r=T?Math.min(.05,(e-T)/1e3):1/60;T=e;let a=!t.paused&&!p;a&&(R.phase+=r*t.speed);let o=t.mouseReact&&x.tracked?[x.x,x.y]:[.5,.5],i=1-Math.exp(-(5*r));R.mouse[0]+=(o[0]-R.mouse[0])*i,R.mouse[1]+=(o[1]-R.mouse[1])*i,R.presence+=(!!x.inside-R.presence)*(1-Math.exp(-(4*r))),R.fieldActive&&(e=>{let{cols:t,rows:r,field:a,scratch:o}=R,i=Math.exp(-(1.4*e)),n=0;for(let e=0;e<r;e++)for(let l=0;l<t;l++){let u=(e*t+l)*2,s=(e*t+Math.max(0,l-1))*2,c=(e*t+Math.min(t-1,l+1))*2,f=(Math.max(0,e-1)*t+l)*2,m=(Math.min(r-1,e+1)*t+l)*2;for(let e=0;e<2;e++){let t=(12*a[u+e]+a[s+e]+a[c+e]+a[f+e]+a[m+e])/16;o[u+e]=t*i,n=Math.max(n,Math.abs(o[u+e]))}}a.set(o),n<4e-4&&(a.fill(0),R.fieldActive=!1)})(r),R.swirls=R.swirls.filter(e=>(e.age+=r)<3.2),t.grain>0&&a&&(R.seed=Math.floor(e/42)%997),A();let n=Math.abs(o[0]-R.mouse[0])>5e-4||Math.abs(o[1]-R.mouse[1])>5e-4||Math.abs(!!x.inside-R.presence)>.002;a||n||R.fieldActive||R.swirls.length?w=requestAnimationFrame(y):T=0},S=()=>{!w&&M&&E&&(w=requestAnimationFrame(y))},P=t=>{let r=e.getBoundingClientRect();return{x:(t.clientX-r.left)/Math.max(1,r.width),y:1-(t.clientY-r.top)/Math.max(1,r.height)}},b=e=>{let t=D.current,{x:r,y:a}=P(e),o=r>=0&&r<=1&&a>=0&&a<=1;o&&t.mouseReact&&!p&&x.inside&&t.stir>0&&((e,t,r,a)=>{let{cols:o,rows:i,field:n}=R,l=R.width/R.height,u=Math.max(0,Math.floor((e-.22/l)*o)),s=Math.min(o-1,Math.ceil((e+.22/l)*o)),c=Math.max(0,Math.floor((t-.22)*i)),f=Math.min(i-1,Math.ceil((t+.22)*i));for(let m=c;m<=f;m++)for(let c=u;c<=s;c++){let u=((c+.5)/o-e)*l,s=(m+.5)/i-t,f=1-(u*u+s*s)/.0484;if(f<=0)continue;let d=(m*o+c)*2,h=n[d]+r*f*f*3.2,v=n[d+1]+a*f*f*3.2,p=Math.hypot(h,v),x=p>0?.4*Math.tanh(p/.4)/p:0;n[d]=h*x,n[d+1]=v*x}R.fieldActive=!0})(r,a,r-x.x,a-x.y),x.x=r,x.y=a,x.inside=o,o&&(x.tracked=!0),S()},C=()=>{x.inside=!1,S()},L=e=>{if(!D.current.clickSwirl||p)return;let{x:t,y:r}=P(e);if(!(t<0)&&!(t>1)&&!(r<0)&&!(r>1)){if(R.swirls.length>=6){if(R.swirls[0].age<3.2-.4)return;R.swirls.shift()}R.swirls.push({x:t,y:r,age:0}),S()}},X=()=>{let r=D.current,a=Math.min(window.devicePixelRatio||1,2)*r.resolution;R.width=Math.max(1,e.clientWidth),R.height=Math.max(1,e.clientHeight),t.width=Math.max(1,Math.round(R.width*a)),t.height=Math.max(1,Math.round(R.height*a)),A(),S()};U.current=()=>{let e=Math.min(window.devicePixelRatio||1,2)*D.current.resolution;t.width!==Math.max(1,Math.round(R.width*e))?X():w||A(),S()};let I=new ResizeObserver(X);I.observe(e);let O=new IntersectionObserver(e=>{(E=e.some(e=>e.isIntersecting))&&(T=0,S())});return O.observe(e),window.addEventListener("pointermove",b,{passive:!0}),window.addEventListener("pointerdown",L,{passive:!0}),document.documentElement.addEventListener("pointerleave",C),X(),()=>{M=!1,cancelAnimationFrame(w),U.current=null,I.disconnect(),O.disconnect(),window.removeEventListener("pointermove",b),window.removeEventListener("pointerdown",L),document.documentElement.removeEventListener("pointerleave",C),r.deleteTexture(d),r.deleteBuffer(c),r.deleteProgram(s),r.deleteShader(l),r.deleteShader(u)}},[]),(0,r.useEffect)(()=>{U.current?.()}),(0,t.jsx)("div",{ref:F,className:`iridescence-container${S?` ${S}`:""}`,style:P,children:(0,t.jsx)("canvas",{ref:_,className:"iridescence-canvas","aria-hidden":"true"})})}])},14852,function(e){e.n(e.i(27715))}]);