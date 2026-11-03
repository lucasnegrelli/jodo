(()=>{
const $=id=>document.getElementById(id);
const C=window.CENAS,N=C.length;
const gl=$('gl'),shc=$('sh'),ov=$('ov'),slab=$('slab'),vid=$('v'),stage=$('stage');
const dica=$('dica'),barra=$('barra'),pp=$('pp'),mu=$('mu'),vo=$('vo');
const dpr=Math.min(devicePixelRatio||1,Math.min(innerWidth,innerHeight)<700?1.25:1.5);
let W=innerWidth,H=innerHeight;
const g=gl.getContext('webgl',{antialias:false});
if(!g){document.body.textContent='WebGL indisponível';return;}
$('rolo').innerHTML=C.map(()=>'<section></section>').join('');
const Zf=()=>Math.max(.55,Math.min(1,(W/H)/1.5)); // em tela estreita as cenas encolhem pra caber na largura

/* ---------- GLSL comum ---------- */
const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const HEAD=`precision highp float;
uniform vec2 R,MU;uniform float T,VA,MD,Z;uniform vec3 TC;uniform vec4 K;uniform vec2 HI[8];
uniform sampler2D V,X,TX,TA;
vec2 M;
float h1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
vec3 vcA(vec2 q,float ra){vec2 vu=q-.5;if(ra>VA)vu.y*=VA/ra;else vu.x*=ra/VA;vu+=.5;return texture2D(V,vu).rgb;}
vec3 vcol(vec2 q){return vcA(q,R.x/R.y);}
float lum(vec3 c){return dot(c,vec3(.3,.59,.11));}
float ctr(float l,float c){return clamp((l-.5)*c+.5,0.,1.);}
float halft(vec2 fc,float l,float sz,float ang){float cs=cos(ang),sn=sin(ang);vec2 g=vec2(cs*fc.x-sn*fc.y,sn*fc.x+cs*fc.y)/sz;vec2 f=fract(g)-.5;float rad=sqrt(clamp(l,0.,1.))*.74;return smoothstep(rad,rad-.14,length(f));}
vec3 concreto(vec2 p){float c=fbm(p*3.+4.)*.55+fbm(p*17.)*.3+noise(p*90.)*.15;return vec3(.115,.112,.108)*(.35+c*1.1);}
`;
const FOOT=`
void main(){vec2 fc=gl_FragCoord.xy;vec2 p=(fc-.5*R)/R.y/Z;vec2 q=fc/R;M=MU/Z;vec3 col=vec3(0.);float tl=.6;
 scene(p,q,fc,col,tl);
 float tx=texture2D(TX,q).a,ta=texture2D(TA,q).a;
 float hs=0.;for(int i=0;i<8;i++){float an=float(i)*.785398;vec2 o=vec2(cos(an)*R.y/R.x,sin(an))*.006;hs=max(hs,max(texture2D(TX,q+o).a*tl,texture2D(TA,q+o).a*max(tl,K.w)));}
 col*=1.-.6*hs*(1.-max(tx*tl,ta*max(tl,K.w)));
 col+=TC*(tx*tl+ta*max(tl,K.w))*(.7+.3*fbm(p*14.))*1.2;
 col+=(h1(fc+T*60.)-.5)*.035;gl_FragColor=vec4(col,1.);}`;

/* ---------- cenas (GLSL), cada uma com tratamento gráfico próprio ---------- */
const F=[];
// 0 Tamo na Luta: relógio que varre; o vídeo aparece em meio-tom creme sobre tinta
F[0]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 float U=R.y/900.;vec2 d=p-M*.6;float ang=atan(d.y,d.x),r=length(d);
 float ha=1.5708-T*1.0471;float dl=mod(ha-ang,6.28318);
 float vis=clamp(exp(-dl*.8)*smoothstep(0.,.03,r)+(1.-K.z),0.,1.);
 float l=ctr(lum(vcol(q)),1.4);float dt=halft(fc,l,7.*U,.52);
 vec3 ink=vec3(.03,.03,.032),cream=vec3(.93,.9,.84);
 col=ink+cream*dt*vis*.92;
 float band=smoothstep(.435,.44,r)*smoothstep(.46,.455,r);float fa=fract(ang/6.28318*60.);float tk=smoothstep(.06,.015,min(fa,1.-fa));
 col=mix(col,cream*.75,band*tk*.8);
 float pd=abs(sin(ang-ha))*r;float fw=step(0.,cos(ang-ha))*step(r,.46);
 col+=vec3(1.,.22,.1)*(exp(-pd*pd/.00002)*.95+exp(-pd*pd/.0008)*.18)*fw;
 tl=.95;}`;
// 1 O Rap me Resgatou: os três takes verticais do clipe, noite; a fumaça passa por cima e o mouse sopra mais
F[1]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 vec3 vc=vcol(q);float l=lum(vc);vc=mix(vec3(l),vc,.9);vc=(vc-.5)*1.12+.5;vc*=1.-.5*smoothstep(.35,.95,length((q-.5)*vec2(1.2,1.)));
 vec2 w=p*2.2+vec2(T*.05,-T*.09);float d=fbm(w+fbm(w*1.6+T*.06)*1.4);
 float dens=clamp(smoothstep(.45,.85,d)*.5+texture2D(X,q).a*.95,0.,1.);
 vec3 sc=mix(vec3(.04,.045,.05),vec3(.6,.6,.62),d);
 col=mix(vc,sc,dens*.88);tl=.9;}`;
// 2 Gesto de Afeto: o viaduto do clipe nas cores reais (amarelo, rosa, cinza); chuva fina; o horizonte inclina com o mouse
F[2]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 float th=K.x;float ra=R.x/R.y;vec2 qc=q-.5;qc.x*=ra;
 float cs=cos(th),sn=sin(th);qc=vec2(cs*qc.x-sn*qc.y,sn*qc.x+cs*qc.y)/(1.16+.05*sin(T*.2));qc.x/=ra;
 vec3 vc=vcol(qc+.5);float l=lum(vc);vc=mix(vec3(l),vc,1.25);vc=(vc-.5)*1.04+.5+.05;
 vc*=1.-.32*smoothstep(.45,1.,length((q-.5)*vec2(1.2,1.)));
 float rn=noise(vec2(fc.x*.33+fc.y*.05,fc.y*.014-T*9.));float rain=smoothstep(.86,.98,rn)*.1;
 col=vc+vec3(.8,.85,.95)*rain;tl=.95;}`;
// 3 TCHULY: tira de filme P&B, legenda de cinema
F[3]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 float off=K.x,vel=K.y;p.y+=.004*sin(T*13.);
 float fw=.95;float u=(p.x+off)/fw;float lu=fract(u+.5);float fi=floor(u+.5);
 float inY=step(abs(p.y),.31);float inF=step(.04,lu)*step(lu,.96);
 float fa=fw*.92/.62;vec2 lq=vec2((lu-.04)/.92,p.y/.62+.5);
 vec3 vc=vec3(ctr(lum(vcA(lq,fa)),1.4))*vec3(1.03,1.,.95);
 float fl=.84+.16*sin(T*37.+fi)+.1*(noise(vec2(T*20.,fi))-.5);
 col=vec3(.02);
 float strip=step(abs(p.y),.4);vec3 base=vec3(.05,.05,.052);
 float hx=fract((p.x+off)/.1);float hole=smoothstep(.26,.32,hx)*smoothstep(.74,.68,hx)*smoothstep(.026,.018,abs(abs(p.y)-.355));
 col=mix(col,base,strip);col=mix(col,vec3(.5,.5,.48),hole*strip);
 col=mix(col,vc*fl,inY*inF);
 float sc=step(.9993,h1(floor(fc/3.)+floor(T*24.)));col+=sc*.6*strip;
 float lx=h1(vec2(floor(T*12.),3.));col+=smoothstep(.003,0.,abs(q.x-lx))*.1*strip*step(.7,h1(vec2(floor(T*12.),9.)));
 col+=vel*.05*step(.5,fract(p.y*40.));tl=.95;}`;
