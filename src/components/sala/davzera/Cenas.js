"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { Cormorant_Garamond, Anton, Yellowtail, DotGothic16, Bungee, Playfair_Display, Space_Grotesk } from "next/font/google";
import { roleta, prato, ervas, anaglifo } from "./cenas3d";
import css from "@/styles/davzeraCenas.module.css";

/*
  Depois da capa do PROFUNDHI: uma cena de tela cheia por lançamento, cada uma com a estética da própria capa.
  A rolagem (Lenis) empurra uma "câmera" por uma trilha; cada cena entra por cima da anterior com um recorte próprio.
*/
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap" });
const neon = Yellowtail({ subsets: ["latin"], weight: "400", display: "swap" });
const pixel = DotGothic16({ subsets: ["latin"], weight: "400", display: "swap" });
const giz = Bungee({ subsets: ["latin"], weight: "400", display: "swap" });
const luxo = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "800"], style: ["normal", "italic"], display: "swap" });
const tech = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });

const PER = 2.2; // alturas de janela por cena
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pct = (v) => `${(v * 100).toFixed(2)}%`;

// o recorte com que cada cena entra por cima da anterior (r vai de 0 a 1)

const sai = (x, y, r) => { const a = r * 114 - 14; return `radial-gradient(circle at ${x}% ${y}%, #000 ${a.toFixed(1)}%, transparent ${(a + 14).toFixed(1)}%)`; };
const MASCARA = { 1: (r) => sai(50, 50, r), 3: (r) => sai(36, 50, r) };
// Vale do Silício (álbum, 4 jan 2019, 7 faixas) e Nauzeainc, Vol. 0 (álbum, 12 abr 2019, 8 faixas): faixas do Spotify, vídeos do canal dele
const VALE_FX = [
  { t: "Ouro 24", c: "l v k s", d: "3:17", yt: "4uk2cdV70PQ" }, { t: "Nagual", d: "1:57", yt: "fPSYyNl4TU0" }, { t: "Alto", d: "2:37", yt: "ZP8u_WKpPBA" },
  { t: "Arcanjos de Sniper", c: "Digs Driller", d: "3:03", yt: "PQClBKX-nSE" }, { t: "Vale do Silício", d: "3:00", yt: "2whNVYZYD9E" },
  { t: "Dry Ice", d: "2:49", yt: "OpKswxwwjas" }, { t: "Tropiqal", c: "Victor Xamã", d: "3:10", yt: "tI5eHpCX3iQ" },
];
const VOL0_FX = [
  { t: "De Role na City" }, { t: "Tipo Dracula", yt: "27IRwt0lclw" }, { t: "Erraro", yt: "1rZKB4ngZSk" }, { t: "Mise En Place", yt: "pbobwq_QQ2g" },
  { t: "Fi Dum Erro", yt: "Gc2TLXYHH1o" }, { t: "Sick", yt: "e-6vPWbHkGU" }, { t: "Sinapses", yt: "GrQHuos8W4I" }, { t: "Overfluxo", yt: "ZoW5JHMJN7s" },
];

const FOTOS = [["merch-letrado", "Camisas Letrado, da Nauzeainc"], ["merch-profundhi", "Camisa branca do PROFUNDHI"], ["merch-bolinhas", "Estampa do PROFUNDHI: as bolinhas da capa"]];

// trechos de 12 s, sem som, cortados dos clipes dele (só os que têm vídeo de verdade)
const CLIPE_MP4 = { "0OE_TGmMc-Q": "/dz/clips/ouro24.mp4", "iVyYvRCHdRg": "/dz/clips/cavalo-joker.mp4", "PRo-ET6KVWc": "/dz/clips/thyssenkrupp.mp4", "27IRwt0lclw": "/dz/clips/tipo-dracula.mp4" };

