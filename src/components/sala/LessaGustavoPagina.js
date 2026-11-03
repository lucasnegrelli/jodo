"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Lenis from "lenis";
import { Anton, Courier_Prime, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import s from "@/styles/lessaGustavo.module.css";

/*
  Lessa Gustavo (Gustavo Lessa), Baixada Fluminense (RJ), formado em artes visuais; faz as próprias capas (música, arte conceitual, design e moda).
  Cada disco recente vira uma peça feita com a arte dele, trabalhada por um efeito que nasce da própria imagem:
  Muita Ostra e Pouca Pérola (a foto do mural vira água e vai ficando azul-marinho) · Sereno da Via Light (a luz que passa pela persiana de ferro)
  Antes Que Vire Carniça (a silhueta vermelha vira enxame) · Mojica (a mão, iluminada pelo cursor, em relevo) · Cor de Deus Quando Foge (a cor escorre e vai embora)
  Os discos antigos ficam no arquivo; os nomes das fichas abrem a rede de créditos.
*/
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--lg-anton", display: "swap" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--lg-courier", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--lg-serif", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--lg-plex", display: "swap" });

const LINKS = {
  spotify: "https://open.spotify.com/artist/1Fxj29J2wowDAzBFPzaTDQ", youtube: "https://www.youtube.com/channel/UCZDYrpQqQnDcdPHf6BkPlOA",
  instagram: "https://www.instagram.com/gessalustavo/", soundcloud: "https://soundcloud.com/lessagustavo", bandcamp: "https://lessagustavo.bandcamp.com/",
};
const PER = 2.2, N = 8;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ficha: [rótulo, [nomes]]. "Com" = aparece nas faixas (Spotify); os outros rótulos vêm dos créditos da capa, dos vídeos e do SoundCloud
const OBRAS = [
  { k: "instalacoes", sp: "74Yc275AmUjEq4TKkRYEyW", t: "Instalações Noturnas, Assuntos de Rua", a: 2017, tipo: "EP visual", obj: "colagem",
    faixas: ["A Mosca no Vidro e a Gota na Sopa de Letras", "Flow Caixa de Surpresa (De Frente a Fila Preferencial)", "Instalações Noturnas, Assuntos de Rua", "Peixes Ornamentais"],
    ficha: [["Com", ["Makalister", "l v k s"]]], vids: [["Instalações Noturnas, Assuntos de Rua", "y5G2MQcldEo"]] },
  { k: "catarina", sp: "3IqZB7ofhEhfJGIUFBSFgn", t: "Catarina", a: 2021, tipo: "disco", obj: "raio-x",
    faixas: ["Solução", "Flash!", "Opção", "Fevereiro", "Fofoca", "Cafona", "Bulletproof", "Penhasco", "Lilás"],
    ficha: [["Produção", ["an_tnio"]], ["Captação", ["Eduardo Mayrinck"]], ["Visualizer", ["Daniel Moraes", "Gerran Damasceno"]]], vids: [["Catarina (EP)", "Vsdiyt8xrYQ"]] },
  { k: "impasse", sp: "5NC7KkF9yJrbzxnqWX75oJ", t: "Impasse Mexicano", a: 2022, tipo: "disco", obj: "estampa",
    faixas: ["Introdução", "Castigo", "Trapaça", "Diss", "Maldade", "Vilões", "Tesouras"],
    ficha: [["Produção", ["EricBeatz", "Nnay Beats"]], ["Com", ["sódan.", "Marcão Baixada", "William Luis"]]], vids: [["Diss / Trapaça", "h0i5786zKl8"]] },
  { k: "wilson-grey", sp: "78Ke1XvJzDLunxiqIIaSjm", t: "Wilson Grey", a: 2022, tipo: "disco com Keith", obj: "serigrafia",
    faixas: ["Comunicação", "Um Brinde", "Papelada", "Bag Térmica", "Certezas", "O Júri", "Endorfina", "Mira Laser", "Débito", "Sumo", "Cédulas", "Jet Life"],
    ficha: [["Com", ["Keith", "CRIS.", "Sopa Preta", "Duvô", "ieti", "Vici", "Nulo", "Gil Daltro"]]],
    vids: [["Um Brinde", "JSmpowOqmuQ"], ["Papelada / Certezas", "jSpOTsipX9Y"], ["O Júri", "0tr6le7HwnI"], ["Jet Life", "MBOwk9rfe4M"]] },
  { k: "cor-de-deus", sp: "5Um3rpVuo4GAiomjpTMe6y", t: "Cor de Deus Quando Foge", a: 2023, tipo: "disco com Dawmata", obj: "adesivo",
    faixas: ["Quadrupede", "Deus Ex Machina", "Par de Brincos", "Loto", "Pó de Mico", "Um Deus", "Chamas", "Tempestade"],
    ficha: [["Instrumental e mix", ["Dawmata"]], ["Captação e master", ["Estúdio JRM"]], ["Com", ["CRIS.", "ieti", "Raro", "VND", "NFL MADMAXX", "2d intocável"]]],
    vids: [["Deus Ex Machina", "5IL1krGCcuo"], ["Quadrupede", "sIDGUBuA3xQ"], ["Audição", "QnQBoNSIHiU"]] },
  { k: "mojica", sp: "1dvJO8olhOrRA0PLHh8Lcv", t: "Mojica", a: 2023, tipo: "disco com CIANO", obj: "veludo",
    faixas: ["Mônaco", "Murros", "Bom Dia", "Manchete", "Brejo", "Pelo Fim da Tradição", "Fah Fah", "Advogado do Diabo", "Goteira", "Dó"],
    ficha: [["Produção", ["CIANO"]], ["Com", ["CRIS.", "Galf AC", "Bonsai", "Servo"]]],
    vids: [["Murros", "WFHfqc-aE4I"], ["Goteira", "cqczgTH0x6c"], ["Manchete", "10kg1fWsejI"], ["Pelo Fim da Tradição", "b0UVdYXOJcI"]] },
  { k: "uma-mao", sp: "7tzqCUBuZlHTsVJvy7YibP", t: "Uma Mão Lava a Outra", a: 2024, tipo: "single", obj: "polaroide",
    faixas: ["Uma Mão Lava a Outra"], ficha: [["Com", ["CRIS.", "Raro", "Pedro Saci"]]], vids: [] },
  { k: "antes-carnica", sp: "6ywOBiyQNNRLVZE3DWLrmr", t: "Antes Que Vire Carniça", a: 2024, tipo: "EP", obj: "serigrafia-vermelha",
    faixas: ["Luz", "Quantoskgcabemnessamala?", "Velas Molhadas", "Encruzilhada", "Luz Negra", "Kdmeubagulho?"],
    ficha: [["Com", ["ARPAK", "Vici", "CRIS.", "ieti"]], ["Mix e master", ["Roberto Lucaro"]]], vids: [["Kdmeubagulho?", "Jdxb13bki8U"]] },
  { k: "sereno", sp: "155leO5vwwn2NRWrJLNHkp", t: "Sereno da Via Light", a: 2025, tipo: "álbum com muitobomloopar", obj: "fita",
    faixas: ["Prantos", "Ruas da Grécia / Clube Silêncio", "Funil", "Salvação", "Slat!", "Gangorra", "Corte Julienne", "Entretenimento", "2002", "Vapo!", "Knockout / Quarto", "Globo da Morte", "Tchau!"],
    ficha: [["Faixas produzidas por", ["muitobomloopar"]], ["Escritas por", ["Lessa Gustavo"]], ["Mixagem e masterização", ["Marco Caramelli"]], ["Capa", ["Eduardo Severi", "Lessa Gustavo"]], ["Produção executiva", ["Igor Serra"]], ["Com", ["Sopa Preta", "Duvô", "SUB DELTA"]]],
    texto: "NCI 001 · NCI Media", vids: [["Slat!", "4Knz6ebUE3o"], ["2002 / Vapo!", "DqGRAyhzvxA"], ["Ruas da Grécia / Clube Silêncio", "f7tJLsSJiB4"]] },
  { k: "muita-ostra", sp: "1gM3ycRYJo4CLs3mbaiib6", t: "Muita Ostra e Pouca Pérola", a: 2026, tipo: "EP com Mazé Foram", obj: "xerox",
    faixas: ["Tubarão Martelo", "Farsa e Tempo", "Na Boca da Orca", "Uma Jangada na Lava", "Azul Marinho", "Cortinas e Lençóis"],
    ficha: [["Com", ["Mazé Foram", "obelga"]]], vids: [] },
];
OBRAS.forEach((o) => { o.pessoas = [...new Set(o.ficha.flatMap((f) => f[1]))]; });
const IDX = Object.fromEntries(OBRAS.map((o, i) => [o.k, i]));
const ARQUIVO = ["instalacoes", "catarina", "impasse", "wilson-grey", "uma-mao"].map((k) => IDX[k]);
// onde as seis faixas do EP boiam na foto (em % da tela)
const BOIAS = [[18, 32], [34, 62], [52, 28], [66, 58], [80, 34], [88, 68]];