// 4 Na Pele: Manaus no fim de tarde; onda de calor que sobe do chão e se concentra onde o mouse passa
F[4]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 float near=exp(-dot(p-M,p-M)/.05);
 float amt=(.35+(1.-q.y)*.9)+near*3.2;
 vec2 n=vec2(noise(vec2(q.x*9.,q.y*16.-T*1.7)),noise(vec2(q.x*11.+7.,q.y*14.-T*1.3)))-.5;
 vec2 qq=q+n*.011*amt;
 vec3 vc=vcol(qq);vc=(vc-.5)*1.1+.5;vc*=vec3(1.1,.97,.82);
 float glow=exp(-pow((q.y-.58)/.25,2.))*.1;vc+=vec3(1.,.5,.15)*glow;
 vc*=1.-.5*smoothstep(.35,.95,length((q-.5)*vec2(1.15,1.)));
 col=vc;tl=.95;}`;
// 5 Hoje o Dia Nem Veio: lanterna
F[5]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 float L=K.x;float fl=1.+.07*sin(T*23.)+.05*sin(T*7.3+1.)+.06*(noise(vec2(T*9.,1.))-.5);
 float rad=.27*L*fl*(1.+1.3*K.y);vec2 d=p-M;d+=.015*vec2(fbm(p*6.+T),fbm(p*6.-T));
 float li=pow(clamp(1.-length(d)/rad,0.,1.),1.25);
 vec3 vc=vcol(q);float lm=lum(vc);vc=mix(vec3(lm),vc,.55)*vec3(1.1,.95,.8);
 col=vc*li*1.9+vec3(1.,.7,.35)*li*li*.05+vc*.012;
 col*=1.-smoothstep(.45,1.,length(p*vec2(.8,1.)))*.5;tl=li;}`;
// 6 Quebrada Sinistra: o vídeo vira um mosaico de janelas (cores do próprio vídeo, posterizadas); acende onde passa o mouse
F[6]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 vec2 cs=vec2(.04,.054);vec2 gp=p/cs+.5;vec2 cell=floor(gp),f=fract(gp);
 vec2 cq=clamp((cell*cs*Z*R.y+.5*R)/R,0.,1.);float lit=texture2D(X,cq).a;
 vec3 vc=floor(vcol(cq)*4.+.5)/4.;vc=min(vc*1.2,vec3(1.));
 float wx=abs(f.x-.5),wy=abs(f.y-.5);float win=smoothstep(.41,.37,wx)*smoothstep(.43,.39,wy);
 vec3 wallc=vec3(.03,.035,.03)*(.8+.4*fbm(p*10.));
 float base=.3+.7*lit;
 col=mix(wallc,vc*base,win);
 col*=mix(1.,.8+.2*step(.5,fract(f.y*5.)),win*lit);tl=.95;}`;
// 7 Querem Minha Queda: cartaz; vídeo em meio-tom sobre papel, fundo vermelho
F[7]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 float th=K.x;vec2 pv=vec2(0.,-.3);vec2 d=p-pv;float cs=cos(th),sn=sin(th);
 vec2 r=vec2(cs*d.x+sn*d.y,-sn*d.x+cs*d.y);float hh=.58,ww=hh*VA;
 col=vec3(.34,.04,.03)*(.8+.4*fbm(p*2.));col=mix(col,vec3(.02),step(p.y,-.3));
 float bw=.03;
 float inside=step(abs(r.x),ww*.5)*step(0.,r.y)*step(r.y,hh);
 float in2=step(abs(r.x),ww*.5-bw)*step(bw,r.y)*step(r.y,hh-bw);
 float l=ctr(lum(texture2D(V,vec2(r.x/ww+.5,r.y/hh)).rgb),1.5);
 float dt=halft(fc,1.-l,7.*R.y/900.,.4);
 vec3 print=mix(vec3(.93,.9,.82),vec3(.03),dt);
 col=mix(col,vec3(.95,.92,.85),inside);col=mix(col,print,in2);tl=.95;}`;
// 8 Lado Oe$te: serigrafia, cada eco numa tinta
F[8]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 col=vec3(.03,.03,.035);
 for(int j=0;j<8;j++){float fi=float(7-j);vec2 c=HI[7-j]+vec2(.022,-.014)*fi;float hh=.44*(1.+.06*fi),ww=hh*VA;vec2 d=p-c;
  if(abs(d.x)<ww*.5&&abs(d.y)<hh*.5){float l=ctr(lum(texture2D(V,vec2(d.x/ww+.5,d.y/hh+.5)).rgb),1.5);
   float m4=mod(fi,4.);vec3 tint=m4<.5?vec3(1.):(m4<1.5?vec3(0.,.8,1.):(m4<2.5?vec3(1.,.1,.6):vec3(1.,.85,0.)));
   float a=.9-.09*fi;col=1.-(1.-col)*(1.-tint*l*a);}}
 tl=.95;}`;
// 9 Não Tem Outra Vez: piso de xadrez em preto e sangue; casas pisadas viram vídeo P&B duro
F[9]=`void scene(vec2 p,vec2 q,vec2 fc,out vec3 col,out float tl){
 vec2 pp=p*Z;float sq=K.z;vec2 cnt=K.xy;
 vec2 gp=(pp+cnt*sq*.5)/sq;vec2 cell=floor(gp),f=fract(gp);
 float inb=step(0.,cell.x)*step(cell.x,cnt.x-1.)*step(0.,cell.y)*step(cell.y,cnt.y-1.);
 float rev=texture2D(X,(cell+.5)/cnt).a*inb;
 float par=mod(cell.x+cell.y,2.);float l=ctr(lum(vcA(f,1.)),1.7);
 vec3 sqc=mix(vec3(.022),vec3(.3,.035,.03),par)*(.8+.4*fbm(pp*16.));
 sqc*=.9+.1*smoothstep(0.,.5,f.y);
 vec3 vid=mix(vec3(.03,0.,0.),vec3(.94,.9,.82),l)*mix(vec3(1.,.55,.5),vec3(1.),par);
 col=mix(sqc,vid,rev);
 col=mix(vec3(.01),col,inb);
 float ln=smoothstep(.016,.004,min(min(f.x,1.-f.x),min(f.y,1.-f.y)));col=mix(col,vec3(0.),ln*.85*inb);
 col*=1.-.55*smoothstep(.35,.95,length(p*Z*vec2(.8,1.)));tl=.95;}`;

/* ---------- programas ---------- */
function shd(t,s){const o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);if(!g.getShaderParameter(o,g.COMPILE_STATUS))console.error(g.getShaderInfoLog(o));return o;}
function prog(fs){const pr=g.createProgram();g.attachShader(pr,shd(g.VERTEX_SHADER,VS));g.attachShader(pr,shd(g.FRAGMENT_SHADER,fs));g.linkProgram(pr);
 const u={};['R','MU','T','VA','MD','Z','TC','K','HI','V','X','TX','TA','D','SH','P','N','IMP','BR'].forEach(n=>u[n]=g.getUniformLocation(pr,n));pr.u=u;return pr;}
const buf=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buf);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);
const progs=[];function getProg(k){return progs[k]||(progs[k]=prog(HEAD+F[k]+FOOT));}
// muro
const NP=16,SOCOS=16;
const WALL=`precision highp float;
uniform vec2 R,IMP;uniform float T,D,SH,VA,BR;uniform vec2 P[${NP}];uniform int N;uniform sampler2D V;
float h1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
float vor(vec2 p){vec2 gI=floor(p),f=fract(p);float d1=8.,d2=8.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec2 r=o+h2(gI+o)-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
 return sqrt(d2)-sqrt(d1);}
