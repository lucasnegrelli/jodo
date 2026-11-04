"use client";
// Makalister · cru. Uma tela só, sem abas: a filmagem dele ocupa tudo e a navegação é UMA lista em ordem de data que mistura vídeos e discos.
// O primeiro item é a abertura (montagem de cortes secos dos clipes + texto miúdo sobre ele). Disco = capa grande com as faixas; vídeo = o clipe.
// Sem efeito de mouse. O único objeto gráfico é a assinatura dele. O som liga no primeiro clique (ou no ícone do canto).
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LANCAMENTOS } from "@/data/makalisterLancamentos";
import { OBRA } from "@/data/makalisterObra";
import CapaViva from "@/components/makalister/CapaViva";
import LINKS from "@/data/makalisterLinks.json";
import s from "@/styles/makalisterCru.module.css";

const ui = Inter_Tight({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--mk-ui" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mk-mono" });

// trechos de 12 s tirados dos próprios clipes (canal Almanak e outros)
const VIDEOS = [
  { k: "endrick", ano: "2026", data: "21.10.2026", t: "ENDRICK (Remix)", yt: "jqoKn-DpeV4", views: "8 mil", nota: "Remix de ENDRICK, do Froid." },
  { k: "pipa", ano: "2026", data: "29.07.2026", t: "Linha de Pipa", yt: "ONLBrE1DWaQ", views: "9 mil", nota: "Gravado no show de lançamento do DSQVDVQE, na Mvuka, em Florianópolis. Com Luiz Barata, Nitcho e Mentosz." },
  { k: "viva", ano: "2025", data: "20.02.2025", t: "VIVA", yt: "PSFPoGXHjwA", views: "35 mil", nota: "Transamazônica, com Victor Xamã, Maria e Lum. Canal Ordem Natural." },
  { k: "filhos", ano: "2023", data: "13.01.2023", t: "Filhos", yt: "dKW9itSgaHE", views: "30 mil", nota: "Single de janeiro de 2023." },
  { k: "gatunos", ano: "2022", data: "23.09.2022", t: "Gatunos", yt: "pbDV4NOQa3A", views: "29 mil", nota: "Com Beli Remour." },
  { k: "lagrimas", ano: "2022", data: "11.11.2022", t: "Mais Que Lágrimas e Quartos Escuros", yt: "onQoVHIGyzo", views: "65 mil", nota: "Dois singles num clipe só." },
  { k: "cruz", ano: "2018", data: "01.02.2018", t: "Quando Observo a Cruz de Folga", yt: "CTJQW99V6tU", views: "30 mil", nota: "Direção: JODO." },
  { k: "amorvirtual", ano: "2018", data: "09.01.2018", t: "Da Era do Amor Virtual", yt: "2BdVAm7qvk0", views: "436 mil", nota: "Prod. Arit." },
  { k: "instalacoes", ano: "2017", data: "2017", t: "Instalações Noturnas, Assuntos de Rua", yt: "y5G2MQcldEo", views: "88 mil", nota: "EP visual, com Lessa Gustavo e l v k s.", iso: "2017-11-10" },
  { k: "waves", ano: "2017", data: "08.10.2017", t: "Breaking the Waves", yt: "TEZQQn8MSJo", views: "187 mil", nota: "Videoclipe oficial, dirigido por Lucas Negrelli." },
  { k: "posse", ano: "2017", data: "27.09.2017", t: "Ao vivo no Posse Cutz, Belo Horizonte", yt: "VtHcmaF11r8", views: "6 mil", nota: "Com Lessa Gustavo." },
];
const ISO = (v) => v.iso || v.data.split(".").reverse().join("-");
const ALIAS = { 915434391: "DSQVDVQE" }; // como ele mesmo chama o disco de 2026 (sigla do título longo, que está na capa)
// participações em disco de outro não entram no fluxo principal (ficam para a faixa de créditos)
const PAPEL = Object.fromEntries(OBRA.map((o) => [o.id, o]));
const FORA = new Set(OBRA.filter((o) => o.papel === "participacao").map((o) => o.id));
const DISCOS = LANCAMENTOS.filter((l) => l.faixas.length > 0 && !FORA.has(l.id));

