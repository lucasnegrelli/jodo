"use client";

import VoltarJodo from "@/components/comum/VoltarJodo";
import MarcaTopo from "@/components/comum/MarcaTopo";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/vicenteTecido.module.css";
import { PERFIS, DISCO } from "@/data/vicenteBlow";

/*
 * VBLXW · tecido.
 * O fundo é um balaio de arumã renderizado em shader: talas redondas, fibra, luz que segue o cursor, o pano cede onde o cursor passa.
 * Os padrões são baniwa; nomes e traduções vêm do livro "Arte Baniwa: cestaria de arumã" (FOIRN/ISA, 2000).
 * O trabalho dele é a figura: capas e clipes aparecem limpos, grandes, e o tecido só ganha a cor de cada um.
 */

const sm = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};

const PADROES = [
  { nome: "waláiapo", trad: "balaio, ele vê" },
  { nome: "itsidawhi", trad: "casca de jabuti" },
  { nome: "dzawiiphoakaromi", trad: "pegada de onça" },
  { nome: "kowhepokettamárhi", trad: "caminho de saúva" },
  { nome: "pirarucu iwhi", trad: "escama de pirarucu" },
  { nome: "makowethi", trad: "olho de ave noturna" },
  { nome: "tsiipaittipi", trad: "rabo de pacu" },
  { nome: "kettamarhi", trad: "desenho da costa de besouro" },
  { nome: "iwithoipa", trad: "pegada de maçarico" },
  { nome: "rowidzokami", trad: "mulher peneirando" },
  { nome: "dawakihiwidaapi", trad: "cabeça de jandiá" },
];

const achaDisco = (capa) => DISCO.find((d) => d.capa === capa);
const SP = (id) => `https://open.spotify.com/intl-pt/album/${id}`;
const YT = (id) => `https://www.youtube.com/watch?v=${id}`;

// um capítulo por trabalho. Cada um tem Spotify e YouTube; onde há clipe ou visualizer, há prévia em loop.
// As fichas vêm das descrições oficiais dos vídeos no YouTube e da tracklist do álbum.
const ORDEM = ["ruido", "rema", "reflexo", "fluxxxo", "zabutre", "slip", "falha", "ampf"];
const OBRAS = [
  {
    id: "ampf", linhas: ["AMAZÔNIA", "PEGA FOGO"], rot: "o primeiro single", meta: "29.02.2020",
    nota: "Tudo começou queimando.",
    letra: { l: ["Um rio, um fio de luz, a esperança brilha.", "Existem pegadas, mas eu faço a minha trilha."], c: "Amazônia Pega Fogo" },
    ficha: ["Clipe da JODO", "Insyt: imagem e beat", "82: edição"],
    capa: "amazonia-pega-fogo", chipDir: true, sp: "1sEtlDt7CrrIg2TlhsFT77", yt: "HAtrs4fNb00", tipoYt: "clipe", video: "amazonia-pega-fogo", pat: 3, L: 1.3,
    fato: "Os grafismos baniwa são chamados de sílabas gráficas: mais de 20 desenhos, quase todos com nome de algo da natureza.",
  },
  {
    id: "falha", par: true, linhas: ["NO CANAL", "FALHA"], rot: "dois singles", meta: "2021 · produção de LF e VL",
    nota: "“Em uma das capitais mais violentas do Brasil, o crime pode ser a solução para algum dos seus problemas, mas nem sempre o crime compensa.” Free$tyle Quarentena levou o 1º lugar no festival de Hip-Hop Dimanaus.",
    letra: { l: ["Minha competição é comigo mesmo,", "é eu contra eu."], c: "Free$tyle Quarentena" },
    ficha: ["Capital Crime, letra: LF e VBLXW", "Imagens: Dom Brawl e Cavalcantte", "Edição: Sanctus Visual"],
    itens: [
      { capa: "capital-crime", sp: "6IID0sdtKUIIOiKuGMm09X", yt: "t3N7I1FZLZA", tipoYt: "clipe", video: "capital-crime" },
      { capa: "freestyle-quarentena", sp: "5kAKUBe6Q1cXFmTVfuUH9k", yt: "EiZVJf37tUc", tipoYt: "áudio" },
    ],
    pat: 2, L: 1.5,
    fato: "No arumã baniwa o preto vem da cinza e o vermelho, do urucum; a cor fixa com sumo de cumati.",
  },
  {
    id: "slip", linhas: ["SLIP LIKE", "TIME"], rot: "single", meta: "27.01.2021",
    nota: "“No espaço da 3ª Dimensão somos sufocados pelo tempo e saber viver é escorregar nessa linha abstrata e concreta que nomeamos, instante.” Segundo trabalho audiovisual do JDV Bruxos do Norte.",
    letra: { l: ["A vida é só um fio que tá quase pra romper.", "A vida é um desafio, eu desafio você."], c: "Slip Like Time" },
    ficha: ["Letra: Vicente Blow, Dom Brawl e Mano DL", "Instrumental: VHS", "Gravação e mixagem: LF", "Edição: JDV BDN"],
    capa: "slip-like-time", sp: "3W7KQwKI5tanTeOaIDELfp", yt: "mWALEYoxlpc", tipoYt: "clipe", video: "slip-like-time", pat: 4, L: 1.4,
    fato: "Cada peça de cestaria baniwa usa de 150 a 200 talas de arumã, trançadas em padrões variados.",
  },
  {
    id: "zabutre", linhas: ["ZABUTRE"], rot: "single", meta: "04.03.2021",
    nota: "VBLOW + 82.",
    letra: { l: ["o norte é fixo,", "o rio é o crucifixo.", "olha o tempo,", "não tem outra vez."], c: "Zabutre · verso do Vicente, texto oficial do clipe" },
    ficha: [],
    capa: "zabutre", sp: "1WyLqzX3egsIkJ4eKmObYx", yt: "ytHHKm_wKDc", tipoYt: "clipe", video: "zabutre", pat: 6, L: 1.3,
    fato: "O arumã é uma cana de áreas semi-alagadas; antes de tingir, raspa-se a casca verde.",
  },
  {
    id: "fluxxxo", linhas: ["EL", "FLUXXXO"], rot: "single · vídeo oficial", meta: "12.04.2022",
    nota: "Traz “Manaus City”, com segunda parte e vídeo oficial, de 22.05.2022.",
    letra: { l: ["Que cada barraco vire um castelo."], c: "Manaus City pt. 2" },
    ficha: ["Manaus City pt. 2: letra de VBLXW e Lil Pavan", "Instrumental: Chuvas de Insyt", "Mixagem e masterização: Saull OE e LF", "Direção: LF · edição: Sanctus Visual"],
    capa: "el-fluxxxo", sp: "5RYHITtIZeCp2HNab7zvKl", yt: "1duWPyd9wrM", tipoYt: "clipe", video: "el-fluxxxo", pat: 1, L: 1.4,
    fato: "Uma Oficina de Mestres, em 1999, registrou 27 nomes de desenhos baniwa; Berta Ribeiro já tinha anotado 28 nos anos 1970.",
  },
  {
    id: "reflexo", linhas: ["REFLEXO"], rot: "ep · quatro faixas", meta: "29.05.2023",
    nota: "Com LF. Part. Saull OE em “Foco”, “Impuros” e “Reflexo”.",
    ficha: ["Foco · Impuros · La Familia · Reflexo", "Produção: LF"],
    capa: "reflexo", sp: "3yJSVEIVaDt8JAM3KqT0sT", ytUrl: "https://www.youtube.com/playlist?list=PLJwQ4UgtNW34Jbum9ik6Cze52dISZX_85", tipoYt: "visualizer", video: "reflexo", pat: 7, L: 1.4,
    fato: "No Alto Rio Negro, os mesmos padrões aparecem na cestaria, na pintura do corpo e em petróglifos.",
  },
  {
    id: "rema", linhas: ["R.E.M.A"], rot: "single · com Naycol Davan", meta: "18.08.2023",
    nota: "",
    ficha: ["Letra e vozes: Naycol Davan e Vicente Blow", "Instrumental: Insyt", "Mixagem e masterização: RVL$", "Vídeo: Pedro Prisma · edição: JODO e FALHA"],
    capa: "rema", sp: "5ACrfGRw8wDLHzJ4qv8kBd", yt: "FIIUH57aYSc", tipoYt: "clipe", video: "rema", pat: 5, L: 1.4,
    fato: "Os baniwa dão nome próprio a cada forma de cesto: urutu (o grande), balaio, peneira e jarro.",
  },
  {
    id: "ruido", linhas: ["RUÍDO DAS", "ÁGUAS"], rot: "álbum · com PRISM∆ e LF", meta: "28.02.2025",
    nota: "“Ruído das Águas” é o chamado de volta para casa: uma imersão no olho do igarapé.",
    letra: { l: ["Meu meio-fio é a beira do rio."], c: "Ruído das Águas" },
    ficha: ["Bruxaria, O Alquimista · Buya · Crya de Ryo · Nunca no Brazil", "Ruído das Águas · Território · Tipo Jodo", "Faixa bônus: É O Fim (prod. DK)", "Mixagem: LF · capa: KdeirA"],
    capa: "ruido", contra: "ruido-contra", sp: "3xqESrPBdKu22WExN2bnl9", yt: "AyMgXCTz8wQ", tipoYt: "visualizer", video: "ruido-das-aguas", pat: 10, L: 1.7,
    fato: "O livro Arte Baniwa (2000) é um registro orientado pelos próprios baniwa do alto Içana.",
  },
  // do mais novo para o mais antigo: o álbum de 2025 abre, e o primeiro single, "tudo começou queimando", fecha o círculo
]
  .sort((a, b) => ORDEM.indexOf(a.id) - ORDEM.indexOf(b.id))
  .map((o, k) => ({ ...o, cap: k + 1, inv: k % 2 === 1 }));