function embedDe(a) {
  if (a.yt) return { tipo: "yt", src: `https://www.youtube-nocookie.com/embed/${a.yt}?autoplay=1&rel=0`, fora: `https://www.youtube.com/watch?v=${a.yt}` };
  if (a.sp) return { tipo: "sp", src: `https://open.spotify.com/embed/album/${a.sp}`, fora: `https://open.spotify.com/album/${a.sp}` };
  return null;
}

/* ---------- as peças com a arte: um shader para cada capa ---------- */
const PRE = `precision highp float; uniform sampler2D uTex; uniform float uT,uU; uniform vec2 uR,uM; varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
vec2 fit(vec2 uv){ vec2 q=uv-.5; float a=uR.x/uR.y; if(a>=1.) q.x*=a; else q.y/=a; return q+.5; }
float lum(vec3 c){ return dot(c,vec3(.3,.59,.11)); }`;

const SHADERS = {
  // a foto do mural vira água; com a rolagem ela vai ficando azul-marinho
  ostra: `${PRE}
    void main(){ vec2 uv=fit(vUv); vec2 p=uv*6.; float t=uT*.6; float asp=uR.x/uR.y;
      vec2 d=vec2(sin(p.y*3.+t)+sin(p.y*7.-t*1.3), cos(p.x*3.-t)+cos(p.x*6.+t*1.1))*.0045;
      vec2 dm=(vUv-uM)*vec2(asp,1.); float r=length(dm); d+=normalize(dm+1e-4)*sin(r*38.-uT*4.)*exp(-r*5.)*.014;
      vec3 c=texture2D(uTex,uv+d*(1.+uU*2.)).rgb; float l=lum(c);
      vec3 azul=vec3(.015,.11,.30), claro=vec3(.66,.86,.95); vec3 col=mix(vec3(l), mix(azul,claro,l*l*1.3), smoothstep(.0,.55,uU));
      float cau=pow(abs(sin(p.x*4.+sin(p.y*3.+t))*sin(p.y*4.+sin(p.x*3.-t))),6.)*.4*smoothstep(.1,.6,uU); col+=cau*vec3(.45,.8,1.);
      col*=1.-.55*smoothstep(.55,1.1,length((vUv-.5)*vec2(asp*.7,1.))); col+=(hash(vUv*uR+uT)-.5)*.06; gl_FragColor=vec4(col,1.); }`,
  // a luz entra pela persiana de ferro e varre a foto
  sereno: `${PRE}
    void main(){ vec2 uv=fit(vUv); float asp=uR.x/uR.y; vec3 c=texture2D(uTex,uv).rgb; float l=lum(c);
      vec3 base=mix(c,vec3(l)*vec3(1.,.94,.82),.8);
      float ang=.5+uM.x*.5-.25; vec2 q=vUv*vec2(asp,1.); float f=fract((q.y*cos(ang)+q.x*sin(ang))*7.+uU*5.+uT*.03);
      float luz=smoothstep(.0,.07,f)*(1.-smoothstep(.42,.5,f)); float borda=smoothstep(.0,.07,f)*(1.-smoothstep(.42,.5,f));
      vec3 col=base*mix(.12,1.25,luz)+vec3(1.,.82,.5)*luz*.1*smoothstep(.3,.9,l);
      col+=(hash(vUv*uR+uT*.5)-.5)*.05; col*=1.-.5*smoothstep(.5,1.1,length((vUv-.5)*vec2(asp*.7,1.))); gl_FragColor=vec4(col,1.); }`,
  // a mão em relevo, iluminada pelo cursor
  mojica: `${PRE}
    float h(vec2 p){ return lum(texture2D(uTex,p).rgb); }
    void main(){ vec2 uv=fit(vUv); float asp=uR.x/uR.y; vec2 e=vec2(1./560.,0.);
      vec3 n=normalize(vec3((h(uv-e)-h(uv+e))*7.,(h(uv-e.yx)-h(uv+e.yx))*7.,1.));
      vec2 lp=(uM-vUv)*vec2(asp,1.); vec3 L=normalize(vec3(lp*2.2,.5)); float dif=clamp(dot(n,L),0.,1.); vec3 H=normalize(L+vec3(0.,0.,1.)); float spe=pow(clamp(dot(n,H),0.,1.),36.);
      vec3 c=texture2D(uTex,uv).rgb; float ouro=smoothstep(.12,.4,c.r*c.g-c.b*.5)*step(.45,c.r);
      vec3 col=c*(.16+dif*1.2)+spe*mix(vec3(.9,.95,1.),vec3(1.,.82,.4),ouro)*.7;
      float halo=exp(-length(lp)*2.2)*.18; col+=halo*vec3(.5,1.,.6)*smoothstep(.0,.6,uU+.4); col*=1.-.5*smoothstep(.5,1.1,length((vUv-.5)*vec2(asp*.7,1.)));
      col+=(hash(vUv*uR+uT*.3)-.5)*.04; gl_FragColor=vec4(col,1.); }`,
  // a cor escorre e foge da imagem
  cor: `${PRE}
    void main(){ vec2 uv=fit(vUv); float asp=uR.x/uR.y; float u=uU;
      float gota=noise(vec2(uv.x*14.,uT*.05))*.6+noise(vec2(uv.x*37.,3.))*.4;
      uv.y+=u*u*u*gota*.4*smoothstep(.0,.6,1.-uv.y+.2);
      uv.x+=sin(uv.y*18.+uT*.8)*.003*u;
      vec3 c=texture2D(uTex,uv).rgb; float l=lum(c); float verm=smoothstep(.12,.5,c.r-max(c.g,c.b));
      vec3 cinza=vec3(l)*vec3(.95,.97,.9); vec3 col=mix(c,cinza,clamp(u*1.3,0.,1.)*mix(.35,1.,verm));
      vec2 dm=(vUv-uM)*vec2(asp,1.); col=mix(col,c,exp(-length(dm)*5.)*.65);
      col*=1.-.4*smoothstep(.55,1.1,length((vUv-.5)*vec2(asp*.7,1.))); col+=(hash(vUv*uR+uT*.4)-.5)*.045; gl_FragColor=vec4(col,1.); }`,
};