void main(){
 vec2 fc=gl_FragCoord.xy;vec2 p=(fc-.5*R)/R.y;p+=SH*vec2(sin(T*83.),cos(T*97.))*.006;
 float c=fbm(p*3.+4.)*.55+fbm(p*17.)*.3+noise(p*90.)*.15;
 vec3 base=vec3(.115,.112,.108)*(.35+c*1.1);
 float lamp=exp(-dot(p-vec2(.05,.62),p-vec2(.05,.62))*1.6);base*=.45+lamp*1.15;
 base*=1.-smoothstep(.35,.95,length(p*vec2(.8,1.)))*.7;
 base+=vec3(.012,.008,.004)*smoothstep(.6,.9,fbm(p*5.+9.));
 float inf=0.;
 for(int i=0;i<${NP};i++){if(i<N){vec2 d=p-P[i];inf+=exp(-dot(d,d)/(.006+.05*D*D));}}
 inf=min(inf,1.7);
 vec2 w=p+.22*vec2(fbm(p*5.),fbm(p*5.+7.));
 float e1=vor(w*4.),e2=vor(w*13.+3.);
 float l1=1.-smoothstep(0.,.009+.03*D,e1);
 float l2=(1.-smoothstep(0.,.004+.014*D,e2))*smoothstep(.6,1.2,inf);
 float cr=max(l1*smoothstep(.25,.8,inf),l2*.7);
 float glow=(1.-smoothstep(0.,.05+.08*D,e1))*smoothstep(.25,1.,inf)*(.25+.5*D);
 float hole=clamp((D-.8)/.2,0.,1.)*.55;
 float hm=smoothstep(0.,.25,hole*1.7+inf*.5-.85+(fbm(p*5.)-.5)*.7);
 float act=step(.001,BR);
 float dd=length(p-IMP)+(fbm(p*7.)-.5)*.4;float rad=BR*2.4;
 float brk=(1.-smoothstep(rad-.14,rad,dd))*act;float ring=smoothstep(rad+.2,rad,dd)*(1.-brk)*act;
 hm=max(hm,brk);
 vec2 q=fc/R;float ra=R.x/R.y;vec2 vu=q-.5;
 if(ra>VA)vu.y*=VA/ra;else vu.x*=ra/VA;vu+=.5;
 vec3 vc=texture2D(V,vu).rgb;
 vc=mix(vec3(dot(vc,vec3(.3,.59,.11))),vc,.75)*vec3(1.05,.97,.88)*(.55+.45*D);
 vec3 col=base;col*=1.-.55*smoothstep(0.,.05,cr)*(1.-cr);col*=1.-.6*ring;
 col=mix(col,vc,max(cr,hm));col+=vec3(1.,.72,.38)*glow*.42*(1.-brk)+vc*ring*.2;
 col+=(h1(fc+T)-.5)*.05;gl_FragColor=vec4(col,1.);}`;
let wallProg=null;

/* ---------- texturas ---------- */
function mkTex(unit){const t=g.createTexture();g.activeTexture(g.TEXTURE0+unit);g.bindTexture(g.TEXTURE_2D,t);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
 g.texImage2D(g.TEXTURE_2D,0,g.RGBA,1,1,0,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));return t;}
g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);
const tV=mkTex(0),tX=mkTex(1),tTX=mkTex(2),tTA=mkTex(3);
const up=(unit,tex,src)=>{g.activeTexture(g.TEXTURE0+unit);g.bindTexture(g.TEXTURE_2D,tex);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,src);};

/* ---------- letras no tempo, em páginas; tipografia por sala ---------- */
// s = tamanho relativo, up = caixa alta, ls = espaçamento, pos = onde empilha (t topo, b baixo), pg = linhas por página
const FT=[
 {f:'Bebas Neue',s:.062,up:1,ls:.04,pos:'t'},
 {f:'Rock Salt',s:.03,up:0,pos:'t'},
 {f:'Anton',s:.05,up:1,ls:.03,pos:'b',pg:2},
 {f:'Courier Prime',w:700,s:.04,up:0,pos:'b',pg:2},
 {f:'Cinzel',w:600,s:.04,up:1,ls:.06,pos:'b',pg:2},
 {f:'Permanent Marker',s:.045,up:0,pos:'t'},
 {f:'Stardos Stencil',s:.05,up:1,ls:.03,pos:'t'},
 {f:'Bowlby One',s:.042,up:1,ls:.02,pos:'t'},
 {f:'Rubik Mono One',s:.036,up:1,pos:'t'},
 {f:'Abril Fatface',s:.06,up:0,pos:'t'}];
const TCOL=[[.95,.92,.84],[.93,.17,.1],[.97,.79,.1],[.95,.92,.84],[1,.94,.82],[.95,.92,.84],[.95,.92,.84],[.96,.93,.86],[.95,.92,.84],[.95,.92,.84]].map(a=>new Float32Array(a));
const cv=document.createElement('canvas'),cx=cv.getContext('2d'),cw=document.createElement('canvas'),cy=cw.getContext('2d');
let sig='',lay=null,laySig='';
const fonte=(ft,fs)=>(ft.w||400)+' '+fs+'px "'+ft.f+'",Impact,sans-serif';
function quebrar(c,txt,maxw){
 const ws=txt.split(' '),n=ws.length,memo={};
 const wd=(i,j)=>{const k=i+'_'+j;return memo[k]||(memo[k]=c.measureText(ws.slice(i,j).join(' ')).width);};
 if(wd(0,n)<=maxw)return [txt];
 const dp=lim=>{const best=Array(n+1).fill(Infinity),prev=Array(n+1).fill(0);best[0]=0;
  for(let j=1;j<=n;j++)for(let i=0;i<j;i++){const w=wd(i,j);if(w>lim&&j-i>1)continue;
   let cost=(j===n)?Math.pow(Math.max(0,.5*lim-w)/lim,2)*.6:Math.pow((lim-w)/lim,2);
   if(j-i===1&&n>2){if(j===n)cost+=1.2;else if(ws[i].length<4)cost+=.5;}
   if(j-i<=2&&j!==n&&n>4)cost+=.15;
   cost+=.05;if(best[i]+cost<best[j]){best[j]=best[i]+cost;prev[j]=i;}}
  const rows=[];let j=n;while(j>0){const i=prev[j];rows.unshift(ws.slice(i,j).join(' '));j=i;}return rows;};
 let rows=dp(maxw);
 if(rows.length>1){const alvo=Math.min(maxw,wd(0,n)/rows.length*1.18);const r2=dp(alvo);if(r2.length<=rows.length)rows=r2;}
 return rows;
}
function layoutPagina(pg){
 const ft=FT[cur],L=C[cur].linhas,PG=ft.pg||5,c=cx;
 let fs=ft.s*Math.max(Math.min(W,H*1.4),W*.45)*dpr*(W<700?1.28:1);const maxw=cv.width*(W<H?.88:.74);
 let blocks,lh,gap,tot;
 for(let tent=0;tent<5;tent++){
  c.save();c.font=fonte(ft,fs);if('letterSpacing' in c)c.letterSpacing=((ft.ls||0)*fs)+'px';
  blocks=[];for(let i=pg*PG;i<Math.min(L.length,(pg+1)*PG);i++){const tx=ft.up?L[i].t.toUpperCase():L[i].t;blocks.push({i,tx,rows:quebrar(c,tx,maxw)});}
  c.restore();
  lh=fs*1.18;gap=fs*.6;tot=blocks.reduce((s,b)=>s+b.rows.length*lh,0)+gap*Math.max(0,blocks.length-1);
  if(tot<=cv.height*(W<700?.5:.66))break;fs*=.88;
 }
 let y=ft.pos==='b'?cv.height*(W<700?.7:.84)-tot:cv.height*.14;
 blocks.forEach((b,k)=>{b.y=y;b.h=b.rows.length*lh;y+=b.h+gap;b.xc=cv.width*(.5+(k%2?.025:-.025))*(1);b.rot=((k%3)-1)*.012;});
 return {fs,lh,blocks,ft};
}
function linha(c,b,prog,Ly){
 const ft=Ly.ft,fs=Ly.fs;c.save();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';
 c.font=fonte(ft,fs);if('letterSpacing' in c)c.letterSpacing=((ft.ls||0)*fs)+'px';
 const total=b.tx.length||1;let start=0;const mg=cv.width*.05;
 b.rows.forEach((row,j)=>{
  const w=c.measureText(row).width,pad=fs*.5;
  const xc=Math.min(cv.width-mg-w/2-pad,Math.max(mg+w/2+pad,b.xc));
  const yc=b.y+(j+.5)*Ly.lh;const pr=prog>=1?1:Math.max(0,Math.min(1,(prog*total-start)/Math.max(1,row.length)));start+=row.length+1;
  if(pr<=0)return;
  c.save();c.translate(xc,yc);c.rotate(b.rot);
  c.beginPath();c.rect(-w/2-pad,-fs,w*pr+pad+(pr>=1?pad:0),fs*2);c.clip();c.fillText(row,0,0);c.restore();
 });
 c.restore();
}
function progDe(l,t){const k=l.k;if(!k)return Math.min(1,(t-l.a)/((l.b-l.a)*.85));
 if(t<=k[0][0])return 0;for(let j=0;j<k.length-1;j++){if(t<k[j+1][0]){const d=k[j+1][0]-k[j][0]||1e-6;return k[j][1]+(k[j+1][1]-k[j][1])*(t-k[j][0])/d;}}return 1;}
function letras(force){
 const L=C[cur].linhas;
 if(!L.length){if(sig!=='-'||force){sig='-';cx.clearRect(0,0,cv.width,cv.height);cy.clearRect(0,0,cw.width,cw.height);up(2,tTX,cv);up(3,tTA,cw);}return;}
 const t=vid.currentTime||0;let done=[],act=-1,prog=0;
 L.forEach((l,i)=>{if(t>=l.b)done.push(i);else if(t>=l.a){act=i;prog=progDe(l,t);}});
 const PG=FT[cur].pg||5;const refi=act>=0?act:(done.length?done[done.length-1]:0);const pgi=Math.floor(refi/PG);
 done=done.filter(i=>Math.floor(i/PG)===pgi);
 const sg=cur+'|'+done.join(',')+'|'+(act>=0?act+':'+Math.round(prog*80):'-')+'|'+W+'x'+H;
 if(sg===sig&&!force)return;sig=sg;
 const ls=cur+'|'+pgi+'|'+W+'x'+H;if(ls!==laySig||force){lay=layoutPagina(pgi);laySig=ls;}
 cx.clearRect(0,0,cv.width,cv.height);cy.clearRect(0,0,cw.width,cw.height);
 lay.blocks.forEach(b=>{if(done.includes(b.i))linha(cx,b,1,lay);else if(b.i===act)linha(cy,b,prog,lay);});
 up(2,tTX,cv);up(3,tTA,cw);
}

/* ---------- áudio ---------- */
let ac,filt,mg,started=false,vol=.8,mudo=false;
const IC={play:'<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',vol:'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9zM15 8a5 5 0 010 8M17.5 5.5a9 9 0 010 13" stroke="currentColor" stroke-width="1.8" fill-rule="nonzero" stroke-linecap="round"/></svg>',mute:'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M15 9l6 6M21 9l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'};
function ui(){pp.innerHTML=(started&&!vid.paused)?IC.pause:IC.play;mu.innerHTML=(mudo||vol==0)?IC.mute:IC.vol;if(mg)mg.gain.value=mudo?0:vol;}
function iniciar(){
 if(started)return;started=true;
 try{ac=new (window.AudioContext||window.webkitAudioContext)();
  const src=ac.createMediaElementSource(vid);filt=ac.createBiquadFilter();filt.type='lowpass';filt.frequency.value=wallOn?260:20000;filt.Q.value=.7;
  mg=ac.createGain();src.connect(filt);filt.connect(mg);mg.connect(ac.destination);}catch(e){}
 if(cover<.3)vid.play().catch(()=>{});ui();
}
function thud(){
 if(!ac)return;const t=ac.currentTime;
 const o=ac.createOscillator(),gn=ac.createGain();o.frequency.setValueAtTime(95,t);o.frequency.exponentialRampToValueAtTime(32,t+.22);
 gn.gain.setValueAtTime(.9,t);gn.gain.exponentialRampToValueAtTime(.001,t+.28);o.connect(gn);gn.connect(mg);o.start(t);o.stop(t+.3);
 const nb=ac.createBuffer(1,ac.sampleRate*.25,ac.sampleRate),d=nb.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
 const ns=ac.createBufferSource(),nf=ac.createBiquadFilter(),ng=ac.createGain();ns.buffer=nb;nf.type='lowpass';nf.frequency.value=900;ng.gain.value=.5;
 ns.connect(nf);nf.connect(ng);ng.connect(mg);ns.start(t);
}
function crash(){
 if(!ac)return;const t=ac.currentTime;
 const nb=ac.createBuffer(1,ac.sampleRate*1.6,ac.sampleRate),d=nb.getChannelData(0);
 for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
 const ns=ac.createBufferSource(),nf=ac.createBiquadFilter(),ng=ac.createGain();ns.buffer=nb;nf.type='lowpass';nf.frequency.setValueAtTime(5000,t);nf.frequency.exponentialRampToValueAtTime(300,t+1.5);
 ns.connect(nf);nf.connect(ng);ng.connect(mg);ns.start(t);
 const o=ac.createOscillator(),gn=ac.createGain();o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(24,t+.7);
 gn.gain.setValueAtTime(1,t);gn.gain.exponentialRampToValueAtTime(.001,t+.8);o.connect(gn);gn.connect(mg);o.start(t);o.stop(t+.9);
}
function tom(f){if(filt)filt.frequency.value+=(Math.min(20000,f)-filt.frequency.value)*.08;}
let manualPause=false;
pp.addEventListener('click',()=>{if(!started){iniciar();}else if(vid.paused){manualPause=false;vid.play();}else{manualPause=true;vid.pause();}});
vid.addEventListener('play',ui);vid.addEventListener('pause',ui);
mu.addEventListener('click',()=>{iniciar();mudo=!mudo;ui();});
vo.addEventListener('input',()=>{vol=+vo.value;mudo=false;ui();});
let vA=16/9;vid.addEventListener('loadedmetadata',()=>{if(vid.videoWidth)vA=vid.videoWidth/vid.videoHeight;});

/* ---------- ponteiro ---------- */
let pm=[0,0],Ms=[0,0],down=false,lastRaw=null,hasPtr=false,mv=[0,0],dn=null;
const toP=(x,y)=>[(x-W/2)/H,(H/2-y)/H];
gl.addEventListener('pointermove',e=>{pm=toP(e.clientX,e.clientY);if(!hasPtr){Ms=pm.slice();hasPtr=true;}
 const d=lastRaw?[e.clientX-lastRaw[0],e.clientY-lastRaw[1]]:[0,0];lastRaw=[e.clientX,e.clientY];mv=d;onMove(e.clientX,e.clientY,d[0],d[1]);});
gl.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')e.preventDefault();iniciar();pm=toP(e.clientX,e.clientY);if(!hasPtr||e.pointerType!=='mouse'){Ms=pm.slice();hasPtr=true;}
 down=true;lastRaw=[e.clientX,e.clientY];dn={x:e.clientX,y:e.clientY,t:performance.now(),mov:0};onDown(e.clientX,e.clientY);});
const fimP=()=>{if(dn&&dn.mov<=8&&performance.now()-dn.t<400)onClick(dn.x,dn.y);dn=null;down=false;onUp();};
gl.addEventListener('pointerup',fimP);gl.addEventListener('pointercancel',()=>{dn=null;down=false;onUp();});
gl.addEventListener('pointerleave',()=>{lastRaw=null;});

/* ---------- muro (entrada) ---------- */
const txt=document.createElement('canvas'),msk=document.createElement('canvas');
const ox=ov.getContext('2d'),tx=txt.getContext('2d'),mx=msk.getContext('2d');
let wallOn=true,broken=false,socos=0,Dw=0,Dv=0,SHK=0,dirtyW=true;const pts=[];
function versosMuro(){
 tx.clearRect(0,0,txt.width,txt.height);tx.fillStyle='#e9e2d0';tx.textAlign='center';tx.textBaseline='middle';tx.shadowColor='rgba(233,226,208,.5)';tx.shadowBlur=3*dpr;
 const V=[['o tempo passa',.5,.3,.07],['os sonhos ficam para trás',.5,.5,.075],['a esperança morta',.5,.7,.07]];
 V.forEach((v,i)=>{tx.save();tx.translate(v[1]*txt.width,v[2]*txt.height);tx.rotate((i-1)*.035);
  let fs=v[3]*Math.max(Math.min(W,H*1.4),W*.5)*dpr;const Fn=()=>fs+'px "Permanent Marker",Impact,sans-serif';tx.font=Fn();
  const maxw=txt.width*.8,mw=tx.measureText(v[0]).width;if(mw>maxw){fs*=maxw/mw;tx.font=Fn();}tx.fillText(v[0],0,0);tx.restore();});
 mx.clearRect(0,0,msk.width,msk.height);dirtyW=true;
}
function riscar(x0,y0,x1,y1){
 mx.strokeStyle='#fff';mx.lineCap='round';mx.lineJoin='round';const base=Math.max(60,Math.min(W,H)*.13)*dpr;
 for(let k=0;k<3;k++){mx.lineWidth=base*(k?.45:1);const j=k?(Math.random()-.5)*base*.5:0;mx.beginPath();mx.moveTo(x0*dpr+j,y0*dpr+j);mx.lineTo(x1*dpr+j,y1*dpr+j);mx.stroke();}
 dirtyW=true;
}
function soco(x,y){
 if(broken)return;iniciar();thud();
 const p=[(x-W/2)/H,(H/2-y)/H];if(pts.length<NP)pts.push(p);else pts[socos%NP]=p;
 socos++;Dw=Math.min(1,socos/SOCOS);SHK=1;barra.style.width=(Dw*100)+'%';dica.style.opacity=0;
 if(navigator.vibrate)navigator.vibrate(25);
 if(socos>=SOCOS){broken=true;crash();barra.style.opacity=0;iniciarQuebra();destravar();SHK=3;}
}
let breaking=false,tBreak=0,debris=[],dust=[],imp=[0,0];
function iniciarQuebra(){
 breaking=true;tBreak=performance.now();const last=pts[(socos-1)%NP]||[0,0];imp=last.slice();
 const ix=(last[0]*H+W/2)*dpr,iy=(H/2-last[1]*H)*dpr;debris=[];dust=[];
 for(let i=0;i<190;i++){
  const ang=Math.random()*6.283,sp=(250+Math.random()*1500)*dpr*(Math.random()<.18?1.5:1);
  const n=5+Math.floor(Math.random()*4),r=(9+Math.random()*30)*dpr*(Math.random()<.12?2:1),pl=[];
  for(let k=0;k<n;k++){const a2=k/n*6.283+Math.random()*.7,rr=r*(.5+Math.random()*.65);pl.push([Math.cos(a2)*rr,Math.sin(a2)*rr]);}
  const d0=Math.random()*H*.16*dpr,a0=Math.random()*6.283;
  debris.push({x:ix+Math.cos(a0)*d0,y:iy+Math.sin(a0)*d0,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-380*dpr,sp:(Math.random()-.5)*9,pl,c:34+Math.random()*80|0,dl:Math.random()*.25});
 }
 for(let i=0;i<30;i++){const a0=Math.random()*6.283,d0=Math.random()*H*.22*dpr;dust.push({x:ix+Math.cos(a0)*d0,y:iy+Math.sin(a0)*d0,r:(50+Math.random()*90)*dpr,g:(260+Math.random()*320)*dpr,a:.16+Math.random()*.16,dl:Math.random()*.3,vy:-(20+Math.random()*60)*dpr});}
}
function desenharDebris(){
 const sx=shc.getContext('2d');sx.clearRect(0,0,shc.width,shc.height);if(!debris.length)return;
 const t=(performance.now()-tBreak)/1000,G=2700*dpr;let vivo=false;
 for(const d of dust){const tt=t-d.dl;if(tt<=0)continue;const a=d.a*Math.max(0,1-tt/1.9);if(a<=0)continue;vivo=true;
  const r=d.r+d.g*tt,y=d.y+d.vy*tt,gr=sx.createRadialGradient(d.x,y,0,d.x,y,r);gr.addColorStop(0,'rgba(135,132,125,'+a+')');gr.addColorStop(1,'rgba(135,132,125,0)');sx.fillStyle=gr;sx.fillRect(d.x-r,y-r,2*r,2*r);}
 for(const d of debris){const tt=t-d.dl;if(tt<=0)continue;const a=1-Math.min(1,Math.max(0,(tt-1.1)/1.1));if(a<=0)continue;vivo=true;
  const x=d.x+d.vx*tt,y=d.y+d.vy*tt+.5*G*tt*tt,k=1+tt*.7;
  sx.save();sx.globalAlpha=a;sx.translate(x,y);sx.rotate(d.sp*tt);sx.scale(k,k);
  sx.beginPath();sx.moveTo(d.pl[0][0],d.pl[0][1]);for(let i=1;i<d.pl.length;i++)sx.lineTo(d.pl[i][0],d.pl[i][1]);sx.closePath();
  sx.fillStyle='rgb('+d.c+','+d.c+','+(d.c-3)+')';sx.fill();
  sx.lineWidth=1.5*dpr;sx.strokeStyle='rgba(0,0,0,.45)';sx.stroke();
  sx.beginPath();sx.moveTo(d.pl[0][0]*.6,d.pl[0][1]*.6);sx.lineTo(d.pl[1][0]*.6,d.pl[1][1]*.6);sx.strokeStyle='rgba(255,255,255,.14)';sx.stroke();
  sx.restore();}
 if(!vivo){debris=[];dust=[];sx.clearRect(0,0,shc.width,shc.height);}
}
function destravar(){document.documentElement.classList.remove('travado');document.body.classList.add('livre');setTimeout(()=>{dica.textContent=matchMedia('(pointer:coarse)').matches?'use as setas ou a borda esquerda':'rola pra baixo';dica.style.opacity=.9;setTimeout(()=>dica.style.opacity=0,3800);},1800);}

/* ---------- estado das cenas ---------- */
const mk=document.createElement('canvas'),mc=mk.getContext('2d');
let cur=0,cover=0,SK=[0,0,0,.45];
const S={};
const sceneDefs=[];
let introOnce=false;
sceneDefs[0]={setup(){S.intro=introOnce;S.introT=performance.now();introOnce=false;},tick(){SK[2]=S.intro?Math.min(1,(performance.now()-S.introT)/1700):1;}};
sceneDefs[1]={setup(){mk.width=Math.ceil(W/4);mk.height=Math.ceil(H/4);mc.clearRect(0,0,mk.width,mk.height);},
 tick(dt){mc.globalCompositeOperation='destination-out';mc.fillStyle='rgba(0,0,0,.012)';mc.fillRect(0,0,mk.width,mk.height);mc.globalCompositeOperation='source-over';
  if(hasPtr&&(Math.abs(mv[0])+Math.abs(mv[1])>1)){const x=(Ms[0]*H+W/2)/4,y=(H/2-Ms[1]*H)/4,r=H*.17/4;const gr=mc.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.28)');gr.addColorStop(1,'rgba(255,255,255,0)');mc.fillStyle=gr;mc.fillRect(x-r,y-r,2*r,2*r);}
  up(1,tX,mk);mv=[mv[0]*.5,mv[1]*.5];}};
sceneDefs[2]={setup(){S.th=0;},
 tick(dt){const alvo=(hasPtr?-Ms[0]*.16:0)+.025*Math.sin(performance.now()/1000*.5);S.th+=(alvo-S.th)*.06;SK[0]=S.th;}};
sceneDefs[3]={setup(){SK[0]=0;S.off=0;S.v=0;S.drag=false;},
 tick(dt){S.off+=dt*.12+S.v;SK[0]=S.off;SK[1]=Math.min(1,Math.abs(S.v)*40);S.v*=.9;},
 down(){S.drag=true;vid.pause();},up(){if(S.drag){S.drag=false;if(started&&!manualPause)vid.play().catch(()=>{});}},
 move(x,y,dx){if(S.drag){S.v-=dx/H*.5;vid.currentTime=Math.max(0,Math.min((vid.duration||40)-.05,vid.currentTime+dx/W*14));}}};
sceneDefs[4]={setup(){},tick(){}};
sceneDefs[5]={setup(){S.L=0;},
 tick(dt){S.L+=((hasPtr?1:0)-S.L)*.06;S.big=(S.big||0)+((down?1:0)-(S.big||0))*(down?.1:.05);SK[0]=S.L;SK[1]=S.big;SK[3]=.3;const vel=Math.hypot(mv[0],mv[1]);tom(500+Math.min(1,vel/30)*6000);mv=[mv[0]*.9,mv[1]*.9];}};
sceneDefs[6]={setup(){S.lit={};mk.width=Math.ceil(W/8);mk.height=Math.ceil(H/8);},
 tick(){const Z=Zf(),cwp=.04*H*Z,chp=.054*H*Z;
  if(hasPtr){const cxn=Math.round((Ms[0]*H)/cwp),cyn=Math.round((Ms[1]*H)/chp);
   for(let a=-5;a<=5;a++)for(let b=-5;b<=5;b++){const k=(cxn+a)+','+(cyn+b);const v=Math.max(0,1-Math.hypot(a,b)*.2);if((S.lit[k]||0)<v)S.lit[k]=v;}}
  mc.clearRect(0,0,mk.width,mk.height);
  for(const k in S.lit){const v=S.lit[k]=S.lit[k]*.9935;if(v<.01){delete S.lit[k];continue;}const [a,b]=k.split(',').map(Number);
   const px=(W/2+a*cwp)/8,py=(H/2-b*chp)/8;mc.fillStyle='rgba(255,255,255,'+v+')';mc.fillRect(px-1.5,py-1.5,3,3);}
  up(1,tX,mk);}};
sceneDefs[7]={setup(){S.th=0;S.om=0;},
 tick(dt){dt=Math.min(dt,.05);if(down)S.om+=mv[0]/H*3;mv=[mv[0]*.6,mv[1]*.6];S.om+=(-16*S.th-2.4*S.om+.9*Math.sin(performance.now()/1000*.8))*dt;S.th+=S.om*dt;
  if(Math.abs(S.th)>1.1){S.th=Math.sign(S.th)*1.1;S.om*=-.45;}SK[0]=S.th;}};
sceneDefs[8]={setup(){S.h=[];for(let i=0;i<8;i++)S.h.push([0,0]);S.t=0;S.arr=new Float32Array(16);},
 tick(dt){S.t+=dt;if(S.t>.07){S.t=0;S.h.pop();S.h.unshift(Ms.slice());}S.h[0]=Ms.slice();const Z=Zf();for(let i=0;i<8;i++){S.arr[i*2]=S.h[i][0]/Z;S.arr[i*2+1]=S.h[i][1]/Z;}}};
// 9 xadrez: o cavalo só pisa em L; qualquer outro toque rompe a casa pra sempre ("pisou em falso, não tem outra vez")
const KP=new Path2D('M20 94 L20 84 L31 70 L34 58 L18 54 L8 46 L10 36 L22 22 L26 6 L38 18 L58 16 L74 36 L82 60 L86 80 L86 94 Z');
const KF1=new Path2D('M38 18 L58 16 L74 36 L60 60 L34 58 Z'),KF2=new Path2D('M34 58 L60 60 L86 80 L86 94 L20 94 L20 84 L31 70 Z');
function cavalo(c,x,y,sz){c.save();c.translate(x-sz*.5,y-sz*.58);c.scale(sz/100,sz/100);c.lineJoin='miter';c.miterLimit=3;
 c.save();c.translate(6,6);c.fillStyle='#a31a14';c.fill(KP);c.restore();
 c.fillStyle='#f3ecd9';c.fill(KP);c.fillStyle='#d9cfb6';c.fill(KF1);c.fillStyle='#bfb397';c.fill(KF2);
 c.lineWidth=3;c.strokeStyle='#0a0908';c.stroke(KP);c.lineWidth=1.6;c.stroke(KF1);c.stroke(KF2);
 c.fillStyle='#0a0908';c.beginPath();c.moveTo(19,34);c.lineTo(29,31);c.lineTo(24,38);c.closePath();c.fill();
 c.fillRect(10,41,6,2.6);c.fillRect(14,92,78,8);c.restore();}
sceneDefs[9]={setup(){const ra=W/H;if(ra<1.1){S.cols=5;S.sq=ra/5;S.rows=Math.ceil(1/S.sq);}else{S.sq=.17;S.cols=Math.max(3,Math.ceil(ra/S.sq));S.rows=5;}if(S.cols%2==0)S.cols++;if(S.rows%2==0)S.rows++;
  mk.width=S.cols;mk.height=S.rows;S.rev=new Float32Array(S.cols*S.rows);S.vz=new Float32Array(S.cols*S.rows);
  S.k=[(S.cols-1)/2,(S.rows-1)/2];S.rev[S.k[1]*S.cols+S.k[0]]=1;S.cnt=1;S.kt=1;S.from=S.k.slice();S.mate=0;S.shake=0;},
 tick(dt){const c=S.cols,r=S.rows;
  if(S.mate){S.mate=Math.min(1.6,S.mate+dt*.7);for(let i=0;i<c*r;i++){if(S.vz[i])continue;const cy_=Math.floor(i/c),cx_=i%c;if(S.mate*3>Math.hypot(cx_-S.k[0],cy_-S.k[1])*.5)S.rev[i]=Math.max(S.rev[i],.001);}}
  for(let i=0;i<c*r;i++){if(S.rev[i]>0&&S.rev[i]<1)S.rev[i]=Math.min(1,S.rev[i]+dt*2.5);if(S.vz[i]>0&&S.vz[i]<1)S.vz[i]=Math.min(1,S.vz[i]+dt*2.2);}
  mc.clearRect(0,0,c,r);for(let i=0;i<c*r;i++){const v=S.rev[i];if(v>.01){mc.fillStyle='rgba(255,255,255,'+v+')';mc.fillRect(i%c,r-1-Math.floor(i/c),1,1);}}
  up(1,tX,mk);SK[0]=c;SK[1]=r;SK[2]=S.sq;S.kt=Math.min(1,S.kt+dt*2.5);S.shake=Math.max(0,S.shake-dt*3);
  const o=ov.getContext('2d');o.clearRect(0,0,ov.width,ov.height);
  const sqp=S.sq*H*dpr,px=cc=>ov.width/2+(cc-c/2+.5)*sqp,py=rr=>ov.height/2-(rr-r/2+.5)*sqp;
  // casas rompidas: viram vazio com rachaduras que somem
  for(let i=0;i<c*r;i++){const v=S.vz[i];if(v<=0)continue;const cc=i%c,rr=Math.floor(i/c),x=px(cc),y=py(rr);
   o.fillStyle='rgba(0,0,0,'+Math.min(1,v*1.6)+')';o.fillRect(x-sqp/2,y-sqp/2,sqp,sqp);
   if(v<1){o.strokeStyle='rgba(243,236,217,'+(1-v)+')';o.lineWidth=2*dpr;o.beginPath();for(let k=0;k<5;k++){const a=(i*7+k*1.3)%6.283;o.moveTo(x,y);o.lineTo(x+Math.cos(a)*sqp*.5,y+Math.sin(a)*sqp*.5);}o.stroke();}
   else{o.strokeStyle='rgba(120,20,14,.7)';o.lineWidth=2*dpr;o.strokeRect(x-sqp/2+3*dpr,y-sqp/2+3*dpr,sqp-6*dpr,sqp-6*dpr);}}
  const e=S.kt*S.kt*(3-2*S.kt);let kx=px(S.from[0]+(S.k[0]-S.from[0])*e),ky=py(S.from[1]+(S.k[1]-S.from[1])*e)-Math.sin(e*Math.PI)*sqp*.45;kx+=Math.sin(S.shake*40)*S.shake*8*dpr;
  cavalo(o,kx,ky,sqp*1.35);
  if(S.mate){o.font='400 '+(.11*Math.min(H,W*1.3)*dpr)+'px "Abril Fatface",Impact,serif';o.textAlign='center';o.textBaseline='middle';o.fillStyle='rgba(243,236,217,'+Math.min(1,S.mate*1.4)+')';o.shadowColor='#000';o.shadowBlur=20*dpr;o.fillText('xeque-mate',ov.width/2,ov.height*.5);o.shadowBlur=0;}},
 click(x,y){if(S.mate)return;const sqc=S.sq*H,c=S.cols,r=S.rows;const col=Math.floor((x-W/2)/sqc+c/2),row=Math.floor(r/2-(y-H/2)/sqc);
  if(col<0||col>=c||row<0||row>=r)return;const i=row*c+col;if(S.vz[i]>0||(col===S.k[0]&&row===S.k[1]))return;
  const dx=Math.abs(col-S.k[0]),dy=Math.abs(row-S.k[1]);
  if(dx*dy===2){S.from=S.k.slice();S.k=[col,row];S.kt=0;thud();if(S.rev[i]<.5){S.rev[i]=.001;S.cnt++;if(S.cnt>=20)S.mate=.01;}}
  else{if(S.rev[i]<.5){S.vz[i]=.001;thud();}S.shake=1;}}};
function onDown(x,y){const d=sceneDefs[cur];if(!wallOn&&d&&d.down)d.down(x,y);}
function onMove(x,y,dx,dy){if(dn)dn.mov+=Math.hypot(dx,dy);
 if(wallOn){if(down&&!broken&&dn&&dn.mov>8)riscar(x-dx,y-dy,x,y);return;}
 const d=sceneDefs[cur];if(d&&d.move)d.move(x,y,dx,dy);}
function onUp(){const d=sceneDefs[cur];if(!wallOn&&d&&d.up)d.up();}
function onClick(x,y){if(wallOn){soco(x,y);return;}const d=sceneDefs[cur];if(d&&d.click)d.click(x,y);}

/* ---------- cena atual ---------- */
const tt=$('tt'),yt=$('yt');
function setScene(k){
 cur=k;sig='';laySig='';const c=C[k];
 vid.src=c.clip;vid.load();{const mt=c.titulo.match(/^(.*?)\s*(\(.*\))\s*$/),esc=x=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;');tt.innerHTML=mt?esc(mt[1])+'<span class="col"> '+esc(mt[2])+'</span>':esc(c.titulo);}yt.href=c.yt;
 $('sobe').style.display=(k===N-1)?'block':'none';
 mk.width=mk.height=1;mc.clearRect(0,0,1,1);up(1,tX,mk);ov.getContext('2d').clearRect(0,0,ov.width,ov.height);
 SK=[0,0,0,.45];mv=[0,0];
 if(sceneDefs[k]&&sceneDefs[k].setup)sceneDefs[k].setup();
 if(filt)filt.frequency.value=(k===5)?500:20000;
 letras(true);
}
$('sobe').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
$('logo').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
addEventListener('keydown',e=>{if(document.documentElement.classList.contains('travado'))return;const k=e.key;
 if(k==='ArrowDown'||k==='PageDown'||(k===' '&&!e.shiftKey)){e.preventDefault();scrollTo({top:Math.min(N-1,cur+1)*H,behavior:'smooth'});}
 else if(k==='ArrowUp'||k==='PageUp'||(k===' '&&e.shiftKey)){e.preventDefault();scrollTo({top:Math.max(0,cur-1)*H,behavior:'smooth'});}
 else if(k==='Home')scrollTo({top:0,behavior:'smooth'});else if(k==='End')scrollTo({top:(N-1)*H,behavior:'smooth'});});
$('sUp').addEventListener('click',()=>scrollTo({top:Math.max(0,cur-1)*H,behavior:'smooth'}));
$('sDown').addEventListener('click',()=>scrollTo({top:Math.min(N-1,cur+1)*H,behavior:'smooth'}));

/* ---------- transição entre salas: escurece no ritmo da rolagem e mostra o título do próximo trabalho ---------- */
const sx2=slab.getContext('2d');let lastCover=0,wantS=0;
const sm01=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
function desenharLaje(cov){
 if(cov<=0.001){if(lastCover>0.001)sx2.clearRect(0,0,slab.width,slab.height);lastCover=cov;return;}
 lastCover=cov;sx2.clearRect(0,0,slab.width,slab.height);
 sx2.fillStyle='rgba(3,3,3,'+Math.min(1,cov*1.25)+')';sx2.fillRect(0,0,slab.width,slab.height);
 const a=sm01(.42,.95,cov);if(a<=0.01)return;
 const ft=FT[wantS],tcurto=C[wantS].titulo.replace(/\s*\(.*\)\s*$/,''),tx0=ft.up?tcurto.toUpperCase():tcurto;
 let fs=.07*Math.max(Math.min(W,H*1.4),W*.45)*dpr;sx2.save();sx2.font=fonte(ft,fs);if('letterSpacing' in sx2)sx2.letterSpacing=((ft.ls||0)*fs+fs*.04)+'px';
 const mw=slab.width*.84;let w=sx2.measureText(tx0).width;if(w>mw){fs*=mw/w;sx2.font=fonte(ft,fs);w=sx2.measureText(tx0).width;}
 sx2.textAlign='center';sx2.textBaseline='middle';sx2.fillStyle='rgba(243,236,217,'+a+')';sx2.fillText(tx0,slab.width/2,slab.height*.5);
 const lw=w*sm01(.55,1,cov);sx2.fillStyle='rgba(255,70,50,'+a+')';sx2.fillRect(slab.width/2-lw/2,slab.height*.5+fs*.72,lw,Math.max(2,2*dpr));sx2.restore();
}

/* ---------- loop ---------- */
function resize(){W=innerWidth;H=innerHeight;
 for(const c of [gl,shc,ov,slab,cv,cw,txt,msk]){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);}
 g.viewport(0,0,gl.width,gl.height);versosMuro();sig='';laySig='';if(sceneDefs[cur]&&sceneDefs[cur].setup&&!wallOn)sceneDefs[cur].setup();letras(true);}
addEventListener('resize',resize);
let tPrev=0,prevCover=0;
function frame(ts){
 const T=ts/1000,dt=Math.min(.05,(ts-tPrev)/1000||.016);tPrev=ts;
 const p=Math.max(0,Math.min(N-1,scrollY/H)),i=Math.floor(p+1e-4),f=p-i;
 let want=i,cov=0;
 if(i<N-1&&f>.001){cov=f<.5?f/.5:(1-f)/.5;want=f<.5?i:i+1;}
 cov=Math.min(1,cov);
 wantS=want;if(want!==cur)setScene(want);
 cover=cov;
 prevCover=cov;
 if(started){if(cov>.4&&!vid.paused)vid.pause();else if(cov<.12&&vid.paused&&!(cur===3&&S.drag)&&!manualPause)vid.play().catch(()=>{});}
 Ms[0]+=(pm[0]-Ms[0])*.14;Ms[1]+=(pm[1]-Ms[1])*.14;
 SHK*=.9;
 stage.style.transform=SHK>.02?`translate(${(Math.sin(T*83)*SHK*5).toFixed(1)}px,${(Math.cos(T*97)*SHK*5).toFixed(1)}px)`:'';
 if(vid.readyState>=2){g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,tV);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,vid);}
 if(wallOn){
  Dv+=(Dw-Dv)*.08;if(filt)filt.frequency.value=breaking?20000:260*Math.pow(2,Dv*5.4);
  if(!wallProg)wallProg=prog(WALL);const P=wallProg,u=P.u;g.useProgram(P);
  const vl=g.getAttribLocation(P,'a');g.enableVertexAttribArray(vl);g.bindBuffer(g.ARRAY_BUFFER,buf);g.vertexAttribPointer(vl,2,g.FLOAT,false,0,0);
  const BRv=breaking?Math.min(1,(performance.now()-tBreak)/1150):0;
  g.uniform2f(u.R,gl.width,gl.height);g.uniform2f(u.IMP,imp[0],imp[1]);g.uniform1f(u.BR,BRv);g.uniform1f(u.T,T);g.uniform1f(u.D,Dv);g.uniform1f(u.SH,SHK);g.uniform1f(u.VA,vA);g.uniform1i(u.V,0);
  const flat=new Float32Array(NP*2);pts.forEach((q,k)=>{flat[k*2]=q[0];flat[k*2+1]=q[1];});g.uniform2fv(u.P,flat);g.uniform1i(u.N,pts.length);
  g.drawArrays(g.TRIANGLES,0,3);
  if(breaking&&BRv>=1){wallOn=false;breaking=false;introOnce=true;if(filt)filt.frequency.value=20000;ov.getContext('2d').clearRect(0,0,ov.width,ov.height);setScene(0);}
  if(dirtyW){const o=ov.getContext('2d');o.globalCompositeOperation='source-over';o.clearRect(0,0,ov.width,ov.height);o.drawImage(txt,0,0);o.globalCompositeOperation='destination-in';o.drawImage(msk,0,0);o.globalCompositeOperation='source-over';dirtyW=false;}
 }else{
  const d=sceneDefs[cur];if(d&&d.tick)d.tick(dt);
  letras(false);
  const P=getProg(cur),u=P.u;g.useProgram(P);
  const vl=g.getAttribLocation(P,'a');g.enableVertexAttribArray(vl);g.bindBuffer(g.ARRAY_BUFFER,buf);g.vertexAttribPointer(vl,2,g.FLOAT,false,0,0);
  g.uniform2f(u.R,gl.width,gl.height);g.uniform2f(u.MU,Ms[0],Ms[1]);g.uniform1f(u.T,T);g.uniform1f(u.VA,vA);g.uniform1f(u.MD,down?1:0);g.uniform1f(u.Z,Zf());
  g.uniform3fv(u.TC,TCOL[cur]);g.uniform4f(u.K,SK[0],SK[1],SK[2],SK[3]);if(u.HI&&cur===8)g.uniform2fv(u.HI,S.arr);
  g.uniform1i(u.V,0);g.uniform1i(u.X,1);g.uniform1i(u.TX,2);g.uniform1i(u.TA,3);
  g.drawArrays(g.TRIANGLES,0,3);
 }
 ov.style.opacity=wallOn?(breaking?0:Math.max(0,1-Math.max(0,(Dv-.7)/.3))):1;
 desenharDebris();
 desenharLaje(cov);
 requestAnimationFrame(frame);
}
// atalho de teste: #cena=N pula o muro
const hm=location.hash.match(/cena=(\d+)/);
resize();
if(hm){broken=true;wallOn=false;document.documentElement.classList.remove('travado');document.body.classList.add('livre');dica.style.opacity=0;barra.style.opacity=0;
 const k=Math.min(N-1,+hm[1]);setTimeout(()=>{scrollTo(0,k*H);},50);}
setScene(0);ui();
if(document.fonts){FT.forEach(x=>document.fonts.load((x.w||400)+' 40px "'+x.f+'"'));document.fonts.ready.then(()=>{versosMuro();sig='';laySig='';letras(true);});}
requestAnimationFrame(frame);
})();