// quem participa de quais faixas (feats confirmados nos títulos do canal e nos créditos do Spotify); o nome abre a faixa
const PARTICIPACOES = [
  { n: "Rei Lacoste", f: "Copenhagen", yt: "LISWEMmSGQ0" }, { n: "Victor Xamã", f: "Tropiqal", yt: "tI5eHpCX3iQ" }, { n: "Dário Inerente", f: "MaPeople", yt: "7Td_jycFJ2s" },
  { n: "Eloy Polemico", f: "Orixá de Cabeça", yt: "ragOKFS4Iz4" }, { n: "Trice", f: "Cidade da Luz", yt: "iIDAROGAduc" }, { n: "PG 400", f: "DNA", yt: "ArwOOOLCZBo" },
  { n: "Juce Rock", f: "DNA", yt: "ArwOOOLCZBo" }, { n: "Big Alien", f: "Luzes de Fortal", yt: "aAncfPDTseM" }, { n: "Bãovivão", f: "Escort Lagoa", yt: "bbkx_9L39zg" },
  { n: "Trxntin", f: "Lealdade", yt: "-ke_DX-QIAA" }, { n: "Apollo 808", f: "Low Carb", yt: "DXOeMgZy-Kw" }, { n: "Digs Driller", f: "Arcanjos de Sniper", yt: "PQClBKX-nSE" },
  { n: "Sergio Estranho", f: "Fugeela", sp: "01zEvb04f58yQZdvQq4cDj" }, { n: "James Bertish", f: "Pacífico", yt: "2YCI5fUsdOk" }, { n: "Vuto", f: "Malícia", sp: "7tdrG742ZJQDmPBECaZTMD" },
  { n: "Dário Inerente", f: "Dendê", sp: "0fubGaeHs2sQwe7YYaaR9n" },
];

function Cena3D({ fn, st }) {
  const ref = useRef(null);
  useEffect(() => fn(ref.current, st), [fn, st]);
  return <div ref={ref} className={css.c3d} aria-hidden="true" />;
}

const Acoes = ({ abre, sp, yt, rotulo = "Ouvir" }) => (
  <p className={css.acoes}>
    <button onClick={() => abre({ sp })}>{rotulo}</button>
    {yt ? <button className={css.vazio} onClick={() => abre({ yt })}>Vídeo</button> : null}
  </p>
);
const Capa = ({ src, sp, abre, classe }) => (
  <button className={`${css.capaBt} ${classe || ""}`} onClick={() => abre({ sp })} aria-label="Ouvir o disco"><img src={src} alt="" draggable="false" /></button>
);
const Faixas = ({ lista, sp, abre, classe }) => (
  <ol className={`${css.faixas} ${classe || ""}`}>
    {lista.map((x, i) => (
      <li key={x.t}><button onClick={() => abre(x.yt ? { yt: x.yt } : { sp })}><i>{String(i + 1).padStart(2, "0")}</i><b>{x.t}</b>{x.c ? <span>{x.c}</span> : null}{x.yt ? <u>vídeo</u> : null}<em>{x.d}</em></button></li>
    ))}
  </ol>
);