// uma lista só, do mais novo ao mais velho, com vídeos e discos misturados
const ITENS = [
  ...[
    ...DISCOS.map((l) => ({ tipo: "disco", k: `d${l.id}`, ano: l.d.slice(0, 4), iso: l.d, t: ALIAS[l.id] || l.t, l })),
    ...VIDEOS.map((v) => ({ tipo: "video", k: v.k, ano: v.ano, iso: ISO(v), t: v.t, v })),
  ].sort((a, b) => b.iso.localeCompare(a.iso)),
  { tipo: "intro", k: "intro", ano: "", t: "MAKALISTER" }, // apresentação por último
];

const SEL = { spotify: "https://open.spotify.com/intl-pt/artist/1RoerHIsbQo1h0V8KpznKV", apple: "https://music.apple.com/br/artist/makalister/1135060296", deezer: "https://www.deezer.com/artist/10709967", soundcloud: "https://soundcloud.com/saintmakalister", youtube: "https://www.youtube.com/@AlmanakOficial" };
const COR = { "Spotify": "#1db954", "Apple Music": "#fa243c", "Deezer": "#a238ff", "SoundCloud": "#ff5500", "YouTube": "#ff0000" };
const PLAT = [["Spotify", SEL.spotify], ["Apple Music", SEL.apple], ["Deezer", SEL.deezer], ["SoundCloud", SEL.soundcloud], ["YouTube", SEL.youtube]];

// logos discretos (um traço só, na cor do texto); o desenho interno usa a cor do fundo
function Logo({ n }) {
  const d = "#0a0a0a";
  if (n === "Spotify") return (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11.5" fill="currentColor" /><path d="M5.2 8.7c4.3-1.3 9.5-1 13.4 1.3" fill="none" stroke={d} strokeWidth="1.9" strokeLinecap="round" /><path d="M5.9 12.2c3.6-1 7.7-.7 10.8 1.1" fill="none" stroke={d} strokeWidth="1.6" strokeLinecap="round" /><path d="M6.7 15.4c2.9-.7 5.9-.5 8.4.9" fill="none" stroke={d} strokeWidth="1.3" strokeLinecap="round" /></svg>);
  if (n === "Apple Music") return (<svg viewBox="0 0 24 24" aria-hidden="true"><rect x=".5" y=".5" width="23" height="23" rx="5.5" fill="currentColor" /><path d="M16.2 5.6v9.5a2.3 2.3 0 1 1-1.3-2.1V8.9l-5.1 1.2v6.3a2.3 2.3 0 1 1-1.3-2.1V7.8z" fill={d} /></svg>);
  if (n === "Deezer") return (<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="1" y="17" width="3.6" height="5" /><rect x="5.5" y="13" width="3.6" height="9" /><rect x="10" y="9" width="3.6" height="13" /><rect x="14.5" y="5" width="3.6" height="17" /><rect x="19" y="1.5" width="3.6" height="20.5" /></svg>);
  if (n === "SoundCloud") return (<svg viewBox="0 0 24 24" aria-hidden="true"><rect x=".5" y=".5" width="23" height="23" rx="5.5" fill="currentColor" /><path d="M4 15.5v-3M6.2 16v-5M8.4 16v-6.2M10.6 16V9.2M12 16h6.2a2.4 2.4 0 0 0 .3-4.8 4.1 4.1 0 0 0-6.5-1.5" fill="none" stroke={d} strokeWidth="1.5" strokeLinecap="round" /></svg>);
  return (<svg viewBox="0 0 24 24" aria-hidden="true"><rect x=".5" y="4" width="23" height="16" rx="4.5" fill="currentColor" /><path d="M9.7 8.6v6.8l5.9-3.4z" fill={d} /></svg>);
}
function Alto({ ligado }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.6L12 18.5v-13L7.6 9.5z" fill="currentColor" stroke="none" />
      {ligado ? <><path d="M15.2 9.2a4 4 0 0 1 0 5.6" /><path d="M17.6 6.8a7.4 7.4 0 0 1 0 10.4" /></> : <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />}
    </svg>
  );
}