function Arte({ st, src, tipo, espelha = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const r = new THREE.WebGLRenderer({ antialias: false });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    el.appendChild(r.domElement); r.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    const cena = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const tex = new THREE.TextureLoader().load(src); tex.wrapS = tex.wrapT = espelha ? THREE.MirroredRepeatWrapping : THREE.ClampToEdgeWrapping; tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter;
    const u = { uTex: { value: tex }, uT: { value: 0 }, uU: { value: 0 }, uR: { value: new THREE.Vector2(1, 1) }, uM: { value: new THREE.Vector2(0.5, 0.5) } };
    const m = new THREE.ShaderMaterial({ uniforms: u, vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }", fragmentShader: SHADERS[tipo] });
    cena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m));
    const fit = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; r.setSize(w, h, false); u.uR.value.set(w, h); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el);
    let raf = 0, vivo = true; const t0 = performance.now();
    const laco = (now) => {
      if (!vivo) return; raf = requestAnimationFrame(laco);
      if (!st.vis) return;
      u.uT.value = (now - t0) / 1000; u.uU.value = st.u;
      u.uM.value.x += ((st.px * 0.5 + 0.5) - u.uM.value.x) * 0.1; u.uM.value.y += ((1 - (st.py * 0.5 + 0.5)) - u.uM.value.y) * 0.1;
      r.render(cena, cam);
    };
    raf = requestAnimationFrame(laco);
    return () => { vivo = false; cancelAnimationFrame(raf); ro.disconnect(); tex.dispose(); m.dispose(); r.dispose(); r.domElement.remove(); };
  }, [st, src, tipo, espelha]);
  return <div ref={ref} className={s.arte} aria-hidden="true" />;
}