export default function Cenas({ d, abre, parado }) {
  const { SINGLES, ROBO, COZINHA, LOWCARB, ANTES, CLIPES, PARCERIAS, SMART, IG } = d;
  const palco = useRef(null), trilha = useRef(null), cenas = useRef([]), lenis = useRef(null), ptr = useRef({ px: 0, py: 0 });
  const NOMES = ["Pacífico", "Robô de Roleta", "Cozinha Marginal", "Low Carb", "Vale do Silício", "Vol. 0", "Vídeos", "Nauzeainc", "Fim"];
  const N = NOMES.length;
  const sts = useRef(null);
  if (!sts.current) sts.current = NOMES.map(() => ({ u: 0, vis: false, px: 0, py: 0 }));
  sts.current[1].play = () => abre({ sp: ROBO.sp });
  sts.current[3].play = () => abre({ sp: LOWCARB.sp });
  const [monta, setMonta] = useState("0,1");
  const [atual, setAtual] = useState(0);
  const [foto, setFoto] = useState(0);
  useEffect(() => { const t = setInterval(() => setFoto((x) => (x + 1) % FOTOS.length), 2300); return () => clearInterval(t); }, []);
  const [ativo, setAtivo] = useState(CLIPES[0].id);

  useEffect(() => {
    const lx = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 }); lenis.current = lx;
    let raf = 0, ultMonta = "", ultAtual = -1;
    const quadro = (t) => {
      raf = requestAnimationFrame(quadro); lx.raf(t);
      const tr = trilha.current; if (!tr) return;
      const rc = tr.getBoundingClientRect(), vh = innerHeight;
      const p = clamp(-rc.top / (PER * vh), 0, N - 0.001), dentro = rc.top < vh && rc.bottom > 0;
      const rs = Array.from({ length: N }, (_, k) => (k === 0 ? clamp(p / 0.38) : clamp((p - (k - 0.3)) / 0.3)));
      palco.current?.style.setProperty("--ent", rs[0].toFixed(3));
      const mt = [];
      for (let k = 0; k < N; k++) {
        const el = cenas.current[k]; if (!el) continue;
        const u = clamp(p - k), vis = dentro && rs[k] > 0 && !(k < N - 1 && rs[k + 1] >= 1);
        el.style.visibility = vis ? "visible" : "hidden";
        if (vis) {
          const m = MASCARA[k], mk = m && rs[k] < 1 ? m(rs[k]) : "none";
          el.style.opacity = m ? "1" : rs[k].toFixed(3);
          el.style.maskImage = mk; el.style.webkitMaskImage = mk;
          el.style.setProperty("--u", u.toFixed(4)); el.style.setProperty("--r", rs[k].toFixed(3));
        }
        const s = sts.current[k]; s.u = u; s.vis = vis; s.px = ptr.current.px; s.py = ptr.current.py;
        if (Math.abs(k - p) < 1.6) mt.push(k);
      }
      const m = mt.join(","); if (m !== ultMonta) { ultMonta = m; setMonta(m); }
      const a = Math.min(N - 1, Math.floor(p + 0.35)); if (a !== ultAtual) { ultAtual = a; setAtual(a); }
    };
    raf = requestAnimationFrame(quadro);
    return () => { cancelAnimationFrame(raf); lx.destroy(); lenis.current = null; };
  }, [N]);

  // overflow-x: hidden no body cria um contêiner de rolagem e quebra o sticky; clip não
  useEffect(() => {
    const b = document.body.style.overflowX, h = document.documentElement.style.overflowX;
    document.body.style.overflowX = "clip"; document.documentElement.style.overflowX = "clip";
    return () => { document.body.style.overflowX = b; document.documentElement.style.overflowX = h; };
  }, []);

  useEffect(() => { if (parado) lenis.current?.stop(); else lenis.current?.start(); }, [parado]);

  const vai = (k) => { const y = trilha.current.getBoundingClientRect().top + scrollY + k * PER * innerHeight + 2; lenis.current?.scrollTo(y, { duration: 1.8 }); };
  const mexe = (e) => { ptr.current = { px: (e.clientX / innerWidth) * 2 - 1, py: (e.clientY / innerHeight) * 2 - 1 }; };
  const reg = (k) => (el) => { cenas.current[k] = el; };
  const tem = (k) => monta.split(",").includes(String(k));
  const [pac, den, mal] = SINGLES, [vale, vol0] = ANTES;
  sts.current[5].play = () => abre({ sp: vol0.sp });
  const meta = (s) => <p className={css.meta}><b>{s.ano}</b>{s.c}</p>;

  return (
    <div ref={trilha} className={`${css.trilha} ${serif.className} ${css.raizCenas}`} style={{ height: `${N * PER * 100}svh`, marginTop: "-100svh" }} onPointerMove={mexe}>
      <div ref={palco} className={css.palco}>

        {/* Pacífico: a descida para a copa das árvores; a capa nítida no tamanho dela, o resto é a mesma luz desfocada */}
        <section ref={reg(0)} className={`${css.cena} ${css.pac}`} aria-label="Pacífico">
          <div className={css.pacFundo} style={{ backgroundImage: "url(/dz/pacifico.jpg)" }} />
          <div className={css.pacRaios} />
          <button className={`${css.pacFoto} ${css.capaBt}`} onClick={() => abre({ sp: pac.sp })} aria-label="Ouvir Pacífico"><img src="/dz/pacifico.jpg" alt="Capa de Pacífico: a copa de uma árvore contra o céu e o sol" draggable="false" /></button>
          <div className={css.pacGrao} />
          <div className={`${css.pacTxt} ${css.sai}`}>
            <p className={css.rot}>Single · {pac.ano}</p>
            <h2 className={serif.className}>Pacífico</h2>
            {meta(pac)}
            <Acoes abre={abre} sp={pac.sp} yt={pac.yt} />
          </div>
        </section>

        {/* Robô de Roleta 50-50: a roleta que gira com a rolagem */}
        <section ref={reg(1)} className={`${css.cena} ${css.rob} ${pixel.className}`} aria-label="Robô de Roleta 50-50">
          <div className={css.robFundo} style={{ backgroundImage: "url(/dz/robo.jpg)" }} />
          {tem(1) ? <Cena3D fn={roleta} st={sts.current[1]} /> : null}
          <p className={css.robJp} aria-hidden="true">フィフティフィフティ ルーレットロボット</p>
          <div className={css.robTxt}>
            <p className={css.rot}>EP · 14 jul 2023 · Davzera × Rei Lacoste</p>
            <h2>Robô de<br />Roleta<br /><b>50-50</b></h2>
            <Faixas lista={ROBO.faixas} sp={ROBO.sp} abre={abre} classe={css.robLista} />
            <Acoes abre={abre} sp={ROBO.sp} rotulo="Ouvir o EP" />
          </div>
        </section>

        {/* Cozinha Marginal: o mato */}
        <section ref={reg(2)} className={`${css.cena} ${css.coz}`} aria-label="Cozinha Marginal">
          <div className={css.cozFundo} style={{ backgroundImage: "url(/dz/cozinha.jpg)" }} />
          {tem(2) ? <Cena3D fn={ervas} st={sts.current[2]} /> : null}
          <Capa src="/dz/cozinha.jpg" sp={COZINHA.sp} abre={abre} classe={css.cozCapa} />
          <div className={css.cozTxt}>
            <p className={css.rot}>Álbum · 1 abr 2022 · 8 faixas</p>
            <h2 className={giz.className}>Cozinha<br />Marginal</h2>
            <Faixas lista={COZINHA.faixas} sp={COZINHA.sp} abre={abre} classe={css.cozLista} />
            <Acoes abre={abre} sp={COZINHA.sp} rotulo="Ouvir o álbum" />
          </div>
        </section>

        {/* Low Carb: o prato dourado */}
        <section ref={reg(3)} className={`${css.cena} ${css.low} ${luxo.className}`} aria-label="Low Carb">
          {tem(3) ? <Cena3D fn={prato} st={sts.current[3]} /> : null}
          <div className={css.lowTxt}>
            <p className={css.rot}>Álbum · 25 nov 2020 · 7 faixas</p>
            <h2>Low<br /><em>Carb</em></h2>
            <Faixas lista={LOWCARB.faixas} sp={LOWCARB.sp} abre={abre} classe={css.lowLista} />
            <Acoes abre={abre} sp={LOWCARB.sp} rotulo="Ouvir o álbum" />
          </div>
        </section>

        {/* Vale do Silício: a capa, nítida, sobre ela mesma desfocada */}
        <section ref={reg(4)} className={`${css.cena} ${css.val} ${tech.className}`} aria-label="Vale do Silício">
          <div className={css.valFundo} style={{ backgroundImage: "url(/dz/vale.jpg)" }} />
          <button className={`${css.valFoto} ${css.capaBt}`} onClick={() => abre({ sp: vale.sp })} aria-label="Ouvir Vale do Silício">
            <img src="/dz/vale.jpg" alt="Capa de Vale do Silício: flores rosas e moedas sobre um papel rasgado" draggable="false" />
          </button>
          <div className={css.pacGrao} />
          <div className={css.valTxt}>
            <p className={css.rot}>Álbum · 4 jan 2019 · 7 faixas</p>
            <h2>Vale do<br />Silício</h2>
            <Faixas lista={VALE_FX} sp={vale.sp} abre={abre} classe={css.valLista} />
            <Acoes abre={abre} sp={vale.sp} rotulo="Ouvir o álbum" />
          </div>
        </section>

        {/* Nauzeainc, Vol. 0: só o calçamento, em tela cheia, cinza que ganha o azul e o vermelho na rolagem; clicar abre o disco */}
        <section ref={reg(5)} className={`${css.cena} ${css.vol}`} aria-label="Nauzeainc, Vol. 0">
          <div className={css.volFull} role="button" tabIndex={0} aria-label="Ouvir Nauzeainc, Vol. 0" onClick={() => abre({ sp: vol0.sp })} onKeyDown={(e) => { if (e.key === "Enter") abre({ sp: vol0.sp }); }} />
          {tem(5) ? <Cena3D fn={anaglifo} st={sts.current[5]} /> : null}
          <div className={css.pacGrao} />
          <ol className={css.volFaixas} aria-label="Faixas de Nauzeainc, Vol. 0">{VOL0_FX.map((x, i) => <li key={x.t}><button onClick={() => abre(x.yt ? { yt: x.yt } : { sp: vol0.sp })}><i>{String(i + 1).padStart(2, "0")}</i>{x.t}</button></li>)}</ol>
        </section>

        {/* vídeos: ao passar o mouse, um trecho do vídeo rola ao fundo, sem som */}
        <section ref={reg(6)} className={`${css.cena} ${css.vid}`} aria-label="Vídeos">
          {CLIPES.map((v) => <div key={v.id} className={`${css.vidFundo} ${ativo === v.id && !CLIPE_MP4[v.id] ? css.vidOn : ""}`} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/hqdefault.jpg)` }} />)}
          {tem(6) && CLIPE_MP4[ativo] ? <video key={ativo} className={css.vidPrev} src={CLIPE_MP4[ativo]} autoPlay muted loop playsInline preload="auto" aria-hidden="true" /> : null}
          <div className={css.vidTxt}>
            <div>
              <p className={css.rot}>No canal dele</p>
              <ul>{CLIPES.map((v) => <li key={v.id} className={ativo === v.id ? css.vidOn : ""}><button onPointerEnter={() => setAtivo(v.id)} onFocus={() => setAtivo(v.id)} onClick={() => abre({ yt: v.id })}><b>{v.t}</b></button></li>)}</ul>
              <p className={css.vidCanal}><a href="https://www.youtube.com/@davinadier759" target="_blank" rel="noopener noreferrer">Ver o canal inteiro no YouTube ↗</a></p>
            </div>
          </div>
        </section>

        {/* Nauzeainc: a marca e as camisas */}
        <section ref={reg(7)} className={`${css.cena} ${css.nau}`} aria-label="Nauzeainc">
          <div className={css.nauLogo} role="img" aria-label="NAUZEA" />
          <button className={css.nauQuadro} onClick={() => setFoto((x) => (x + 1) % FOTOS.length)} aria-label="Camisas da Nauzeainc: trocar a foto">
            {FOTOS.map(([nome, alt], i) => <img key={nome} className={i === foto ? css.nauOn : ""} src={`/dz/${nome}.jpg`} alt={alt} draggable="false" loading="lazy" />)}
          </button>
          <div className={css.nauTxt}>
            <p className={css.rot}>Roupas · Nauzeainc</p>
            <h3>{foto === 0 ? "Letrado" : "PROFUNDHI"}</h3>
            {foto === 0
              ? <p>Camisa pintada à mão pela BRABAA, da @freak.experiment, em homenagem aos pixadores e grafiteiros da Bahia e do Brasil. Algodão penteado 30.1. R$ 100 mais envio, e eles mandam para o mundo todo.</p>
              : <p>A camisa branca com as bolinhas da capa do PROFUNDHI.</p>}
            <p className={css.acoes}><a href={IG} target="_blank" rel="noopener noreferrer">Pedir por DM ↗</a></p>
          </div>
        </section>

        {/* fim: quem assina as faixas, e onde ouvir e seguir */}
        <section ref={reg(8)} className={`${css.cena} ${css.fim}`} aria-label="Ouvir e seguir">
          <i className={css.bolaA} /><i className={css.bolaB} /><i className={css.bolaC} />
          <div className={css.fimCreditos}>
            <p className={css.rot}>Participações</p>
            <div className={css.corre}><div>{[0, 1].map((k) => <span key={k}>{PARTICIPACOES.map((p) => <button key={p.n + p.f + k} onClick={() => abre(p.yt ? { yt: p.yt } : { sp: p.sp })}><b>{p.n}</b><small>{p.f}</small></button>)}</span>)}</div></div>
            <div className={`${css.corre} ${css.correB}`}><div>{[0, 1].map((k) => <span key={k}>{[...PARTICIPACOES].reverse().map((p) => <button key={p.n + p.f + k} onClick={() => abre(p.yt ? { yt: p.yt } : { sp: p.sp })}><b>{p.n}</b><small>{p.f}</small></button>)}</span>)}</div></div>
          </div>
          <nav className={css.fimLinks} aria-label="Ouvir e seguir">
            <a href="https://open.spotify.com/artist/42M0YRSCEu5ppWbOioH0GH" target="_blank" rel="noopener noreferrer"><b>Spotify</b><span>todos os discos</span></a>
            <a href="https://www.youtube.com/@davinadier759" target="_blank" rel="noopener noreferrer"><b>YouTube</b><span>@davinadier759 · os clipes</span></a>
            <a href={IG} target="_blank" rel="noopener noreferrer"><b>Instagram</b><span>@davinadier</span></a>
            <a href={SMART} target="_blank" rel="noopener noreferrer"><b>Todas as plataformas</b><span>link do PROFUNDHI</span></a>
          </nav>
          <button className={css.fimTopo} onClick={() => lenis.current?.scrollTo(0, { duration: 1.8 })}><span aria-hidden="true">↑</span> Voltar ao topo</button>
        </section>

        <nav className={css.indice} aria-label="Lançamentos">
          {NOMES.map((n, k) => <button key={n} className={atual === k ? css.indiceOn : ""} onClick={() => vai(k)} aria-label={n}><span>{n}</span></button>)}
        </nav>
      </div>
    </div>
  );
}