export default function MakalisterCru() {
  const raiz = useRef(null), vids = useRef({}), ass = useRef(null), anterior = useRef(""), trava = useRef(false), clicou = useRef(false);
  const [idx, setIdx] = useState(0), [som, setSom] = useState(false), [introK, setIntroK] = useState("pipa");
  const it = ITENS[idx];
  const ativoK = it.tipo === "video" ? it.k : null; // a abertura não usa clipe: evita repetir a cena do primeiro vídeo da lista

  const vai = useCallback((d) => { if (trava.current) return; trava.current = true; setIdx((i) => Math.max(0, Math.min(ITENS.length - 1, i + d))); setTimeout(() => { trava.current = false; }, 520); }, []);

  // a abertura é uma montagem: cortes secos de 1,5 s pelos clipes, sem som
  useEffect(() => {
    if (it.tipo !== "intro") return;
    let n = VIDEOS.findIndex((x) => x.k === "pipa");
    const id = setInterval(() => { n = (n + 1) % VIDEOS.length; setIntroK(VIDEOS[n].k); }, 1500);
    return () => clearInterval(id);
  }, [it.tipo]);

  // só um clipe toca por vez; o som só vale nos vídeos (a abertura é muda)
  useEffect(() => {
    Object.entries(vids.current).forEach(([k, el]) => {
      if (!el) return;
      if (k === ativoK) { el.muted = !(som && it.tipo === "video"); if (anterior.current !== k) el.currentTime = 0; el.play().catch(() => {}); } else el.pause();
    });
    anterior.current = ativoK || "";
  }, [ativoK, som, it.tipo]);

  // linha fina de progresso do clipe
  useEffect(() => {
    if (it.tipo !== "video") return; let raf = 0;
    const f = () => { raf = requestAnimationFrame(f); const el = vids.current[it.k]; if (el && el.duration && raiz.current) raiz.current.style.setProperty("--p", (el.currentTime / el.duration).toFixed(4)); };
    f(); return () => cancelAnimationFrame(raf);
  }, [it]);

  // roda do mouse, dedo e teclas trocam de item; o primeiro clique liga o som
  useEffect(() => {
    gsap.registerPlugin(Observer);
    const ob = Observer.create({ type: "wheel,touch", wheelSpeed: -1, tolerance: 24, preventDefault: true, onUp: () => vai(1), onDown: () => vai(-1) });
    const k = (e) => { if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") vai(1); else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") vai(-1); else if (e.key === "m" || e.key === "M") { clicou.current = true; setSom((x) => !x); } };
    const c = (e) => { if (clicou.current || e.target.closest("a,button")) return; clicou.current = true; setSom(true); };
    window.addEventListener("keydown", k); window.addEventListener("pointerdown", c);
    return () => { ob.kill(); window.removeEventListener("keydown", k); window.removeEventListener("pointerdown", c); };
  }, [vai]);

  // assinatura: escreve no meio e vai para o canto (só na primeira visita da sessão)
  useEffect(() => {
    const el = ass.current; if (!el) return;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches || sessionStorage.getItem("mk-intro") === "1";
    sessionStorage.setItem("mk-intro", "1");
    if (reduz) { gsap.set(el, { clipPath: "inset(0 0 0 0)", left: window.innerWidth - 28, right: "auto", top: 18, xPercent: -100, yPercent: 0, width: 150 }); return; }
    gsap.set(el, { clipPath: "inset(0 100% 0 0)", left: "50%", top: "50%", right: "auto", xPercent: -50, yPercent: -50, width: Math.min(window.innerWidth * 0.6, 760) });
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to(el, { clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: "power2.inOut" })
      .to(el, { left: window.innerWidth - 28, top: 18, xPercent: -100, yPercent: 0, width: 150, duration: 1.1, ease: "power3.inOut" }, "+=0.5");
    return () => tl.kill();
  }, []);

  const d = it.tipo === "disco" ? it.l : null;
  // ícones do canto levam ao trabalho que está na tela (disco: Spotify/Apple/Deezer; clipe: YouTube); na abertura, ao artista
  const lk = d ? LINKS[d.id] : null;
  const plats = d
    ? [["Spotify", lk?.spotify], ["Apple Music", lk?.apple], ["Deezer", lk?.deezer || `https://www.deezer.com/album/${d.id}`], ["YouTube", lk?.youtube]].filter(([, u]) => u)
    : it.tipo === "video" ? [["YouTube", `https://www.youtube.com/watch?v=${it.v.yt}`]] : PLAT;
  return (
    <main ref={raiz} className={`${s.raiz} ${ui.variable} ${mono.variable} ${it.tipo === "intro" ? s.abertura : ""}`} style={{ "--i": idx }}>
      <VoltarJodo />
      <MarcaTopo nome="Makalister" cor="#ece8de" plano escala={1.05} />
      <img ref={ass} className={s.assinatura} src="/mk/assinatura.png" alt="Makalister" width="900" height="168" />

      <div className={s.palco}>
        {VIDEOS.map((x) => (
          <video key={x.k} ref={(el) => { vids.current[x.k] = el; }} className={`${s.video} ${ativoK === x.k ? s.on : ""}`} src={`/mk/clips/${x.k}.mp4`} muted loop playsInline preload={it.tipo === "intro" || ativoK === x.k ? "auto" : "metadata"} aria-hidden={ativoK !== x.k} />
        ))}

        {d ? (
          <div className={s.disco} key={it.k}>
            <CapaViva key={"f" + d.img} className={s.discoFundo} src={d.img} alt="" />
            <img className={s.discoCapa} src={d.img} alt={`Capa de ${d.t}`} />
            <ol className={s.faixas}>{d.faixas.map((f, i) => <li key={`${f}-${i}`}>{f}</li>)}</ol>
          </div>
        ) : null}

        <ul className={s.lista} aria-label="Vídeos e discos">
          {ITENS.map((x, i) => {
            const dist = Math.abs(i - idx);
            return (
              <li key={x.k} data-d={dist} style={{ opacity: i === idx ? 1 : Math.max(0.08, 0.5 - dist * 0.1) }}>
                <button type="button" onClick={() => setIdx(i)} aria-current={i === idx ? "true" : undefined}>{x.ano ? <i>{x.ano}</i> : null}{x.t}{x.tipo === "disco" ? <em>disco</em> : null}</button>
              </li>
            );
          })}
        </ul>

        {it.tipo === "intro" ? <img className={s.rabiscoIntro} src="/mk/mao/rabisco.png" alt="DSQV DVQE" width="1170" height="117" /> : null}

        {it.tipo === "intro" ? (
          <div className={s.sobre}>
            <p>Rapper e produtor de São José, na Grande Florianópolis. Rima desde 2008 e faz os próprios beats.</p>
            <p>Desde 2013, {DISCOS.length} discos e EPs e dezenas de singles, pelo selo Almanak. Divide o terreno, na Serraria, com o Beli Remour: mais de 50 músicas juntos.</p>
            <p>Shows: <a href="mailto:contatoalmanak@gmail.com">contatoalmanak@gmail.com</a></p>
            <p className={s.dica}>role, ou use as setas · clique para ligar o som</p>
          </div>
        ) : null}

        {it.tipo === "video" ? (
          <>
            <div className={s.info}><p><b>{it.v.t}</b></p><p>{it.v.data} · {it.v.views} views</p><p>{it.v.nota}</p></div>
            <div className={s.progresso} aria-hidden="true"><i /></div>
          </>
        ) : null}

        {d ? (
          <>
            <div className={s.info}><p><b>{d.t}</b></p><p>{d.d.split("-").reverse().join(".")} · {d.tipo} · {d.faixas.length} faixas</p>{PAPEL[d.id]?.com?.length ? <p>com {PAPEL[d.id].com.join(" · ")}</p> : <p>solo</p>}{d.label ? <p>{d.label}</p> : null}{d.nota ? <p>{d.nota}</p> : null}</div>
          </>
        ) : null}

        <p className={s.conta}><span>↑ ↓ trocar · M som</span></p>
      </div>

      <nav className={s.canto} aria-label="Som e plataformas">
        <button type="button" className={s.alto} onClick={() => { clicou.current = true; setSom((x) => !x); }} aria-pressed={som} aria-label={som ? "Desligar o som" : "Ligar o som"} title={som ? "Desligar o som" : "Ligar o som"}><Alto ligado={som} /></button>
        <i className={s.sep} aria-hidden="true" />
        {plats.map(([n, u]) => <a key={n} href={u} style={{ "--cor": COR[n] }} target="_blank" rel="noopener noreferrer" title={`Ouvir no ${n}`} aria-label={`Ouvir no ${n}`}><Logo n={n} /></a>)}
      </nav>
    </main>
  );
}