// as fotos dele que passam na capa
const NT = 12;
const FOTOS = ["chapeu", "branco", "azul", "hero", "mascara"];
// o resto da discografia: só áudio, mas com os dois links
const OUTROS = [
  { capa: "mundo-estranho", spUrl: "https://open.spotify.com/search/Pode%20P%C3%A1%2C%20Ora%20Pois", yt: "6RmWvU75a8E", com: "com 82 e lvsraizK" },
  { capa: "a-vida-e-um-rio", sp: "5c4n5qCiLFMLb2KsxBqTfk", yt: "6aAKeFXpI0w", com: "com Sergio Estranho" },
  { capa: "tomando-um-cha", sp: "5uaFrtLN1wCkpOzLi7qPf0", yt: "SihwCgo4viU" },
  { capa: "rua-nova", sp: "7ac5eleR0qSTSMdDMQZLRe", yt: "3xvcsiddSMk" },
];

const CAPITULOS = [
  { id: "capa", pat: 0, L: 1.7, fato: "waláiapo é o primeiro padrão que toda criança baniwa aprende e fica no fundo de todo urutu, o cesto grande; é feito sem talas coloridas." },
  ...OBRAS.map((o) => ({ id: o.id, pat: o.pat, L: o.L, fato: o.fato })),
  { id: "outros", pat: 8, L: 1.2, fato: "Cada padrão baniwa tem um nome e significados particulares conforme o clã." },
  { id: "ouvir", pat: 9, L: 1.0, fato: "A Rede Artesol conta hoje mais de 20 desenhos conhecidos, as chamadas sílabas gráficas." },
];
const N = CAPITULOS.length;
const CAP_OUTROS = N - 2;
const CAP_OUVIR = N - 1;

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr,uT,uS,uF,uPatA,uPatB,uOpA,uOpB,uPushOn,uLR;
uniform vec3 uPA0,uPA1,uPA2,uPB0,uPB1,uPB2;uniform vec3 uK;
uniform vec2 uTrail[6];uniform vec2 uPush;uniform sampler2D uMask;
uniform vec4 uR[8];uniform vec4 uI[8];uniform vec3 uC[8];
const vec3 INK=vec3(.043,.039,.063);const vec3 CREAM=vec3(.863,.812,.682);
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ie(float a,float b){return abs(a-b)<.5?1.:0.;}
float padrao(float id,float x,float y){
  if(id<.5){float px=mod(x,9.)-4.,py=mod(y,9.)-4.;float d=max(abs(px),abs(py));if(d<.5)return 2.;return mod(d,2.)>.5?1.:0.;}
  if(id<1.5){float sx=x+(mod(floor(y/12.),2.)>.5?6.:0.);float px=mod(sx,12.)-6.,py=mod(y,12.)-6.;float d=abs(px)+abs(py);if(d<.5)return 2.;return (mod(d,3.)>.5&&mod(d,3.)<1.5)||abs(d-6.)<.5?1.:0.;}
  if(id<2.5){float ty=floor(y/9.);float u=mod(x+(mod(ty,2.)>.5?4.:0.),8.);float v=mod(y,9.);
    float dedo=0.;
    if(ie(u,1.)>.5&&(ie(v,2.)>.5||ie(v,3.)>.5))dedo=1.;
    if((ie(u,3.)>.5||ie(u,4.)>.5)&&(ie(v,1.)>.5||ie(v,2.)>.5))dedo=1.;
    if(ie(u,6.)>.5&&(ie(v,2.)>.5||ie(v,3.)>.5))dedo=1.;
    float almof=0.;
    if(ie(v,4.)>.5&&u>1.5&&u<5.5)almof=1.;
    if((ie(v,5.)>.5||ie(v,6.)>.5)&&u>.5&&u<6.5)almof=1.;
    if(ie(v,7.)>.5&&u>1.5&&u<5.5)almof=1.;
    if(almof>.5&&(ie(v,5.)>.5||ie(v,6.)>.5)&&(ie(u,3.)>.5||ie(u,4.)>.5))return 2.;
    return (dedo>.5||almof>.5)?1.:0.;}
  if(id<3.5){float zig=abs(mod(y,10.)-5.);float s=x+zig;float m=mod(s,7.);if(m<1.5)return 1.;
    return (ie(m,4.)>.5&&mod(floor(y/10.)+floor(s/7.),3.)<.5)?2.:0.;}
  if(id<4.5){float row=floor(y/6.);float u=mod(x+(mod(row,2.)>.5?4.:0.),8.);float v=mod(y,6.);
    float arco=0.;
    if(ie(v,0.)>.5&&u>1.5&&u<5.5)arco=1.;
    if(ie(v,1.)>.5&&(ie(u,1.)>.5||ie(u,6.)>.5))arco=1.;
    if(ie(v,2.)>.5&&(ie(u,0.)>.5||ie(u,7.)>.5))arco=1.;
    if(v>2.5&&v<4.5&&(ie(u,3.)>.5||ie(u,4.)>.5))return 2.;
    return arco;}
  if(id<5.5){float u=mod(x,11.);float v=mod(y,7.);float dx=(u-5.)/5.,dy=(v-3.)/3.;float r=dx*dx+dy*dy;if(r<.2)return 2.;return (r>=.5&&r<=1.02)?1.:0.;}
  if(id<6.5){float m=mod(abs(mod(x,10.)-5.)+y,6.);if(m<1.5)return 1.;
    return (ie(m,3.)>.5&&mod(x+y*2.,11.)<.5)?2.:0.;}
  // kettamarhi: costa de besouro, com a cruz da sutura
  if(id<7.5){float u=mod(x,10.)-4.5,v=mod(y,10.)-4.5;float e=(u*u)/18.49+(v*v)/23.04;
    if(e>1.)return 0.;if(e>.62)return 1.;
    if(abs(u)<.6||abs(v)<.6)return 1.;
    if(abs(abs(u)-2.)<.6&&abs(abs(v)-2.)<.6)return 2.;return 0.;}
  // iwithoipa: pegada de maçarico, três dedos para frente e um para trás
  if(id<8.5){float ty=floor(y/10.);float u=mod(x+(mod(ty,2.)>.5?4.:0.),9.);float v=mod(y,10.);
    if(ie(u,4.)>.5&&v>.5&&v<5.5){return ie(v,5.)>.5?2.:1.;}
    if((ie(u,3.)>.5&&ie(v,4.)>.5)||(ie(u,2.)>.5&&ie(v,3.)>.5)||(ie(u,1.)>.5&&ie(v,2.)>.5))return 1.;
    if((ie(u,5.)>.5&&ie(v,4.)>.5)||(ie(u,6.)>.5&&ie(v,3.)>.5)||(ie(u,7.)>.5&&ie(v,2.)>.5))return 1.;
    if(ie(u,4.)>.5&&(ie(v,6.)>.5||ie(v,7.)>.5))return 1.;return 0.;}
  // rowidzokami: mulher peneirando, a cabeça acima do aro da peneira
  if(id<9.5){float u=mod(x,12.),v=mod(y,12.);float d=length(vec2(u-6.,v-7.));
    if(d>=2.3&&d<=3.5)return 1.;
    if(u>4.5&&u<6.5&&v>.5&&v<2.5)return 2.;
    if(u>4.5&&u<6.5&&ie(v,3.)>.5)return 1.;return 0.;}
  // dawakihiwidaapi: cabeça de jandiá, olhos e barbilhões
  float ty=floor(y/8.);float u=mod(x+(mod(ty,2.)>.5?6.:0.),12.);float v=mod(y,8.);
  if(v<3.5&&u>=4.-v-.1&&u<=7.+v+.1){return (ie(v,2.)>.5&&(ie(u,3.)>.5||ie(u,8.)>.5))?2.:1.;}
  if(ie(v,4.)>.5&&(ie(u,2.)>.5||ie(u,9.)>.5||ie(u,0.)>.5||ie(u,11.)>.5))return 1.;
  if(ie(v,5.)>.5&&(ie(u,1.)>.5||ie(u,10.)>.5))return 1.;
  return 0.;
}
vec3 pk(float c,vec3 a,vec3 b,vec3 d){return c<.5?a:(c<1.5?b:d);}
void main(){
  vec2 P=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
  // o pano cede onde o cursor passa
  vec2 Pd=P;
  if(uPushOn>.5){vec2 dv=P-uPush;float dd=length(dv);float k=exp(-(dd*dd)/(2.*75.*75.))*10.;Pd+=dv/max(dd,1.)*k;}
  vec2 g=Pd/uS;vec2 c=floor(g);vec2 l=fract(g);
  vec2 cc=(c+.5)*uS;
  float h=h21(c);
  // lanterna
  float L=0.;
  for(int q=0;q<6;q++){float d=length(cc-uTrail[q]);if(d<uLR)L=max(L,(1.-d/uLR)*(1.-float(q)*.12));}
  // janelas: texto abre o tecido; capa/foto/vídeo fazem um buraco e soltam a cor em volta
  float abre=0.;vec3 tint=vec3(0.);float tk=0.;float hole=0.;
  for(int i=0;i<8;i++){
    float ty=uI[i].x;
    if(ty>.5){
      vec4 r=uR[i];float dxo=max(r.x-P.x,P.x-r.z);float dyo=max(r.y-P.y,P.y-r.w);float d=max(dxo,dyo);float o=uI[i].y;
      if(ty<1.5){abre=max(abre,o*smoothstep(uS*9.,-uS*1.5,d));}
      else{
        if(d<0.)hole=max(hole,o);
        float R2=uS*46.;
        if(d>=0.&&d<R2){float k=o*(1.-d/R2);abre=max(abre,k*.28);if(k>tk){tk=k;tint=uC[i];}}
      }
    }
  }
  // padrão (supercélulas de 3x3) e a troca de um para o outro, tala por tala
  vec2 ctr=floor(uRes/uS*.5);vec2 q=floor((c-ctr)/3.);
  float cA=padrao(uPatA,q.x,q.y);float cB=padrao(uPatB,q.x,q.y);
  float warp=mod(c.x+c.y,4.)<2.?1.:0.;if(L>.45)warp=1.-warp;
  // clique: uma onda atravessa o tecido virando as talas (quem passa por cima troca)
  float onda=0.;
  if(uK.z>0.){float tk2=uT-uK.z;float rr=tk2*680.;float dr=abs(length(P-uK.xy)-rr);if(dr<46.&&tk2<2.2){onda=(1.-dr/46.)*(1.-tk2/2.2);warp=1.-warp;}}
  float along=warp>.5?l.y:l.x;float cross=warp>.5?l.x:l.y;
  float kB=clamp((uF-h*.55)/.45,0.,1.);
  float useB=(uF>0.&&along<kB)?1.:0.;
  vec3 base=useB>.5?pk(cB,uPB0,uPB1,uPB2):pk(cA,uPA0,uPA1,uPA2);
  float len=clamp((uT*.9-(cc.y/uRes.y)*1.4-h*.35)/.4,0.,1.);
  float vis=along<=len?1.:0.;
  // título tecido (máscara suave): as letras são talas claras
  vec4 mk=texture2D(uMask,P/uRes);
  float lt=smoothstep(.35,.65,max(mk.r*uOpA,mk.g*uOpB));
  float hl=max(mk.b*uOpA,mk.a*uOpB);
  abre=max(abre,hl*.9);
  vec3 col0=mix(base,CREAM,lt);
  // a tala: seção redonda, luz, fibra, sombra onde passa por baixo
  float r=abs(cross-.5)/.44;float inside=1.-smoothstep(.84,1.,r);
  vec2 n2=warp>.5?vec2((cross-.5)/.44,0.):vec2(0.,(cross-.5)/.44);
  vec3 N=normalize(vec3(n2*.75,1.));
  vec2 ld2=uPushOn>.5?(uPush-P)/260.:vec2(-.35,-.45);
  vec3 Ld=normalize(vec3(ld2,.8));
  float diff=clamp(dot(N,Ld),0.,1.);
  float spec=pow(clamp(dot(reflect(-Ld,N),vec3(0.,0.,1.)),0.,1.),20.)*.2;
  float fiber=.86+.14*h21(vec2(floor(cross*18.),c.x*3.1+c.y*7.7));
  float fine=.93+.07*h21(floor(Pd*1.5));
  float edge=smoothstep(0.,.2,along)*smoothstep(0.,.2,1.-along);
  float shade=(.5+.75*diff)*fiber*fine*mix(.5,1.,edge);
  float luz=(.42+.58*L+.5*onda)*(1.-.88*abre);
  float brL=mix(luz,.98,lt);
  vec3 col=col0*shade*brL+col0*spec*brL;
  col=mix(INK,col,inside*vis);
  col=mix(col,tint*.9*shade,tk*.3*(1.-lt));
  col=mix(col,INK*.8,hole);
  vec2 vq=P/uRes-.5;col*=1.-.4*dot(vq,vq)*2.;
  gl_FragColor=vec4(col,1.);
}`;

const Rv = ({ k = 0, as: T = "div", className = "", children, ...r }) => (
  <T className={`${styles.rv} ${className}`} style={{ "--k": k }} {...r}>
    {children}
  </T>
);

// faixa fina no rodapé: o padrão que está tecido na tela (só o que é fato)
const Legenda = ({ cap }) => {
  const c = CAPITULOS[cap];
  const p = PADROES[c.pat];
  return (
    <Rv k={6} className={styles.legenda}>
      <span>padrão baniwa</span>
      <b>{p.nome}</b>
      <i>“{p.trad}”</i>
      {c.fato && <em>{c.fato}</em>}
    </Rv>
  );
};

// título tecido: o elemento só marca o lugar; as letras entram no shader por uma máscara
const Tece = ({ cap, txt, className = "", style }) => (
  <div className={`${styles.tece} ${className}`} style={style} data-tece={cap} data-txt={txt} role="heading" aria-level={2} aria-label={txt} />
);
// um título de ponta a ponta: a altura é a maior que cabe em ~92% da largura, limitada pela altura da tela
const titulo = (txt, hmax = 19) => ({ height: `min(${hmax}vh, ${(188 / Math.max(txt.length, 4)).toFixed(2)}vw)` });

const inclina = (e) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) scale(1.015)`;
};
const desinclina = (e) => {
  e.currentTarget.style.transform = "";
};