/* a silhueta vermelha de Antes Que Vire Carniça: milhares de pontos que, com a rolagem, soltam-se e sobem como enxame */
function Enxame({ st }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, g = cv.getContext("2d"); let W = 1, H = 1, dpr = 1, raf = 0, vivo = true, pts = null, tempo = 0;
    const fit = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth || 1; H = cv.clientHeight || 1; cv.width = W * dpr; cv.height = H * dpr; };
    fit(); const ro = new ResizeObserver(fit); ro.observe(cv);
    const im = new Image();
    im.onload = () => {
      const S = 360, t = document.createElement("canvas"); t.width = t.height = S; const tg = t.getContext("2d"); tg.drawImage(im, 0, 0, S, S);
      const d = tg.getImageData(0, 0, S, S).data, lista = [];
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4; if (d[i] > 150 && d[i + 1] < 90 && d[i + 2] < 90) lista.push(x / S, y / S); }
      const n = lista.length / 2;
      pts = { n, hx: new Float32Array(n), hy: new Float32Array(n), x: new Float32Array(n), y: new Float32Array(n), vx: new Float32Array(n), vy: new Float32Array(n), r: new Float32Array(n), livre: new Uint8Array(n) };
      for (let i = 0; i < n; i++) { pts.hx[i] = lista[i * 2]; pts.hy[i] = lista[i * 2 + 1]; pts.r[i] = Math.random(); pts.x[i] = pts.hx[i]; pts.y[i] = pts.hy[i]; }
    };
    im.src = "/lg/antes-carnica.jpg";
    const laco = () => {
      if (!vivo) return; raf = requestAnimationFrame(laco);
      if (!st.vis || !pts) return;
      tempo += 0.016; const lado = Math.min(W, H) * 0.98, ox = W * (W > H ? 0.3 : 0.5) - lado / 2, oy = H * 0.5 - lado / 2, dec = st.u * 1.35;
      const mx = (st.px * 0.5 + 0.5) * W, my = (st.py * 0.5 + 0.5) * H;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = "#070707"; g.fillRect(0, 0, W, H);
      const tam = Math.max(1.4, lado / 260);
      for (let i = 0; i < pts.n; i++) {
        const hx = ox + pts.hx[i] * lado, hy = oy + pts.hy[i] * lado;
        let x = pts.x[i] * lado + ox, y = pts.y[i] * lado + oy;
        if (dec > pts.r[i]) {
          // solto: sobe e flutua como mosca
          pts.vx[i] += (Math.sin(tempo * 2 + i) * 0.05 + (Math.random() - 0.5) * 0.12) / lado * 40; pts.vy[i] -= 0.002 * (0.5 + pts.r[i]);
          pts.vx[i] *= 0.97; pts.vy[i] *= 0.985; pts.x[i] += pts.vx[i] / 60; pts.y[i] += pts.vy[i] / 60 * 8;
          if (pts.y[i] < -0.1) { pts.y[i] = 1.1; pts.x[i] = Math.random(); }
          g.fillStyle = `rgba(${40 + Math.floor(pts.r[i] * 90)},8,8,${0.55 + 0.4 * Math.sin(tempo * 9 + i)})`;
        } else {
          pts.x[i] += (pts.hx[i] - pts.x[i]) * 0.12; pts.y[i] += (pts.hy[i] - pts.y[i]) * 0.12;
          const dx = x - mx, dy = y - my, dd = dx * dx + dy * dy;
          if (dd < 6000) { const f = (1 - dd / 6000) * 0.02; pts.x[i] += (dx / lado) * f * 6; pts.y[i] += (dy / lado) * f * 6; }
          g.fillStyle = "#e6231c";
        }
        g.fillRect(x, y, tam, tam);
      }
    };
    raf = requestAnimationFrame(laco);
    return () => { vivo = false; cancelAnimationFrame(raf); ro.disconnect(); };
  }, [st]);
  return <canvas ref={ref} className={s.arte} aria-hidden="true" />;
}

export default function LessaGustavoPagina() {
  const trilha = useRef(null), cenas = useRef([]), lenis = useRef(null), ups = useRef({}), ptr = useRef({ px: 0, py: 0 });
  const sts = useRef(null);
  if (!sts.current) sts.current = Array.from({ length: N }, () => ({ u: 0, vis: false, px: 0, py: 0 }));
  const [modo, setModo] = useState("obras"), [sel, setSel] = useState(null), [atual, setAtual] = useState(0), [player, setPlayer] = useState(null), [hov, setHov] = useState(null);
  const [monta, setMonta] = useState("0,1"), [gav, setGav] = useState(null);
  const playerRef = useRef(null); playerRef.current = player;
  const modoRef = useRef(modo); modoRef.current = modo;
  const abre = (a) => { const e = embedDe(a); if (e) setPlayer(e); };
  const fecha = () => setPlayer(null);
  const tem = (k) => monta.split(",").includes(String(k));
  const refCena = (k) => (el) => { cenas.current[k] = el; };

  const vaiPara = (k) => { const y = trilha.current.getBoundingClientRect().top + scrollY + k * PER * innerHeight + 2; lenis.current?.scrollTo(y, { duration: 1.5 }); };
  const comSel = (nome) => OBRAS.map((o, i) => (o.pessoas.includes(nome) ? i : -1)).filter((i) => i >= 0);
  const escolhe = (nome) => setSel((x) => (x === nome ? null : nome));
  const abreRede = (nome) => { setSel(nome); setGav(null); setModo("rede"); };

  // o motor: uma câmera percorre a trilha; as peças se dissolvem uma na outra
  useEffect(() => {
    const b = document.body.style.overflowX, h = document.documentElement.style.overflowX;
    document.body.style.overflowX = "clip"; document.documentElement.style.overflowX = "clip";
    const lx = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 }); lenis.current = lx;
    let raf = 0, ultM = "", ultA = -1;
    const quadro = (t) => {
      raf = requestAnimationFrame(quadro); lx.raf(t);
      const tr = trilha.current; if (!tr) return;
      const rc = tr.getBoundingClientRect(), vh = innerHeight;
      const p = clamp(-rc.top / (PER * vh), 0, N - 0.001), dentro = rc.top < vh && rc.bottom > 0;
      const rs = Array.from({ length: N }, (_, k) => (k === 0 ? 1 : clamp((p - (k - 0.3)) / 0.3)));
      const mt = [];
      for (let k = 0; k < N; k++) {
        const el = cenas.current[k]; if (!el) continue;
        const u = clamp(p - k), vis = dentro && rs[k] > 0 && !(k < N - 1 && rs[k + 1] >= 1);
        el.style.visibility = vis ? "visible" : "hidden";
        if (vis) { el.style.opacity = rs[k].toFixed(3); el.style.setProperty("--u", u.toFixed(4)); }
        const st = sts.current[k]; st.u = u; st.vis = vis; st.px = ptr.current.px; st.py = ptr.current.py;
        if (Math.abs(k - p) < 1.6) mt.push(k);
      }
      const m = mt.join(","); if (m !== ultM) { ultM = m; setMonta(m); }
      const a = Math.min(N - 1, Math.floor(p + 0.35)); if (a !== ultA) { ultA = a; setAtual(a); }
    };
    raf = requestAnimationFrame(quadro);
    const tecla = (e) => { if (e.key === "Escape") { if (playerRef.current) fecha(); else if (modoRef.current === "rede") setModo("obras"); else setGav(null); } };
    addEventListener("keydown", tecla);
    return () => { cancelAnimationFrame(raf); lx.destroy(); lenis.current = null; removeEventListener("keydown", tecla); document.body.style.overflowX = b; document.documentElement.style.overflowX = h; };
  }, []);
  useEffect(() => { if (player || modo === "rede") lenis.current?.stop(); else lenis.current?.start(); }, [player, modo]);
  const mexe = (e) => { ptr.current = { px: (e.clientX / innerWidth) * 2 - 1, py: (e.clientY / innerHeight) * 2 - 1 }; };

  // a rede: as obras num anel no centro, as pessoas num anel de fora, linhas entre quem aparece em quê
  const GRAFO = useMemo(() => {
    const n = OBRAS.length, ang = (i) => -Math.PI / 2 + (i / n) * 2 * Math.PI;
    const mapa = new Map(); OBRAS.forEach((o, i) => o.pessoas.forEach((p) => { if (!mapa.has(p)) mapa.set(p, []); mapa.get(p).push(i); }));
    const lista = [...mapa.entries()].map(([nome, ws]) => ({ nome, ws, a: Math.atan2(ws.reduce((x, i) => x + Math.sin(ang(i)), 0), ws.reduce((x, i) => x + Math.cos(ang(i)), 0)) })).sort((x, y) => x.a - y.a);
    lista.forEach((p, i) => { p.ang = -Math.PI / 2 + (i / lista.length) * 2 * Math.PI; p.x = Math.cos(p.ang) * 350; p.y = Math.sin(p.ang) * 318; });
    return { pessoas: lista, obras: OBRAS.map((o, i) => ({ i, x: Math.cos(ang(i)) * 178, y: Math.sin(ang(i)) * 150 })) };
  }, []);
  const ativoNome = hov || sel;
  const ativoObras = ativoNome ? new Set(GRAFO.pessoas.find((p) => p.nome === ativoNome)?.ws || []) : null;

  const G = gav != null ? OBRAS[gav] : null;
  const nomeBt = (nome) => <button key={nome} className={`${s.nome} ${sel === nome ? s.nomeOn : ""}`} onClick={() => abreRede(nome)} title={`Ver a rede de ${nome}`}>{nome}</button>;
  const gavBt = (i, rot = "Faixas e créditos") => <button className={s.gavBt} onClick={() => setGav(gav === i ? null : i)}>{gav === i ? "Fechar ✕" : rot}</button>;

  return (
    <main className={`${s.raiz} ${anton.variable} ${courier.variable} ${serif.variable} ${plex.variable}`} onPointerMove={mexe}>
      <VoltarJodo />
      <MarcaTopo nome="Lessa Gustavo" cor="#e6231c" plano escala={1.05} />
      <div className={s.modos} role="tablist" aria-label="Modo de leitura">
        <button role="tab" aria-selected={modo === "obras"} className={modo === "obras" ? s.modoOn : ""} onClick={() => setModo("obras")}>Obras</button>
        <button role="tab" aria-selected={modo === "rede"} className={modo === "rede" ? s.modoOn : ""} onClick={() => setModo("rede")}>Rede</button>
      </div>

      <div ref={trilha} className={s.trilha} style={{ height: `${N * PER * 100}svh` }}>
        <div className={s.palco}>

          {/* 0 · abertura */}
          <section ref={refCena(0)} className={`${s.cena} ${s.abre}`} aria-label="Lessa Gustavo">
            <p className={s.abTopo}>Artes visuais · música · design · moda · Baixada Fluminense, RJ</p>
            <h1><span>Lessa</span><span>Gustavo</span></h1>
            <p className={s.abPlaca}>Faz as próprias capas. Cada disco recente aqui é uma peça feita com a arte dele.</p>
            <div className={s.abCapas}>{OBRAS.map((o) => <img key={o.k} src={`/lg/${o.k}.jpg`} alt="" draggable="false" />)}</div>
            <p className={s.rola}>rola ↓</p>
          </section>

          {/* 1 · Muita Ostra e Pouca Pérola */}
          <section ref={refCena(1)} className={`${s.cena} ${s.pec} ${s.pOstra}`} aria-label="Muita Ostra e Pouca Pérola">
            {tem(1) ? <Arte st={sts.current[1]} src="/lg/muita-ostra.jpg" tipo="ostra" espelha /> : null}
            <h2 className={s.tOstra}>Muita ostra<br /><em>e pouca pérola</em></h2>
            <p className={s.sub}>EP · 2026 · 6 faixas · com Mazé Foram</p>
            <ul className={s.boias}>{BOIAS.map(([x, y], i) => (
              <li key={i} style={{ left: `${x}%`, top: `${y}%`, "--i": i }}><button onClick={() => abre({ sp: OBRAS[IDX["muita-ostra"]].sp })} aria-label={OBRAS[IDX["muita-ostra"]].faixas[i]}><i /><span>{OBRAS[IDX["muita-ostra"]].faixas[i]}</span></button></li>))}
            </ul>
            <div className={s.pe}><button className={s.ouvir} onClick={() => abre({ sp: OBRAS[IDX["muita-ostra"]].sp })}>Ouvir o EP</button>{gavBt(IDX["muita-ostra"])}</div>
          </section>

          {/* 2 · Sereno da Via Light */}
          <section ref={refCena(2)} className={`${s.cena} ${s.pec} ${s.pSereno}`} aria-label="Sereno da Via Light">
            {tem(2) ? <Arte st={sts.current[2]} src="/lg/sereno-rot.jpg" tipo="sereno" espelha /> : null}
            <h2 className={s.tSereno}>Sereno<br />da Via<br />Light</h2>
            <p className={s.sub}>álbum · 2025 · 13 faixas · com muitobomloopar · NCI Media</p>
            <div className={s.pe}><button className={s.ouvir} onClick={() => abre({ sp: OBRAS[IDX.sereno].sp })}>Ouvir o álbum</button>{OBRAS[IDX.sereno].vids.slice(0, 2).map(([t, id]) => <button key={id} className={s.gavBt} onClick={() => abre({ yt: id })}>▸ {t}</button>)}{gavBt(IDX.sereno)}</div>
          </section>

          {/* 3 · Antes Que Vire Carniça */}
          <section ref={refCena(3)} className={`${s.cena} ${s.pec} ${s.pCarn}`} aria-label="Antes Que Vire Carniça">
            {tem(3) ? <Enxame st={sts.current[3]} /> : null}
            <h2 className={s.tCarn}>Antes que<br />vire carniça</h2>
            <p className={s.sub}>EP · 2024 · 6 faixas · role e a silhueta se solta</p>
            <div className={s.pe}><button className={s.ouvir} onClick={() => abre({ sp: OBRAS[IDX["antes-carnica"]].sp })}>Ouvir o EP</button><button className={s.gavBt} onClick={() => abre({ yt: "Jdxb13bki8U" })}>▸ Kdmeubagulho?</button>{gavBt(IDX["antes-carnica"])}</div>
          </section>

          {/* 4 · Mojica */}
          <section ref={refCena(4)} className={`${s.cena} ${s.pec} ${s.pMojica}`} aria-label="Mojica">
            {tem(4) ? <Arte st={sts.current[4]} src="/lg/mojica.jpg" tipo="mojica" /> : null}
            <h2 className={s.tMojica}>Mojica</h2>
            <p className={s.sub}>álbum · 2023 · com CIANO · 10 faixas · a luz segue o cursor</p>
            <div className={s.pe}><button className={s.ouvir} onClick={() => abre({ sp: OBRAS[IDX.mojica].sp })}>Ouvir o álbum</button>{OBRAS[IDX.mojica].vids.slice(0, 2).map(([t, id]) => <button key={id} className={s.gavBt} onClick={() => abre({ yt: id })}>▸ {t}</button>)}{gavBt(IDX.mojica)}</div>
          </section>

          {/* 5 · Cor de Deus Quando Foge */}
          <section ref={refCena(5)} className={`${s.cena} ${s.pec} ${s.pCor}`} aria-label="Cor de Deus Quando Foge">
            {tem(5) ? <Arte st={sts.current[5]} src="/lg/cor-de-deus.jpg" tipo="cor" /> : null}
            <h2 className={s.tCor}>Cor de Deus<br />quando foge</h2>
            <p className={s.sub}>álbum · 2023 · com Dawmata · 8 faixas · role e a cor escorre</p>
            <div className={s.pe}><button className={s.ouvir} onClick={() => abre({ sp: OBRAS[IDX["cor-de-deus"]].sp })}>Ouvir o álbum</button>{OBRAS[IDX["cor-de-deus"]].vids.slice(0, 1).map(([t, id]) => <button key={id} className={s.gavBt} onClick={() => abre({ yt: id })}>▸ {t}</button>)}{gavBt(IDX["cor-de-deus"])}</div>
          </section>

          {/* 6 · o arquivo */}
          <section ref={refCena(6)} className={`${s.cena} ${s.arq}`} aria-label="O arquivo">
            <p className={s.arTopo}>O arquivo · 2017 a 2024</p>
            <ul className={s.arLista}>{ARQUIVO.map((i) => { const o = OBRAS[i]; return (
              <li key={o.k} className={s["o_" + o.obj]}>
                <button className={s.arObj} onClick={() => setGav(gav === i ? null : i)} aria-label={`${o.t}, ${o.a}`}><img src={`/lg/${o.k}.jpg`} alt={`Capa de ${o.t}`} draggable="false" loading="lazy" /></button>
                <p><b>{o.t}</b><span>{o.a} · {o.tipo}</span></p>
              </li>); })}</ul>
          </section>

          {/* 7 · colofão */}
          <section ref={refCena(7)} className={`${s.cena} ${s.colofao}`} aria-label="Ouvir e seguir">
            <h2>Ouvir, ver, seguir.</h2>
            <nav className={s.colLinks} aria-label="Onde ouvir e seguir">
              <a href={LINKS.spotify} target="_blank" rel="noopener noreferrer"><b>Spotify</b><span>todos os discos</span></a>
              <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer"><b>YouTube</b><span>lessa gustavo · os vídeos</span></a>
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer"><b>Instagram</b><span>@gessalustavo</span></a>
              <a href={LINKS.soundcloud} target="_blank" rel="noopener noreferrer"><b>SoundCloud</b><span>lessagustavo</span></a>
              <a href={LINKS.bandcamp} target="_blank" rel="noopener noreferrer"><b>Bandcamp</b><span>lessagustavo</span></a>
            </nav>
            <button className={s.topo} onClick={() => vaiPara(0)}><span aria-hidden="true">↑</span> Voltar ao topo</button>
          </section>

          <nav className={s.indice} aria-label="Peças">
            {["Lessa Gustavo", "Muita Ostra", "Sereno da Via Light", "Antes Que Vire Carniça", "Mojica", "Cor de Deus", "Arquivo", "Fim"].map((n, k) => <button key={n} className={atual === k ? s.indiceOn : ""} onClick={() => vaiPara(k)} aria-label={n}><span>{n}</span></button>)}
          </nav>

          {/* gaveta: faixas e créditos de qualquer obra */}
          {G ? (
            <aside className={s.gaveta} aria-label={`Faixas e créditos de ${G.t}`}>
              <button className={s.gFecha} onClick={() => setGav(null)} aria-label="Fechar">✕</button>
              <p className={s.gTopo}>{G.a} · {G.tipo} · {G.faixas.length} {G.faixas.length === 1 ? "faixa" : "faixas"}</p>
              <h3>{G.t}</h3>
              <dl>{G.ficha.map(([rot, nomes]) => <div key={rot}><dt>{rot}</dt><dd>{nomes.map(nomeBt)}</dd></div>)}</dl>
              {G.texto ? <p className={s.gTexto}>{G.texto}</p> : null}
              <ol>{G.faixas.map((f, j) => <li key={f}><button onClick={() => abre({ sp: G.sp })}><i>{String(j + 1).padStart(2, "0")}</i>{f}</button></li>)}</ol>
              <p className={s.gAcoes}><button className={s.ouvir} onClick={() => abre({ sp: G.sp })}>Ouvir</button>{G.vids.map(([t, id]) => <button key={id} className={s.gavBt} onClick={() => abre({ yt: id })}>▸ {t}</button>)}</p>
            </aside>
          ) : null}
        </div>
      </div>

      {/* modo rede */}
      {modo === "rede" ? (
        <div className={s.rede} role="dialog" aria-label="Rede de créditos">
          <p className={s.redeTopo}>Rede · {GRAFO.pessoas.length} nomes em {OBRAS.length} obras. Passe o mouse ou toque num nome; clique numa capa para ir até a obra.</p>
          <svg viewBox="-520 -400 1040 800" className={s.redeSvg} role="img" aria-label="Quem aparece em cada obra">
            {GRAFO.pessoas.map((p) => p.ws.map((w) => {
              const on = ativoNome === p.nome; const ob = GRAFO.obras[w];
              return <line key={p.nome + w} x1={p.x} y1={p.y} x2={ob.x} y2={ob.y} className={`${s.fio} ${on ? s.fioOn : ativoNome ? s.fioOff : ""}`} />;
            }))}
            {GRAFO.pessoas.map((p) => {
              const dir = Math.cos(p.ang) >= 0, on = ativoNome === p.nome;
              return (
                <g key={p.nome} className={`${s.no} ${on ? s.noOn : ativoNome ? s.noOff : ""}`} onPointerEnter={() => setHov(p.nome)} onPointerLeave={() => setHov(null)} onClick={() => escolhe(p.nome)}>
                  <circle cx={p.x} cy={p.y} r={on ? 6 : 4} />
                  <text x={p.x + (dir ? 10 : -10)} y={p.y + 4} textAnchor={dir ? "start" : "end"}>{p.nome}</text>
                  <circle cx={p.x} cy={p.y} r="16" className={s.alvo} />
                </g>
              );
            })}
            {GRAFO.obras.map((ob) => {
              const o = OBRAS[ob.i], on = ativoObras?.has(ob.i), off = ativoNome && !on;
              const ir = () => { setModo("obras"); const k = { "muita-ostra": 1, sereno: 2, "antes-carnica": 3, mojica: 4, "cor-de-deus": 5 }[o.k]; setTimeout(() => (k ? vaiPara(k) : setGav(ob.i)), 80); if (!k) setTimeout(() => vaiPara(6), 80); };
              return (
                <g key={o.k} className={`${s.obraNo} ${on ? s.obraOn : ""} ${off ? s.obraOff : ""}`} onClick={ir} role="button" aria-label={o.t}>
                  <clipPath id={`cp-${o.k}`}><circle cx={ob.x} cy={ob.y} r="34" /></clipPath>
                  <image href={`/lg/${o.k}.jpg`} x={ob.x - 34} y={ob.y - 34} width="68" height="68" clipPath={`url(#cp-${o.k})`} preserveAspectRatio="xMidYMid slice" />
                  <circle cx={ob.x} cy={ob.y} r="34" className={s.aro} />
                  <text x={ob.x} y={ob.y + 50} textAnchor="middle" className={s.anoTxt}>{o.a}</text>
                </g>
              );
            })}
            <text x="0" y="8" textAnchor="middle" className={s.centro}>Lessa Gustavo</text>
          </svg>
          {sel ? <div className={s.chipRede}><span><b>{sel}</b> · {comSel(sel).length} {comSel(sel).length === 1 ? "obra" : "obras"}</span><button onClick={() => setSel(null)} aria-label="Limpar">✕</button></div> : null}
        </div>
      ) : null}

      {player && (
        <div className={s.player} onClick={fecha}>
          <div className={player.tipo === "sp" ? s.sp : s.yt} onClick={(e) => e.stopPropagation()}>
            <iframe src={player.src} title="Player" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
          </div>
          <p onClick={(e) => e.stopPropagation()}><a href={player.fora} target="_blank" rel="noopener noreferrer">abrir no {player.tipo === "sp" ? "Spotify" : "YouTube"}</a><button onClick={fecha}>fechar</button></p>
        </div>
      )}
    </main>
  );
}