// só as redes dele; o Instagram e o canal do grupo ficam na página dos Bruxos do Norte
const Icone = ({ id }) => {
  const c = { width: 56, height: 56, viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: 3.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (id === "spotify")
    return (
      <svg {...c}>
        <circle cx="24" cy="24" r="19" />
        <path d="M13 18.5c7-2 15-1.5 22 2.2" />
        <path d="M14.5 25.5c6-1.6 12.5-1 18 1.8" />
        <path d="M16 32c5-1.2 10-.8 14.5 1.4" />
      </svg>
    );
  if (id === "youtube")
    return (
      <svg {...c}>
        <rect x="5" y="11" width="38" height="26" rx="8" />
        <path d="M20 17.5v13l11-6.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  if (id === "instagram")
    return (
      <svg {...c}>
        <rect x="6" y="6" width="36" height="36" rx="11" />
        <circle cx="24" cy="24" r="8.5" />
        <circle cx="34.5" cy="13.5" r="1.8" fill="currentColor" stroke="none" />
      </svg>
    );
  return (
    <svg {...c} strokeWidth={0} fill="currentColor">
      {[[4, 30], [4, 36], [4, 42], [14, 24], [14, 30], [14, 36], [14, 42], [24, 12], [24, 18], [24, 24], [24, 30], [24, 36], [24, 42], [34, 20], [34, 26], [34, 32], [34, 38], [34, 44]].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x} y={y - 4} width="8" height="3.4" rx="0.6" />
      ))}
    </svg>
  );
};
// o próprio logo de cada rede (sem caixa em volta), para a capa do celular
const Marca = ({ id }) =>
  id === "spotify" ? (
    <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#1db954" />
      <g fill="none" stroke="#0b0a10" strokeWidth="3.6" strokeLinecap="round">
        <path d="M12.5 18.2c8-2.4 17-1.8 25 2.6" />
        <path d="M14 25.2c6.6-1.8 13.6-1.2 19.6 2.2" />
        <path d="M15.6 31.6c5.4-1.4 10.8-.9 15.8 1.8" />
      </g>
    </svg>
  ) : (
    <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
      <defs>
        <linearGradient id="igg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#feda75" />
          <stop offset="0.35" stopColor="#fa7e1e" />
          <stop offset="0.65" stopColor="#d62976" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#igg)" />
      <rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="24" cy="24" r="5.6" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="31" cy="17" r="1.8" fill="#fff" />
    </svg>
  );
const REDES = [
  { id: "spotify", nome: "Spotify", sub: "Vicente Blow", url: PERFIS.spotify, cor: "#1db954" },
  { id: "youtube", nome: "YouTube", sub: "Ruído das Águas", url: PERFIS.youtubeAlbum, cor: "#ff2d2d" },
  { id: "instagram", nome: "Instagram", sub: "@bruxobuya", url: PERFIS.instagram, cor: "#e1306c" },
  { id: "deezer", nome: "Deezer", sub: "Vicente Blow", url: PERFIS.deezer, cor: "#a238ff" },
];
const NOMES = ["capa", ...OBRAS.map((o) => o.linhas.join(" ").toLowerCase()), "e mais", "ouvir"];
let irPara = () => {};
const rotuloYt = (tipo) => (tipo === "clipe" ? "clipe ↗" : tipo === "visualizer" ? "visualizer ↗" : "YouTube ↗");

export default function VicenteTecido() {
  const raiz = useRef(null);
  const cv = useRef(null);
  const trilha = useRef(null);
  const tag = useRef(null);
  const anel = useRef(null);
  const caps = useRef([]);
  const geo = useRef({ B: [], total: 0 });

  // troca de foto: as talas da foto nova entram por cima da atual; trocas pedidas no meio da animação entram numa fila
  const [foto, setFoto] = useState({ cur: 0, nxt: -1, go: false });
  const fotoRef = useRef({ cur: 0, ocupado: false, fila: -1, tm: [] });
  const irFotoRef = useRef(() => {});
  irFotoRef.current = (i) => {
    const r = fotoRef.current;
    if (r.ocupado) {
      r.fila = i;
      return;
    }
    if (i === r.cur) return;
    r.ocupado = true;
    setFoto({ cur: r.cur, nxt: i, go: false });
    r.tm.push(setTimeout(() => setFoto((f) => ({ ...f, go: true })), 40));
    r.tm.push(
      setTimeout(() => {
        r.cur = i;
        r.ocupado = false;
        setFoto({ cur: i, nxt: -1, go: false });
        const q = r.fila;
        r.fila = -1;
        if (q >= 0 && q !== i) irFotoRef.current(q);
      }, 1750)
    );
  };
  useEffect(() => {
    const r = fotoRef.current;
    return () => r.tm.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const antes = [document.documentElement.style.cssText, document.body.style.cssText];
    document.documentElement.style.overflow = "visible";
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflow = "visible";
    document.body.style.overflowX = "clip";

    const canvas = cv.current;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return undefined;
    const sh = (t, src) => {
      const o = gl.createShader(t);
      gl.shaderSource(o, src);
      gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o));
      return o;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const la = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(la);
    gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["uRes", "uDpr", "uT", "uS", "uF", "uPatA", "uPatB", "uOpA", "uOpB", "uPushOn", "uLR", "uPA0", "uPA1", "uPA2", "uPB0", "uPB1", "uPB2", "uTrail", "uPush", "uMask", "uR", "uI", "uC", "uK"].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));

    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([a, b]) => gl.texParameteri(gl.TEXTURE_2D, a, b));
    gl.uniform1i(U.uMask, 0);

    let vw, vh, dpr, S, mw, mh;
    let letters = {}, halos = {}, packed = "";

    irPara = (k) => scrollTo({ top: geo.current.B[k] + (k ? vh * 0.45 : 0), behavior: "smooth" });
    const mede = () => {
      const B = [0];
      CAPITULOS.forEach((c) => B.push(B[B.length - 1] + c.L * vh));
      geo.current = { B, total: B[B.length - 1] };
      if (trilha.current) trilha.current.style.height = `${B[B.length - 1] + vh}px`;
    };

    // máscara dos títulos (suave, em alta resolução) e do vazio em volta deles
    const tece = () => {
      letters = {};
      halos = {};
      packed = "";
      const m = mw / vw;
      const lc = document.createElement("canvas");
      lc.width = mw;
      lc.height = mh;
      const lx = lc.getContext("2d", { willReadFrequently: true });
      const hc = document.createElement("canvas");
      hc.width = mw;
      hc.height = mh;
      const hx = hc.getContext("2d", { willReadFrequently: true });
      document.querySelectorAll("[data-tece]").forEach((el) => {
        const cap = +el.dataset.tece;
        const txt = el.dataset.txt;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) return;
        lx.clearRect(0, 0, mw, mh);
        lx.fillStyle = "#fff";
        const fs = (r.height * m) / 0.9;
        lx.font = `400 ${fs}px Anton, Impact, "Arial Narrow", sans-serif`;
        if ("letterSpacing" in lx) lx.letterSpacing = `${fs * 0.025}px`;
        lx.textBaseline = "alphabetic";
        const tw = lx.measureText(txt).width;
        const sx = tw > r.width * m ? (r.width * m) / tw : 1;
        lx.save();
        lx.translate(r.left * m + (r.width * m - tw * sx) / 2, (r.top + r.height) * m);
        lx.scale(sx, 1);
        lx.fillText(txt, 0, 0);
        lx.restore();
        const ld = lx.getImageData(0, 0, mw, mh).data;
        hx.clearRect(0, 0, mw, mh);
        hx.filter = "blur(9px)";
        hx.drawImage(lc, 0, 0);
        hx.filter = "none";
        const hd = hx.getImageData(0, 0, mw, mh).data;
        const A = letters[cap] || (letters[cap] = new Uint8Array(mw * mh));
        const Hh = halos[cap] || (halos[cap] = new Uint8Array(mw * mh));
        for (let k = 0; k < mw * mh; k++) {
          const a = ld[k * 4 + 3];
          if (a > A[k]) A[k] = a;
          const b = Math.min(255, hd[k * 4 + 3] * 2.4);
          if (b > Hh[k]) Hh[k] = b;
        }
      });
    };
    const pack = (a, b) => {
      const key = `${a}-${b}`;
      if (key === packed) return;
      packed = key;
      const data = new Uint8Array(mw * mh * 4);
      const A = letters[a], B = letters[b], HA = halos[a], HB = halos[b];
      for (let k = 0; k < mw * mh; k++) {
        data[k * 4] = A ? A[k] : 0;
        data[k * 4 + 1] = B ? B[k] : 0;
        data[k * 4 + 2] = HA ? HA[k] : 0;
        data[k * 4 + 3] = HB ? HB[k] : 0;
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mw, mh, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    };

    const t0 = performance.now();
    const monta = () => {
      vw = innerWidth;
      vh = innerHeight;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      S = vh < 520 ? 5 : 6;
      mw = Math.ceil(vw / 2);
      mh = Math.ceil(vh / 2);
      mede();
      tece();
    };
    monta();
    if (document.fonts && document.fonts.load) {
      document.fonts.load("400 40px Anton").then(() => tece()).catch(() => {});
      document.fonts.ready.then(() => tece()).catch(() => {});
    }

    const trail = Array.from({ length: 6 }, () => [-999, -999]);
    let ultTr = 0, tocou = false, px = 0, py = 0, csx = 0, csy = 0, sobreLink = false, sobreFundo = false;
    const onMove = (e) => {
      tocou = true;
      px = e.clientX;
      py = e.clientY;
      sobreLink = !!(e.target && e.target.closest && e.target.closest("a,button"));
      sobreFundo = e.target === canvas;
      const now = performance.now();
      if (now - ultTr > 55) {
        ultTr = now;
        trail.pop();
        trail.unshift([px, py]);
      } else trail[0] = [px, py];
    };
    let klk = [0, 0, -1];
    const onDown = (e) => {
      if (e.target && e.target.closest && e.target.closest("a,button")) return;
      klk = [e.clientX, e.clientY, (performance.now() - t0) / 1000];
    };
    addEventListener("pointermove", onMove);
    addEventListener("pointerdown", onDown);
    addEventListener("resize", monta);

    // paleta de cada trabalho: escuro, claro e destaque, tirados da própria capa
    const D0 = [[0.227, 0.2, 0.149], [0.863, 0.812, 0.682], [0.816, 0.224, 0.106]];
    const pals = {};
    const paleta = (img) => {
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 12;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0, 12, 12);
        const d = x.getImageData(0, 0, 12, 12).data;
        const arr = [];
        for (let k = 0; k < d.length; k += 4) arr.push([d[k], d[k + 1], d[k + 2]]);
        const lu = (p) => 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2];
        arr.sort((a, b) => lu(a) - lu(b));
        const med = (a) => a.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map((v) => v / a.length);
        const q = Math.floor(arr.length / 4);
        const esc = med(arr.slice(0, q)), cla = med(arr.slice(-q));
        let ac = arr[0], sa = -1;
        arr.forEach((p) => {
          const mx = Math.max(...p), mn = Math.min(...p);
          const s2 = mx > 70 ? (mx - mn) / mx : 0;
          if (s2 > sa) { sa = s2; ac = p; }
        });
        const fit = (p, alvo) => {
          const m = Math.max(p[0], p[1], p[2], 1);
          const k = alvo / m;
          return [Math.min(1, (p[0] * k) / 255), Math.min(1, (p[1] * k) / 255), Math.min(1, (p[2] * k) / 255)];
        };
        return [fit(esc, 62), fit(cla, 225), sa > 0.25 ? fit(ac, 235) : D0[2]];
      } catch (e) {
        return null;
      }
    };
    const rgb = (p) => `rgb(${(p[0] * 255) | 0},${(p[1] * 255) | 0},${(p[2] * 255) | 0})`;
    const getPal = (cap) => {
      if (pals[cap]) return pals[cap];
      const im = document.querySelector(`[data-abre="${cap}"][data-tipo="foto"] img`);
      if (im && im.complete && im.naturalWidth) {
        const p = paleta(im) || D0;
        pals[cap] = p;
        const sec = caps.current[cap];
        if (sec) {
          sec.style.setProperty("--acc", rgb(p[2]));
          sec.style.setProperty("--luz", rgb(p[1]));
        }
        return p;
      }
      return D0;
    };

    // contracapa que ainda não existe como arquivo: a capa fica como está (o erro pode ter ocorrido antes de o React assumir)
    document.querySelectorAll("[data-flip]").forEach((f) => {
      const im = f.querySelector("img[alt^='Contracapa']");
      if (!im) return;
      const sem = () => f.setAttribute("data-sem", "1");
      if (im.complete && im.naturalWidth === 0) sem();
      else im.addEventListener("error", sem, { once: true });
    });

    // as fotos dele passam: pelo scroll dentro da capa e, parado no topo, sozinhas (o estado vive no React)
    const iv = setInterval(() => {
      if (scrollY < 40) irFotoRef.current((fotoRef.current.cur + 1) % FOTOS.length);
    }, 5200);
    const nav = Array.from(document.querySelectorAll("[data-fio] button"));
    const btnTopo = document.querySelector("[data-topo]");
    const fioFill = document.querySelector("[data-fiofill]");

    const uR = new Float32Array(32), uI = new Float32Array(32), uC = new Float32Array(24), uT6 = new Float32Array(12);
    let raf;
    const ops = new Array(N).fill(0);
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const t = Math.max(0, (now - t0) / 1000);
      const { B, total } = geo.current;
      const y = Math.min(total, Math.max(0, scrollY));
      let ic = 0;
      while (ic < N - 1 && y >= B[ic + 1]) ic++;
      const meia = vh * 0.3;
      caps.current.forEach((el, i) => {
        if (!el) return;
        const ent = i === 0 ? 1 : sm((y - (B[i] - meia * 0.5)) / meia);
        const sai = i === N - 1 ? 1 : 1 - sm((y - (B[i + 1] - meia * 1.2)) / meia);
        const o = Math.min(ent, sai);
        ops[i] = o;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.classList.toggle(styles.on, o > 0.55);
      });
      if (ic === 0 && y >= 40) {
        const pf = Math.min(0.999, y / Math.max(1, B[1] * 0.92));
        irFotoRef.current(Math.floor(pf * FOTOS.length));
      }
      nav.forEach((b, k) => b.classList.toggle(styles.fioOn, k === ic));
      if (btnTopo) btnTopo.classList.toggle(styles.topoOn, ic === N - 1);
      if (fioFill) fioFill.style.height = `${((ic + sm((y - B[ic]) / Math.max(1, B[ic + 1] - B[ic]))) / N) * 100}%`;
      const nB = Math.min(ic + 1, N - 1);
      let f = 0;
      if (ic < N - 1) f = sm((y - (B[ic + 1] - meia * 1.4)) / (meia * 1.8));
      pack(ic, nB);
      const palA = getPal(ic), palB = getPal(nB);
      for (let i = 0; i < N; i++) if (ops[i] > 0.02) getPal(i);

      // sem mouse, a lanterna passeia sozinha
      if (!tocou) {
        trail.pop();
        trail.unshift([vw * 0.5 + Math.sin(t * 0.5) * vw * 0.3, vh * 0.5 + Math.cos(t * 0.37) * vh * 0.3]);
      }
      csx += ((tocou ? px : vw / 2) - csx) * 0.12;
      csy += ((tocou ? py : vh / 2) - csy) * 0.12;
      raiz.current.style.setProperty("--px", ((csx / vw - 0.5) * 2).toFixed(3));
      raiz.current.style.setProperty("--py", ((csy / vh - 0.5) * 2).toFixed(3));

      // janelas: texto (1) abre o tecido; capa, foto e vídeo (2) fazem buraco e soltam a cor em volta
      uI.fill(0);
      let n = 0;
      document.querySelectorAll("[data-abre]").forEach((el) => {
        if (n >= 8) return;
        const i = +el.dataset.abre;
        const o = ops[i];
        if (o < 0.02) return;
        const r = el.getBoundingClientRect();
        const foto = el.dataset.tipo === "foto";
        uR[n * 4] = r.left;
        uR[n * 4 + 1] = r.top;
        uR[n * 4 + 2] = r.right;
        uR[n * 4 + 3] = r.bottom;
        uI[n * 4] = foto ? 2 : 1;
        uI[n * 4 + 1] = o;
        if (foto) {
          const p = getPal(i);
          const c = el._cor || (el._cor = p[2]);
          uC[n * 3] = c[0];
          uC[n * 3 + 1] = c[1];
          uC[n * 3 + 2] = c[2];
        }
        n++;
      });
      for (let q = 0; q < 6; q++) {
        uT6[q * 2] = trail[q][0];
        uT6[q * 2 + 1] = trail[q][1];
      }

      gl.uniform2f(U.uRes, vw, vh);
      gl.uniform1f(U.uDpr, dpr);
      gl.uniform1f(U.uT, t);
      gl.uniform1f(U.uS, S);
      gl.uniform1f(U.uF, f);
      gl.uniform1f(U.uPatA, CAPITULOS[ic].pat);
      gl.uniform1f(U.uPatB, CAPITULOS[nB].pat);
      gl.uniform1f(U.uOpA, ops[ic]);
      gl.uniform1f(U.uOpB, ic === nB ? 0 : ops[nB]);
      gl.uniform1f(U.uPushOn, tocou ? 1 : 0);
      gl.uniform1f(U.uLR, Math.max(150, vh * 0.3));
      gl.uniform3fv(U.uPA0, palA[0]); gl.uniform3fv(U.uPA1, palA[1]); gl.uniform3fv(U.uPA2, palA[2]);
      gl.uniform3fv(U.uPB0, palB[0]); gl.uniform3fv(U.uPB1, palB[1]); gl.uniform3fv(U.uPB2, palB[2]);
      gl.uniform2fv(U.uTrail, uT6);
      gl.uniform2f(U.uPush, csx, csy);
      gl.uniform3f(U.uK, klk[0], klk[1], klk[2]);
      gl.uniform4fv(U.uR, uR);
      gl.uniform4fv(U.uI, uI);
      gl.uniform3fv(U.uC, uC);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      const tg = tag.current;
      if (tg) {
        const p = PADROES[CAPITULOS[f > 0.5 ? nB : ic].pat];
        if (tg.dataset.n !== p.nome) {
          tg.dataset.n = p.nome;
          tg.innerHTML = `<b>${p.nome}</b> “${p.trad}”`;
        }
        tg.style.opacity = tocou && sobreFundo ? "1" : "0";
        tg.style.transform = `translate3d(${px + 18}px, ${py + 14}px, 0)`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("resize", monta);
      document.documentElement.style.cssText = antes[0];
      document.body.style.cssText = antes[1];
    };
  }, []);

  const cap = (i) => (n) => (caps.current[i] = n);

  return (
    <main ref={raiz} className={styles.raiz}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Reenie+Beanie&family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap"
      />
      <canvas ref={cv} className={styles.tela} aria-hidden="true" />
      <div ref={tag} className={styles.tag} aria-hidden="true" />
      <VoltarJodo />
      <MarcaTopo nome="VBLXW" extras={[{ rotulo: "Bruxos do Norte", href: "/artistas/bruxos-do-norte" }]} cor="#e9dfc9" fonte='"Reenie Beanie", "Segoe Script", cursive' escala={1.7} />
      <nav className={styles.fio} data-fio="1" aria-label="capítulos">
        <i className={styles.fioLinha}><b data-fiofill="1" /></i>
        {NOMES.map((n, k) => (
          <button key={n} type="button" data-n={n} aria-label={n} onClick={() => irPara(k)}>
            <span>{String(k + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </nav>
      <button type="button" className={styles.topo} data-topo="1" aria-label="voltar ao topo" onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>
        <span>↑</span>
        <small>topo</small>
      </button>
      <div className={styles.palco}>
        {/* capa: título gigante, a foto no centro sobrepondo a borda das letras, a bio nas laterais */}
        <section ref={cap(0)} className={`${styles.cap} ${styles.capa}`}>
          <Rv k={0} as="span" className={`${styles.rot} ${styles.rotTopo}`}>rapper · Bruxos do Norte · Manaus</Rv>
          <h1 className={styles.sr}>Vicente Blow</h1>
          <Tece cap={0} txt="VICENTE BLOW" className={`${styles.tTit} ${styles.tDesk}`} style={titulo("VICENTE BLOW", 27)} />
          <Tece cap={0} txt="VICENTE" className={`${styles.tTit} ${styles.tMob}`} style={titulo("VICENTE", 8.5)} />
          <Tece cap={0} txt="BLOW" className={`${styles.tTit} ${styles.tMob}`} style={titulo("BLOW", 8.5)} />
          <div className={`${styles.tres} ${styles.tresCapa}`}>
            <div className={styles.lado} data-abre="0" data-tipo="txt">
              <Rv k={2} as="p" className={styles.italico}>nasceu marcado. sobreviveu rimando.</Rv>
              <Rv k={3} as="p" className={styles.corpo}>
                Nascido em 99, com o cordão umbilical enrolado no pescoço. Marcado para morrer, <mark>desafiou Deus e matou o próprio senhor destino.</mark>
              </Rv>
            </div>
            <div className={styles.fotoBloco}>
              <Rv k={2} className={`${styles.moldura} ${styles.molduraCapa}`} data-abre="0" data-tipo="foto">
                <div className={`${styles.foto} ${styles.tilt}`} data-fotos="1" onMouseMove={inclina} onMouseLeave={desinclina}>
                  {FOTOS.map((f, n) => (
                    <img key={f} className={n === foto.cur ? styles.ativa : ""} src={`/vb/f/${f}.webp`} alt={n === 0 ? "Vicente Blow" : ""} />
                  ))}
                  {foto.nxt >= 0 &&
                    Array.from({ length: NT }, (_, k) => (
                      <div key={k} className={`${styles.tira} ${foto.go ? styles.vai : ""}`} style={{ left: `calc(${k} * 100% / ${NT})`, width: `calc(100% / ${NT})`, "--d": k % 2 ? NT - k : k }}>
                        <img src={`/vb/f/${FOTOS[foto.nxt]}.webp`} alt="" style={{ width: `${NT * 100}%`, left: `${-k * 100}%` }} />
                      </div>
                    ))}
                </div>
              </Rv>
              <div className={styles.redesFoto}>
                <a className={styles.redeIc} style={{ "--cor": "#1db954" }} href={PERFIS.spotify} target="_blank" rel="noreferrer" aria-label="Spotify">
                  <Marca id="spotify" />
                </a>
                <a className={styles.redeIc} style={{ "--cor": "#e1306c" }} href={PERFIS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram @bruxobuya">
                  <Marca id="instagram" />
                </a>
              </div>
            </div>
            <div className={`${styles.lado} ${styles.ladoD}`} data-abre="0" data-tipo="txt">
              <Rv k={3} as="p" className={styles.corpo}>
                Ver o mundo pelo pior lado foi sua terapia. Desenhar com sangue, seu primeiro ofício. O rap acendeu a consciência política: o ódio bruto virou <mark>munição organizada</mark> e a caneta, uma mira a laser apontada para o alvo mais forte, o Capital.
              </Rv>
              <Rv k={4} as="p" className={styles.epi}>a.k.a. inimigo número 1 do estado</Rv>
              <Rv k={5} className={styles.links}>
                <a className={styles.principal} href={PERFIS.spotify} target="_blank" rel="noreferrer">ouvir no Spotify ↗</a>
                <a className={styles.handle} href={PERFIS.instagram} target="_blank" rel="noreferrer">@bruxobuya ↗</a>
              </Rv>
            </div>
          </div>
          <Legenda cap={0} />
        </section>

        {/* um capítulo por trabalho: título de ponta a ponta, e embaixo informação | obra no centro | prévia */}
        {OBRAS.map((o, k) => {
          const d0 = achaDisco(o.capa || (o.itens && o.itens[0].capa));
          const fr = styles[`fr${k % 3}`];
          const vf = styles[`vf${(k + 1) % 3}`];
          const txt = o.linhas.join(" ");
          const info = (
            <div className={styles.lado} data-abre={o.cap} data-tipo="txt">
              <Rv k={0} as="p" className={styles.meta}>{o.rot} · {o.meta}</Rv>
              {o.nota && <Rv k={1} as="p" className={styles.corpo}>{o.nota}</Rv>}
              {o.letra && (
                <Rv k={2} as="blockquote" className={`${styles.letra} ${styles.letraTopo}`}>
                  {o.letra.l.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                  <cite>— {o.letra.c}</cite>
                </Rv>
              )}
              {o.ficha && o.ficha.length > 0 && (
                <Rv k={2} as="ul" className={`${styles.ficha} ${o.letra ? "" : styles.fichaTopo}`}>
                  {o.ficha.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </Rv>
              )}
              {!o.par && (
                <Rv k={3} className={styles.links}>
                  <a className={styles.principal} href={SP(o.sp)} target="_blank" rel="noreferrer">Spotify ↗</a>
                  <a href={o.ytUrl || YT(o.yt)} target="_blank" rel="noreferrer">{rotuloYt(o.tipoYt)}</a>
                </Rv>
              )}
            </div>
          );
          const citacao = (cls) =>
            o.letra && (
              <Rv k={3} as="blockquote" className={`${styles.letra} ${cls}`}>
                {o.letra.l.map((l) => (
                  <span key={l}>{l}</span>
                ))}
                <cite>— {o.letra.c}</cite>
              </Rv>
            );
          let centro, lateral;
          if (o.par) {
            centro = (
              <Rv k={2} className={`${styles.vid} ${styles.vidCentro} ${vf}`} data-abre={o.cap} data-tipo="foto">
                <a className={styles.vidLink} href={YT(o.itens[0].yt)} target="_blank" rel="noreferrer">
                  <video src={`/vb/v/${o.itens[0].video}.mp4`} muted loop playsInline autoPlay preload="auto" />
                  <span className={styles.rotulo}>Capital Crime · clipe</span>
                  <span className={styles.chip}>ver clipe ↗</span>
                </a>
              </Rv>
            );
            lateral = (
              <div className={styles.duo}>
                {o.itens.map((it, n) => {
                  const d = achaDisco(it.capa);
                  return (
                    <Rv key={it.capa} k={3 + n} className={`${styles.capaFr} ${styles[`fr${(k + n) % 3}`]}`} data-abre={o.cap} data-tipo="foto">
                      <a className={styles.tilt} href={SP(it.sp)} target="_blank" rel="noreferrer" onMouseMove={inclina} onMouseLeave={desinclina}>
                        <img src={`/vb/capas/${it.capa}.webp`} alt={`Capa de ${d.t}`} />
                      </a>
                      <span className={styles.legTile}>
                        <b>{d.t}</b>
                        <small className={styles.links}>
                          <a href={SP(it.sp)} target="_blank" rel="noreferrer">Spotify ↗</a>
                          <a href={YT(it.yt)} target="_blank" rel="noreferrer">{it.tipoYt === "clipe" ? "clipe ↗" : "YouTube ↗"}</a>
                        </small>
                      </span>
                    </Rv>
                  );
                })}
              </div>
            );
          } else {
            centro = (
              <Rv k={2} className={`${styles.capaFr} ${styles.capaCentro} ${fr}`} data-abre={o.cap} data-tipo="foto">
                <a className={styles.tilt} href={SP(o.sp)} target="_blank" rel="noreferrer" onMouseMove={inclina} onMouseLeave={desinclina}>
                  {o.contra ? (
                    // a prévia do visualizer já mostra a capa: no celular entra a contracapa; no desktop a capa vira a contracapa no hover
                    <span className={styles.flip} data-flip="1">
                      <img className={styles.flipFrente} src={`/vb/capas/${d0.capa}.webp`} alt={`Capa de ${d0.t}`} />
                      <img
                        className={styles.flipVerso}
                        src={`/vb/capas/${o.contra}.webp`}
                        alt={`Contracapa de ${d0.t}`}
                        onError={(e) => e.currentTarget.closest("[data-flip]").setAttribute("data-sem", "1")}
                      />
                    </span>
                  ) : (
                    <img src={`/vb/capas/${d0.capa}.webp`} alt={`Capa de ${d0.t}`} />
                  )}
                  <span className={`${styles.chip} ${o.chipDir ? styles.chipDir : ""}`}>ouvir no Spotify ↗</span>
                </a>
              </Rv>
            );
            lateral = o.video ? (
              <Rv k={3} className={`${styles.vid} ${styles.vidLado} ${vf}`} data-abre={o.cap} data-tipo="foto">
                <a className={styles.vidLink} href={o.ytUrl || YT(o.yt)} target="_blank" rel="noreferrer">
                  <video src={`/vb/v/${o.video}.mp4`} muted loop playsInline autoPlay preload="auto" />
                  <span className={styles.rotulo}>{o.tipoYt === "clipe" ? "prévia do clipe" : "prévia do visualizer"}</span>
                  <span className={styles.chip}>{o.tipoYt === "clipe" ? "ver clipe ↗" : "ver visualizer ↗"}</span>
                </a>
              </Rv>
            ) : null;
          }
          return (
            <section key={o.id} ref={cap(o.cap)} className={`${styles.cap} ${styles.obra} ${o.inv ? styles.inv : ""}`}>
              <Tece cap={o.cap} txt={txt} className={`${styles.tTit} ${styles.tDesk}`} style={titulo(txt, o.par ? 14 : 19)} />
              {o.linhas.map((l) => (
                <Tece key={l} cap={o.cap} txt={l} className={`${styles.tTit} ${styles.tMob}`} style={titulo(l, o.par ? 8 : 11)} />
              ))}
              <div className={`${styles.tres} ${o.par ? styles.tresPar : ""}`}>
                {info}
                {centro}
                <div className={`${styles.lado} ${styles.ladoD}`}>{lateral}</div>
                {!o.par && citacao(styles.letraLado)}
                {!o.par && !o.letra && o.ficha && o.ficha.length > 0 && (
                  <Rv k={3} as="ul" className={`${styles.ficha} ${styles.fichaLado}`}>
                    {o.ficha.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </Rv>
                )}
              </div>
              <Legenda cap={o.cap} />
            </section>
          );
        })}

        {/* o resto da discografia: uma linha */}
        <section ref={cap(CAP_OUTROS)} className={`${styles.cap} ${styles.outros}`}>
          <Rv k={0} as="span" className={`${styles.rot} ${styles.rotTopo}`}>singles e participações</Rv>
          <Tece cap={CAP_OUTROS} txt="E MAIS" className={styles.tTit} style={titulo("E MAIS", 19)} />
          <div className={styles.grade}>
            {OUTROS.map((it, n) => {
              const d = achaDisco(it.capa);
              if (!d) return null;
              const sp = it.sp ? SP(it.sp) : it.spUrl;
              return (
                <Rv key={it.capa} k={1 + n} className={styles.tile} data-abre={CAP_OUTROS} data-tipo="foto">
                  <a className={styles.tilt} href={sp} target="_blank" rel="noreferrer" onMouseMove={inclina} onMouseLeave={desinclina}>
                    <img src={`/vb/capas/${d.capa}.webp`} alt={`Capa de ${d.t}`} loading="lazy" />
                  </a>
                  <span className={styles.legTile}>
                    <b>{d.t}</b>
                    <em>{[`${d.data}.${d.ano}`, it.com].filter(Boolean).join(" · ")}</em>
                    <small className={styles.links}>
                      <a href={sp} target="_blank" rel="noreferrer">Spotify ↗</a>
                      <a href={YT(it.yt)} target="_blank" rel="noreferrer">YouTube ↗</a>
                    </small>
                  </span>
                </Rv>
              );
            })}
          </div>
          <Legenda cap={CAP_OUTROS} />
        </section>

        {/* ouvir: todas as redes dele e do grupo */}
        <section ref={cap(CAP_OUVIR)} className={`${styles.cap} ${styles.ouvir}`}>
          <Rv k={0} as="span" className={`${styles.rot} ${styles.rotTopo}`}>acende o som</Rv>
          <Tece cap={CAP_OUVIR} txt="ONDE OUVIR." className={`${styles.tTit} ${styles.tDesk}`} style={titulo("ONDE OUVIR.", 21)} />
          <Tece cap={CAP_OUVIR} txt="ONDE" className={`${styles.tTit} ${styles.tMob}`} style={titulo("ONDE", 14)} />
          <Tece cap={CAP_OUVIR} txt="OUVIR." className={`${styles.tTit} ${styles.tMob}`} style={titulo("OUVIR.", 14)} />
          <div className={styles.icones}>
            {REDES.map((r, n) => (
              <Rv key={r.id} k={1 + n} as="a" className={`${styles.icone} ${r.sub.startsWith("@") ? styles.iconeH : ""}`} href={r.url} target="_blank" rel="noreferrer" style={{ "--k": 1 + n, "--cor": r.cor }} aria-label={`${r.nome}: ${r.sub}`}>
                <Icone id={r.id} />
                <b>{r.nome}</b>
                <small>{r.sub}</small>
              </Rv>
            ))}
          </div>
          <Rv k={8} as="p" className={styles.fonte}>
            <span>Padrões: nomes e traduções do livro <i>Arte Baniwa: cestaria de arumã</i> (FOIRN e ISA, 2000).</span>
            <span>O tecido é recriado em código pela JODO.</span>
          </Rv>
          <Legenda cap={CAP_OUVIR} />
        </section>
      </div>
      <div ref={trilha} className={styles.trilha} />
    </main>
  );
}
