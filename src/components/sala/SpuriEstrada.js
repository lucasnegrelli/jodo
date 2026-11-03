"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import VoltarJodo from "@/components/comum/VoltarJodo";
import MarcaTopo from "@/components/comum/MarcaTopo";
import styles from "@/styles/spuriEstrada.module.css";
import {
  LINKS, NUMEROS, QUEM, PLANO, PALESTRAS, PAIS, POPULAR, PISTA, STRADS, RUA, VIDEOS, CINEMA_FORA, COLISEU, MIDIA, ORIGEM, GRAMMY,
} from "@/data/romuloSpuri";
import { VIMEO, LINKS as LINKS_ISA } from "@/data/isaKatupyryb";

/*
 * Rômulo Spuri · "O interior não precisa ser uma sala de espera".
 * Linguagem de cartaz editorial, tirada do próprio portfólio dele: papel #e6e3e1, preto, verde #3a855d, letra condensada pesada (Anton)
 * com Montserrat, e a pincelada seca como borda entre as sessões. Grade rígida (nada solto por cima do texto).
 * Movimentos: fitas de letreiro, números que contam, manifesto que se revela com a rolagem, lista que troca a foto, paredes de fotos
 * que passam em cortes secos (os "GIFs"), a estrada horizontal e o palco de vídeos.
 */

const sp = (p) => `/sp/${p}.webp`;
const F = (n) => sp(`fotos/${n}`);
const P = (n) => sp(`palestras/${n}`);

function useVista(repete = false, limiar = 0.2) {
  const ref = useRef(null);
  const [vista, setVista] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setVista(true); if (!repete) io.disconnect(); }
        else if (repete) setVista(false);
      },
      { threshold: limiar }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [repete, limiar]);
  return [ref, vista];
}

function R({ as: T = "div", className = "", atraso = 0, children, ...resto }) {
  const [ref, v] = useVista();
  return (
    <T ref={ref} className={`${styles.rev} ${v ? styles.vista : ""} ${className}`} style={{ "--d": `${atraso}ms` }} {...resto}>
      {children}
    </T>
  );
}

/* grava --p (0 a 1) na sessão fixada, conforme a rolagem dentro dela */
function usePino() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = Math.max(1, r.height - innerHeight);
      el.style.setProperty("--p", Math.min(1, Math.max(0, -r.top / total)).toFixed(4));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return ref;
}

/* faixa horizontal fixa: a rolagem vertical empurra o trilho para o lado (no celular vira rolagem lateral normal) */
function useFaixa() {
  const ref = usePino();
  const trilho = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const tr = trilho.current;
    if (!el || !tr) return;
    const medir = () => {
      if (innerWidth <= 860) { el.style.height = ""; el.style.setProperty("--dist", "0"); return; }
      const dist = Math.max(0, tr.scrollWidth - innerWidth);
      el.style.setProperty("--dist", String(dist));
      el.style.height = `${dist + innerHeight}px`;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(tr);
    addEventListener("resize", medir);
    return () => { ro.disconnect(); removeEventListener("resize", medir); };
  }, [ref]);
  return [ref, trilho];
}

/* carrossel de rolagem lateral (celular): passa sozinho, arrasta com o dedo ou o mouse e tem setas */
function useCarrossel(ref, { intervalo = 4800 } = {}) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const iRef = useRef(0);
  const pausa = useRef(0);
  const irPara = useRef(() => {});
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ativo = () => innerWidth <= 860;
    const filhos = () => [...el.children].filter((c) => c.offsetWidth > 0);
    const proximo = () => {
      const f = filhos();
      const mid = el.scrollLeft + el.clientWidth / 2;
      let b = 0, d = 1e9;
      f.forEach((c, k) => { const dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (dd < d) { d = dd; b = k; } });
      return [f, b];
    };
    const ir = (k, suave = true) => {
      const f = filhos();
      if (!f.length) return;
      const c = f[(k + f.length) % f.length];
      el.scrollTo({ left: Math.max(0, c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2), behavior: suave ? "smooth" : "auto" });
    };
    irPara.current = ir;
    const medir = () => { const [f, b] = proximo(); iRef.current = b; setN(f.length); setI(b); };
    medir();
    let down = false, x0 = 0, s0 = 0;
    const pd = (e) => { if (e.pointerType !== "mouse" || !ativo()) return; down = true; x0 = e.clientX; s0 = el.scrollLeft; el.style.scrollSnapType = "none"; el.style.cursor = "grabbing"; pausa.current = Date.now() + 9000; };
    const pm = (e) => { if (down) el.scrollLeft = s0 - (e.clientX - x0); };
    const pu = () => { if (!down) return; down = false; el.style.scrollSnapType = ""; el.style.cursor = ""; ir(proximo()[1]); };
    const toque = () => { pausa.current = Date.now() + 9000; };
    let vista = false;
    const io = new IntersectionObserver(([e]) => { vista = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(el);
    const t = setInterval(() => { if (ativo() && vista && Date.now() > pausa.current) ir(iRef.current + 1); }, intervalo);
    el.addEventListener("scroll", medir, { passive: true });
    el.addEventListener("pointerdown", pd);
    addEventListener("pointermove", pm);
    addEventListener("pointerup", pu);
    el.addEventListener("touchstart", toque, { passive: true });
    el.addEventListener("wheel", toque, { passive: true });
    return () => {
      clearInterval(t); io.disconnect();
      el.removeEventListener("scroll", medir); el.removeEventListener("pointerdown", pd);
      removeEventListener("pointermove", pm); removeEventListener("pointerup", pu);
      el.removeEventListener("touchstart", toque); el.removeEventListener("wheel", toque);
    };
  }, [ref, intervalo]);
  const prev = () => { pausa.current = Date.now() + 9000; irPara.current(iRef.current - 1); };
  const next = () => { pausa.current = Date.now() + 9000; irPara.current(iRef.current + 1); };
  return { i, n, prev, next };
}

function Setas({ car, className = "" }) {
  return (
    <div className={`${styles.setas} ${className}`}>
      <button type="button" onClick={car.prev} aria-label="anterior">←</button>
      <span>{String(car.i + 1).padStart(2, "0")}/{String(car.n).padStart(2, "0")}</span>
      <button type="button" onClick={car.next} aria-label="próximo">→</button>
    </div>
  );
}

/* número que conta até o valor quando entra na tela */
function Contador({ valor, className = "" }) {
  const [ref, vista] = useVista(false, 0.4);
  const alvo = parseInt(String(valor).replace(/\D/g, ""), 10) || 0;
  const mais = String(valor).includes("+");
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!vista) return;
    const t0 = performance.now();
    let raf = 0;
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / 1300);
      setN(Math.round(alvo * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [vista, alvo]);
  return <b ref={ref} className={className}>{n}{mais ? "+" : ""}</b>;
}

/* fita de letreiro que corre */
function Fita({ itens, tom = "preto", className = "" }) {
  const lista = [...itens, ...itens, ...itens, ...itens];
  return (
    <div className={`${styles.fita} ${styles[`fita_${tom}`]} ${className}`} aria-hidden="true">
      <div className={styles.fitaTrilho}>
        {lista.map((t, k) => (<span key={k}>{t}<i>✦</i></span>))}
      </div>
    </div>
  );
}

/* quadro de fotos que passam; a troca é um fundido (rápido nas paredes de TV) e a foto seguinte já está carregada */
function Quadro({ fotos, intervalo = 3200, atraso = 0, className = "", legenda, contador = true, fade = 1.1 }) {
  const [ref, vista] = useVista(true, 0.15);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!vista || fotos.length < 2) return;
    let iv = 0;
    const t = setTimeout(() => { iv = setInterval(() => setI((k) => (k + 1) % fotos.length), intervalo); }, atraso);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [vista, fotos.length, intervalo, atraso]);
  return (
    <div ref={ref} className={`${styles.quadro} ${className}`} style={{ "--fade": `${fade}s` }}>
      {fotos.map((f, k) => (<img key={f + k} src={f} alt="" className={k === i ? styles.quadroOn : ""} loading="eager" decoding="async" />))}
      {contador && fotos.length > 1 && <span className={styles.quadroCont}>{String(i + 1).padStart(2, "0")}/{String(fotos.length).padStart(2, "0")}</span>}
      {legenda && <span className={styles.quadroLeg}>{legenda}</span>}
    </div>
  );
}

/* palco de vídeos */
function Palco({ lista }) {
  const [i, setI] = useState(0);
  const [ref, vista] = useVista(true, 0.15);
  const espera = useRef(0);
  const c = lista[i];
  const escolher = (k, rapido) => {
    clearTimeout(espera.current);
    if (rapido) setI(k);
    else espera.current = setTimeout(() => setI(k), 170);
  };
  useEffect(() => () => clearTimeout(espera.current), []);
  return (
    <div ref={ref} className={styles.palco}>
      <ol className={styles.palcoLista}>
        {lista.map((x, k) => (
          <li key={x.id}>
            <button
              type="button"
              className={k === i ? styles.on : ""}
              onMouseEnter={() => escolher(k, false)}
              onMouseLeave={() => clearTimeout(espera.current)}
              onFocus={() => escolher(k, true)}
              onClick={() => escolher(k, true)}
            >
              <span className={styles.pn}>{String(k + 1).padStart(2, "0")}</span>
              <span className={styles.pt}>{x.t}</span>
              <span className={styles.pq}>{x.q}</span>
              <span className={styles.pa}>{x.d}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={styles.palcoTela}>
        <div className={styles.palcoVideo}>
          {vista ? (
            <video key={c.id} src={`/sp/clipes/${c.id}.mp4`} poster={`/sp/clipes/${c.id}.webp`} muted loop playsInline autoPlay preload="auto" />
          ) : (
            <img src={`/sp/clipes/${c.id}.webp`} alt="" />
          )}
          <span className={styles.palcoAno}>{c.d}</span>
        </div>
        <div className={styles.palcoInfo}>
          <h3>{c.t}</h3>
          <p className={styles.palcoQ}>{c.q}</p>
          <p className={styles.palcoEla}><b>Rômulo Spuri</b>{c.ela}</p>
          <p className={styles.palcoCom}>{c.com}</p>
          <div className={styles.links}>
            <a href={LINKS.yt(c.y)} target="_blank" rel="noreferrer">assistir inteiro ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const CIDADES = ["Alfenas", "Nepomuceno", "Poços de Caldas", "São Thomé das Letras", "Santa Rita do Sapucaí", "Machado"];

/* ============ 01 CAPA ============ */
function Capa() {
  return (
    <header id="capa" className={`${styles.cena} ${styles.capa}`} data-cena data-ano="2026" data-lugar="Sul de Minas">
      <figure className={styles.capaFoto}>
        <img src={F("retrato-luz")} alt="Rômulo Spuri sentado, de jaqueta clara, na luz de uma tarde de outubro" />
        <figcaption>Rômulo Spuri</figcaption>
      </figure>
      <div className={styles.capaCampo}>
        <p className={styles.capaPre}>Rômulo</p>
        <h1>SPURI</h1>
        <p className={styles.capaFuncoes}>Produtor executivo · Diretor criativo · Label manager · Consultor de carreira</p>
        <p className={styles.capaFrase}>
          <span>O interior não precisa ser</span>
          <span>uma sala de espera.</span>
        </p>
      </div>
      <Fita itens={CIDADES} tom="papel" className={styles.capaFita} />
    </header>
  );
}

/* ============ 02 QUEM É ============ */
function Quem() {
  const [lead, ...resto] = QUEM.paragrafos;
  return (
    <section id="quem" className={`${styles.cena} ${styles.quem}`} data-tom="claro" data-cena data-ano="2014" data-lugar="Alfenas, MG">
      <figure className={styles.quemFoto}>
        <img src={F("retrato")} alt="Rômulo Spuri, em foto de um evento de rua" loading="lazy" />
        <figcaption>Rômulo Spuri</figcaption>
      </figure>
      <div className={styles.quemCorpo}>
        <R as="p" className={styles.etq}>quem é</R>
        <R as="h2" className={styles.quemBio}>{QUEM.bio}</R>
        <R as="p" className={styles.quemLead} atraso={80}>{lead}</R>
        <div className={styles.quemCols}>
          {resto.map((p, k) => (<R as="p" key={k} atraso={140 + k * 80}>{p}</R>))}
        </div>
        <ul className={styles.quemNums}>
          {NUMEROS.map((n) => (<li key={n.n}><Contador valor={n.n} /><span>{n.t}</span></li>))}
        </ul>
      </div>
    </section>
  );
}

/* ============ 03 PLANO DE CARREIRA ============ */
function Plano() {
  return (
    <section id="plano" className={`${styles.cena} ${styles.plano}`} data-cena data-ano="2026" data-lugar="Strads">
      <div className={styles.planoEsq}>
        <R as="p" className={styles.etqLima}>{PLANO.ano} · consultoria de carreira</R>
        <R as="h2" className={styles.planoFrase}><span>Não compete na estrutura,</span> <span>compete na <em>estratégia.</em></span></R>
        <R as="p" className={styles.planoTexto} atraso={120}>{PLANO.texto}</R>
        <ul className={styles.passos}>
          {PLANO.passos.map(([n, t], k) => (<R as="li" key={t} atraso={k * 70}><b>{n}</b><span>{t}</span></R>))}
        </ul>
        <R className={styles.planoCta} atraso={200}>
          <a className={styles.btnGrande} href={LINKS.plano} target="_blank" rel="noreferrer">Ver o plano de carreira <i>↗</i></a>
          <p>{PLANO.numeros.map(([n, t]) => (<span key={t}><b>{n}</b> {t}</span>))}</p>
        </R>
      </div>
      <figure className={styles.site}>
        <a className={styles.siteLink} href={LINKS.plano} target="_blank" rel="noreferrer">carreiraplano.netlify.app ↗</a>
        <div className={styles.siteJanela}>
          <div className={styles.siteBarra}><i /><i /><i /><span>carreiraplano.netlify.app</span></div>
          <div className={styles.siteTela} role="img" aria-label="Prévia rolando do site do plano de carreira" />
        </div>
      </figure>
    </section>
  );
}

/* ============ 04 GRAMMY LATINO ============ */
function Grammy() {
  return (
    <section id="grammy" className={`${styles.cena} ${styles.grammy}`} data-cena data-ano="2026" data-lugar="Las Vegas">
      <figure className={styles.grammyCartaz}>
        <p>Latin Grammy 2026 · indicados</p>
        <h3>Melhor álbum de música “urban” em língua portuguesa</h3>
        <ol>
          {GRAMMY.indicados.map(([a, b]) => (<li key={a} className={b === "Matuto S.A." ? styles.destaque : ""}><b>{a}</b><span>{b}</span></li>))}
        </ol>
      </figure>
      <div className={styles.grammyTxt}>
        <R as="p" className={styles.etq}>{GRAMMY.etq}</R>
        <R as="h2" className={styles.grammyTitulo}>INDICADO AO<br />GRAMMY LATINO</R>
        <R as="p" className={styles.grammyLead} atraso={80}>{GRAMMY.texto}</R>
        <R as="blockquote" className={styles.grammyCita} atraso={140}>“{GRAMMY.citacao}”<cite>{GRAMMY.fonte}</cite></R>
        <R className={styles.grammyAcoes} atraso={200}>
          <a className={styles.btnGrande} href={LINKS.matutoAlbum} target="_blank" rel="noreferrer">Ouvir o álbum <i>↗</i></a>
          <a className={styles.btnFino} href={LINKS.matutoClipe} target="_blank" rel="noreferrer">Ver o clipe ↗</a>
          <a className={styles.linhaLink} href={LINKS.matuto} target="_blank" rel="noreferrer">@matuto.s.a</a>
        </R>
      </div>
    </section>
  );
}

/* ============ 05 PALESTRAS (a lista troca a foto) ============ */
function Palestras() {
  const [a, setA] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [ref, vista] = useVista(true, 0.2);
  useEffect(() => {
    if (!vista || pausa) return;
    const t = setInterval(() => setA((k) => (k + 1) % PALESTRAS.length), 3800);
    return () => clearInterval(t);
  }, [vista, pausa]);
  const slides = useRef(null);
  const car = useCarrossel(slides);
  const fotoDe = (p) => (!p.foto ? null : /^[ht]\d\d$/.test(p.foto) ? P(p.foto) : F(p.foto));
  return (
    <section id="palestras" ref={ref} className={`${styles.cena} ${styles.palestras}`} data-tom="claro" data-cena data-ano="2026" data-lugar="Santa Rita do Sapucaí, MG">
      <div className={styles.palestrasEsq}>
        <R as="p" className={styles.etq}>2019 · 2026</R>
        <R as="h2" className={styles.tituloMedio}>PALESTRAS<br />E MESAS</R>
        <ul className={styles.linhaAnos} onMouseLeave={() => setPausa(false)}>
          {PALESTRAS.map((p, k) => (
            <li key={p.a + p.t} className={k === a ? styles.ativo : ""}>
              <button type="button" onMouseEnter={() => { setA(k); setPausa(true); }} onClick={() => { setA(k); setPausa(true); }} onFocus={() => { setA(k); setPausa(true); }}>
                <time>{p.a}</time>
                <span>
                  <b>{p.t}</b>
                  <em>{p.d}</em>
                </span>
              </button>
              {p.href && <a className={styles.mini} href={p.href} target="_blank" rel="noreferrer">perfil ↗</a>}
            </li>
          ))}
        </ul>
      </div>
      <figure className={styles.palestrasFoto}>
        {PALESTRAS.map((p, k) => fotoDe(p)
          ? (<img key={p.a + p.t} src={fotoDe(p)} alt="" style={p.contain ? { objectFit: "contain", background: p.bg || "#000" } : undefined} className={k === a ? styles.quadroOn : ""} loading="eager" decoding="async" />)
          : (<div key={p.a + p.t} className={`${styles.palestraCartao} ${k === a ? styles.quadroOn : ""}`}><b>{p.a}</b><span>{p.t}</span></div>))}
        <figcaption>{PALESTRAS[a].a} · {PALESTRAS[a].t}</figcaption>
      </figure>
      <div ref={slides} className={styles.palestrasSlides}>
        {PALESTRAS.map((p) => (
          <article key={p.a + p.t} className={styles.palestraSlide}>
            {fotoDe(p) && <img src={fotoDe(p)} alt="" style={p.contain ? { objectFit: "contain", background: p.bg || "#000" } : undefined} loading="lazy" decoding="async" />}
            <div>
              <time>{p.a}</time>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
              {p.href && <a className={styles.mini} href={p.href} target="_blank" rel="noreferrer">perfil ↗</a>}
            </div>
          </article>
        ))}
      </div>
      <Setas car={car} className={styles.setasPal} />
    </section>
  );
}

/* ============ 06 PAIS ============ */
function PainelVideo({ id, legenda, parado = false }) {
  const [ref, vista] = useVista(true, 0.25);
  return (
    <figure ref={ref} className={styles.paisPainel}>
      {vista && !parado ? <video src={`/sp/pais/${id}.mp4`} poster={`/sp/pais/${id}.jpg`} muted loop playsInline autoPlay preload="auto" /> : <img src={`/sp/pais/${id}.jpg`} alt="" />}
      <figcaption>{legenda}</figcaption>
    </figure>
  );
}

function Pais() {
  return (
    <section id="pais" className={`${styles.cena} ${styles.pais}`} data-tom="claro" data-cena data-ano="2026" data-lugar="Alfenas, MG">
      <div className={styles.paisEsq}>
        <R as="p" className={styles.etq}>{PAIS.ano} · {PAIS.sub}</R>
        <R as="h2" className={styles.paisTitulo}>CINEMA<br />ITINERANTE</R>
        <R as="p" className={styles.paisLead} atraso={80}>{PAIS.texto}</R>
        <ul className={styles.paisSessoes}>
          {PAIS.sessoes.map(([d, t, l], k) => (<R as="li" key={d} atraso={k * 80}><time>{d}</time><span><b>{t}</b>{l}</span></R>))}
        </ul>
        <R as="p" className={styles.paisApoio} atraso={120}>
          {PAIS.apoio} Acompanhe em{" "}
          <a className={styles.linhaLink} href={LINKS.pais} target="_blank" rel="noreferrer">@paisalfenas</a> e{" "}
          <a className={styles.linhaLink} href={LINKS.dirce} target="_blank" rel="noreferrer">@fundacaodirce</a>.
        </R>
      </div>
      <div className={styles.paisFilme}>
        <PainelVideo id="p-noite" legenda="sessão à noite" />
        <figure className={`${styles.paisPainel} ${styles.paisFlyer}`}>
          <img src={F("pais-flyer")} alt="Cartaz da sessão de cinema itinerante do PAIS, dia 25 de agosto" loading="lazy" />
        </figure>
        <PainelVideo id="p-rua" legenda="a rua se enche de gente" />
      </div>
    </section>
  );
}

/* ============ 07 FOLIA DE REIS (faixa horizontal fixa: 20 fotos) ============ */
function Folia() {
  const [ref, trilho] = useFaixa();
  const car = useCarrossel(trilho, { intervalo: 5200 });
  const fotos = Array.from({ length: 20 }, (_, k) => sp(`folia/f${String(k).padStart(2, "0")}`));
  return (
    <section id="folia" ref={ref} className={`${styles.cena} ${styles.folia}`} data-cena data-ano="2026" data-lugar="Nepomuceno, MG">
      <div className={styles.pino}>
        <div ref={trilho} className={styles.foliaTrilho}>
          <div className={styles.foliaAbre}>
            <p className={styles.etqLima}>fotografia · cultura popular</p>
            <h2 className={styles.foliaTitulo}>FOLIA<br />DE REIS</h2>
            {POPULAR.folia.map((t, k) => (<p key={k} className={k === 0 ? styles.foliaSalve : ""}>{t}</p>))}
            <small>{POPULAR.fonte}</small>
            <span className={styles.foliaSeta}>deslize para o lado →</span>
          </div>
          {fotos.map((f, k) => (
            <figure key={f} className={styles.foliaFoto}>
              <img src={f} alt="" loading="eager" decoding="async" />
              <figcaption>{String(k + 1).padStart(2, "0")}/{fotos.length}</figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.foliaBarra} aria-hidden="true"><i /></div>
      </div>
      <Setas car={car} className={styles.setasFolia} />
    </section>
  );
}

/* ============ 08 CONGADA (galeria: escolha a foto, ou deixe passar) ============ */
function Congada() {
  const fotos = Array.from({ length: 15 }, (_, k) => sp(`congada/c${String(k).padStart(2, "0")}`));
  const [a, setA] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [ref, vista] = useVista(true, 0.25);
  useEffect(() => {
    if (!vista || pausa) return;
    const t = setInterval(() => setA((k) => (k + 1) % fotos.length), 4200);
    return () => clearInterval(t);
  }, [vista, pausa, fotos.length]);
  return (
    <section id="congada" ref={ref} className={`${styles.cena} ${styles.congada}`} data-tom="claro" data-cena data-ano="2026" data-lugar="Nepomuceno, MG">
      <figure className={styles.congadaFoto}>
        {fotos.map((f, k) => (<img key={f} src={f} alt="" className={k === a ? styles.quadroOn : ""} loading="eager" decoding="async" />))}
        <figcaption>{String(a + 1).padStart(2, "0")}/{fotos.length}</figcaption>
      </figure>
      <div className={styles.congadaTxt}>
        <R as="p" className={styles.etq}>fotografia · outubro de 2026</R>
        <R as="h2" className={styles.tituloMedio}>CONGADA<br />NO CRUZEIRO</R>
        <R as="p" className={styles.congadaLead} atraso={80}>{POPULAR.congada}</R>
        <ul className={styles.congadaMiniaturas} onMouseLeave={() => setPausa(false)}>
          {fotos.map((f, k) => (
            <li key={f}>
              <button type="button" className={k === a ? styles.ativa : ""} onClick={() => { setA(k); setPausa(true); }} onMouseEnter={() => { setA(k); setPausa(true); }} aria-label={`foto ${k + 1}`}>
                <img src={f} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
        <small className={styles.congadaFonte}>{POPULAR.fonte}</small>
      </div>
    </section>
  );
}

/* ============ 08 PISTA ============ */
function Pista() {
  const capas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => sp(`capas/b${String(n).padStart(2, "0")}`));
  return (
    <section id="pista" className={`${styles.cena} ${styles.pista}`} data-tom="claro" data-cena data-ano="2026" data-lugar="São Thomé das Letras, MG">
      <div className={styles.pistaCapas}>
        {capas.map((c, k) => (<R key={c} atraso={(k % 4) * 60} className={styles.capaDisco}><img src={c} alt="" loading="lazy" /></R>))}
      </div>
      <div className={styles.pistaTxt}>
        <R as="p" className={styles.etq}>2026 · na pista</R>
        <R as="h2" className={styles.tituloMedio}>SPURI<br />SELECTAH</R>
        <R as="p" className={styles.pistaLead} atraso={80}>{PISTA.texto}</R>
        <R className={styles.links} atraso={120}><a href={LINKS.post("DdNWWamnMG8")} target="_blank" rel="noreferrer">as capas, no post original ↗</a></R>
        <ul className={styles.pistaEventos}>
          {PISTA.eventos.map(([d, l, t, h], k) => (
            <R as="li" key={d} atraso={k * 90}>
              <time>{d}</time>
              <div><h3><a href={h} target="_blank" rel="noreferrer">{l} ↗</a></h3><p>{t}</p></div>
            </R>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============ 09 STRADS ============ */
function Strads() {
  return (
    <section id="strads" className={`${styles.cena} ${styles.strads}`} data-tom="claro" data-cena data-ano="2017" data-lugar="Alfenas, MG">
      <div className={styles.stradsTxt}>
        <R as="p" className={styles.etq}>2017 · hoje · {STRADS.antes}</R>
        <R as="h2" className={styles.stradsTitulo}>STRADS</R>
        <R as="p" className={styles.stradsLead} atraso={80}>{STRADS.texto}</R>
        <R className={styles.stradsFuncoes} atraso={140}>
          {STRADS.funcoes.map(([f, q]) => (<span key={f}><small>{f}</small><b>{q}</b></span>))}
        </R>
        <R className={styles.links} atraso={200}>
          <a href={LINKS.strads} target="_blank" rel="noreferrer">@stradsss ↗</a>
          <a href={LINKS.stradsPortfolio} target="_blank" rel="noreferrer">portfólio @strads.con ↗</a>
          <a href={LINKS.youtube} target="_blank" rel="noreferrer">canal Straditerra ↗</a>
        </R>
      </div>
      <ol className={styles.lancamentos}>
        {STRADS.lancamentos.map(([a, q, t, c], k) => (
          <R as="li" key={t} atraso={k * 60}>
            <time>{a}</time>
            <div><h3>{q}</h3><p className={styles.lt}>{t}</p><p className={styles.lc}>{c}</p></div>
          </R>
        ))}
      </ol>
      <R className={styles.mixtrada} atraso={160}>
        <figure><img src={F("strads-3")} alt="Artistas em estúdio, trabalho da Strads" loading="lazy" /></figure>
        <p>{STRADS.mixtradaA}<Link href={LINKS.isa}>Isa Katupyryb</Link>{STRADS.mixtradaB}</p>
        <p>{STRADS.extra} <a href={LINKS.stradsPortfolio} target="_blank" rel="noreferrer">@strads.con</a></p>
      </R>
    </section>
  );
}

/* ============ 10 HIP HOP DE RUA ============ */
function Rua() {
  const fita = [RUA.cartaz.t, RUA.cartaz.d, ...RUA.cartaz.lista.split(" · ")];
  return (
    <section id="rua" className={`${styles.cena} ${styles.rua}`} data-cena data-ano="2018" data-lugar="Sul de Minas">
      <div className={styles.ruaTopo}>
        <figure className={styles.ruaFoto}>
          <Quadro fotos={[F("duelo-grupo"), F("duelo-rua"), F("faisca-roda"), F("faisca-danca")]} intervalo={4200} legenda="Duelo de MCs · Faísca" />
        </figure>
        <div className={styles.ruaCorpo}>
          <R as="p" className={styles.etqLima}>da roda à rua</R>
          <R as="h2" className={styles.ruaTitulo}>HIP HOP<br />DE RUA</R>
          <ul className={styles.ruaLista}>
            {RUA.itens.map(([a, t, d], k) => (
              <R as="li" key={t} atraso={k * 60}>
                <time>{a || "projeto"}</time>
                <div><h3>{t}</h3><p>{d}</p></div>
              </R>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.ruaFesta}>
        <Fita itens={fita} tom="lima" className={styles.ruaFita} />
      </div>
    </section>
  );
}

/* ============ 11 STRADITERRA × JODO ============ */
function Palco11() {
  return (
    <section id="straditerra" className={`${styles.cena} ${styles.clipes}`} data-cena data-ano="2017" data-lugar="Alfenas, MG">
      <div className={styles.clipesCab}>
        <R as="p" className={styles.etqLima}>2017 · 2020 · hoje Strads</R>
        <R as="h2" className={styles.tituloMedio}>STRADITERRA × JODO</R>
        <R as="p" className={styles.clipesLead}>
          Produção executiva de clipes e filmes em Alfenas, feitos em parceria com a JODO. Passe o mouse (ou toque) nos títulos para ver o trecho. Na mesma estrada, na JODO, estava{" "}
          <Link href={LINKS.isa} className={styles.linhaLink}>Isa Katupyryb</Link>.
        </R>
      </div>
      <Palco lista={VIDEOS} />
    </section>
  );
}

/* ============ 12 CINEMA FORA DE CENA (fita de capas que corre; cada capa abre o vídeo no Vimeo) ============ */
function Cinema() {
  const eps = VIMEO.eps.map(([n, id]) => ({ id, t: `Vivência Chaves ${n}`, d: "série" }));
  const lista = [...VIMEO.itens.map((x) => ({ id: x.id, t: x.t, d: x.d })), ...eps];
  const dobro = [...lista, ...lista];
  return (
    <section id="cinema" className={`${styles.cena} ${styles.cinema}`} data-tom="claro" data-cena data-ano="2018" data-lugar="Alfenas, MG">
      <div className={styles.cinemaCab}>
        <div>
          <R as="p" className={styles.etq}>{CINEMA_FORA.ano} · produção executiva</R>
          <R as="h2" className={styles.cinemaTitulo}>CINEMA FORA DE CENA</R>
        </div>
        <div>
          <R as="p" className={styles.cinemaLead} atraso={80}>{CINEMA_FORA.texto}</R>
          <R className={styles.links} atraso={140}>
            <a href={LINKS.vimeoCinema} target="_blank" rel="noreferrer">o canal inteiro no Vimeo ↗</a>
          </R>
        </div>
      </div>
      <div className={styles.cinemaFita}>
        <div className={styles.cinemaTrilho}>
          {dobro.map((v, k) => (
            <a key={v.id + k} className={styles.cinemaCard} href={LINKS_ISA.vimeoItem(v.id)} target="_blank" rel="noreferrer" aria-label={v.t}>
              <img src={`/ik/capas/vimeo/${v.id}.webp`} alt="" loading="lazy" />
              <span><b>{v.t}</b><i>{v.d}</i></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ 13 COLISEU ============ */
function Coliseu() {
  return (
    <section id="coliseu" className={`${styles.cena} ${styles.coliseu}`} data-cena data-ano="2016" data-lugar="Praça Dr. Emílio da Silveira, Alfenas">
      <figure className={styles.coliseuFoto}>
        <Quadro fotos={[F("coliseu-multidao"), F("coliseu-breaking"), F("coliseu-praca"), F("coliseu-dj"), F("coliseu-palco"), F("escolas-quadra"), F("escolas-grupo")]} intervalo={3600} legenda="Coliseu Cultural" />
      </figure>
      <div className={styles.coliseuTxt}>
        <R as="p" className={styles.etqLima}>{COLISEU.ano} · 12 edições</R>
        <R as="h2" className={styles.tituloMedio}>COLISEU<br />CULTURAL</R>
        <R as="p" className={styles.coliseuLead} atraso={80}>{COLISEU.texto}</R>
        <R as="p" className={styles.coliseuMini} atraso={140}>{COLISEU.incluiu}</R>
        <R as="blockquote" className={styles.citacao} atraso={200}>“{COLISEU.citacao}”<cite>{COLISEU.citacaoFonte}</cite></R>
      </div>
    </section>
  );
}

/* ============ 14 A ESTRADA (rolagem horizontal fixa, de 2023 a 2014) ============ */
const PAINEIS = [
  ["2018 · 2023", "Pé de Palavra", "Projeto de arte-educação, alfabetização, letramento e inclusão. Produção executiva do projeto e gestão da turnê.", ["pe-palavra-pano", "pe-palavra-lousa", "pe-palavra-patio", "pe-palavra-sala"]],
  ["2017 · 2019", "Estamparia Social", "Empreendedorismo social: cursos, oficinas e estamparia com jovens em cumprimento de medidas socioeducativas.", ["estamparia-prints", "estamparia"]],
  ["2017 · 2019", "Estúdio Social", "Estúdio acessível com moeda social: cinco horas de estúdio para o artista, que paga com cinco horas de oficina ensinando algo que sabe.", ["card-estudio"]],
  ["2017 · 2019", "Biblioteca Social", "Biblioteca no espaço da Estamparia Social, com articulação para receber mais de 600 títulos e dar acesso à comunidade do Santa Luzia e arredores.", ["estamparia", "aquarela-biblioteca"]],
  ["2016 · 2019", "Programa Cidade Escola", "Coordenação regional do programa de educação e cultura da Prefeitura de Alfenas: 26 oficineiros, oficinas de rap, breaking, graffiti, DJ e beatmaker e eventos nas comunidades.", ["escolas-aula", "pe-palavra-patio"]],
  ["2015 · 2017", "Casa Cultural Aquarela", "Casa cultural na comunidade Santa Luzia, com mais de 10 oficinas gratuitas, arte-educadores contratados e cronograma de atividades.", ["aquarela-biblioteca", "aquarela-tv"]],
  ["2014 · 2016", "Oficinas de hip hop", "Coordenação das oficinas de hip hop no CREAS de Alfenas, com jovens em cumprimento de medidas socioeducativas, e programa de oficinas de hip hop nas comunidades.", ["oficinas-tenda"]],
  ["2014 · 2016", "Festival Faísca", "Produção executiva do festival colaborativo entre a UNIFAL-MG, a Prefeitura e coletivos culturais: música, dança, teatro, literatura, cinema e intervenções socioculturais.", ["faisca-palco", "faisca-mural", "faisca-roda", "faisca-danca"]],
];

function Estrada() {
  const [ref, trilho] = useFaixa();
  const car = useCarrossel(trilho, { intervalo: 5600 });
  return (
    <section id="estrada" ref={ref} className={`${styles.cena} ${styles.estrada}`} data-tom="claro" data-cena data-ano="2014" data-lugar="Alfenas, MG">
      <div className={styles.pino}>
        <div className={styles.estradaCab}>
          <p className={styles.etq}>2023 · 2014 · rolando para trás</p>
          <h2 className={styles.tituloMedio}>EDUCAÇÃO E AÇÃO SOCIAL</h2>
        </div>
        <div ref={trilho} className={styles.estradaTrilho}>
          {PAINEIS.map(([a, t, d, foto], k) => (
            <article key={t} className={`${styles.painel} ${foto ? "" : styles.painelSemFoto}`}>
              <span className={styles.painelNum}>{String(k + 1).padStart(2, "0")}</span>
              {foto && <figure><Quadro className={foto[0].startsWith("card-") ? styles.quadroCartao : ""} fotos={foto.map(F)} intervalo={3400 + k * 300} atraso={k * 400} contador={false} /></figure>}
              <div>
                <time>{a}</time>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.estradaBarra} aria-hidden="true"><i /></div>
        <Setas car={car} className={styles.setasEstrada} />
      </div>
    </section>
  );
}

/* ============ 15 NA MÍDIA (parede de prints de TV + a revista, que se lê passando de uma página à outra) ============ */
function Midia() {
  const tv = ["tv-1", "tv-3", "tv-4", "tv-5", "tv-6", "tv-2", "aquarela-tv"].map(F);
  return (
    <section id="midia" className={`${styles.cena} ${styles.midia}`} data-tom="claro" data-cena data-ano="2018" data-lugar="Alfenas, MG">
      <div className={styles.midiaCab}>
        <R as="p" className={styles.etq}>TV e revista</R>
        <R as="h2" className={styles.tituloMedio}>NA MÍDIA</R>
        <R as="p" className={styles.midiaLead}>{MIDIA.texto}</R>
      </div>
      <div className={styles.midiaParede}>
        <Quadro className={styles.mpGrande} fotos={tv} intervalo={1700} fade={0.25} legenda="reportagens de TV" />
        <figure className={styles.mpRevista}>
          <div className={styles.revistaPagina}><img src={F("midia-revista")} alt="Página da revista com a reportagem “Hip hop no interior”" loading="lazy" /></div>
          <figcaption>revista · “Hip Hop no Interior”</figcaption>
        </figure>
        <R className={styles.mpNota}>
          <b>Biólogo, educador ambiental, produtor audiovisual.</b>
          <span>Nas reportagens, a legenda muda. O trabalho, produzir cultura de rua no interior, é o mesmo.</span>
        </R>
      </div>
    </section>
  );
}

/* ============ 16 ORIGEM ============ */
function Origem() {
  return (
    <section id="origem" className={`${styles.cena} ${styles.origem}`} data-tom="claro" data-cena data-ano="Nepomuceno" data-lugar="Minas Gerais">
      <figure className={styles.origemFoto}>
        <img src={F("avo")} alt="Maria Odisseia Spuri, avó materna de Rômulo, na mercearia" loading="lazy" />
        <figcaption>Maria Odisseia Spuri · mercearia</figcaption>
      </figure>
      <div className={styles.origemTxt}>
        <R as="p" className={styles.etq}>de onde vem</R>
        <R as="h2" className={styles.tituloMedio}>{ORIGEM.titulo.toUpperCase()}</R>
        <R as="p" className={styles.origemLead} atraso={80}>{ORIGEM.texto}</R>
        <R as="blockquote" className={styles.citacaoGrande} atraso={160}>“{ORIGEM.frase}”<cite>{ORIGEM.fraseFonte}</cite></R>
      </div>
    </section>
  );
}

/* ============ 17 CONTATO ============ */
function Contato() {
  const linhas = [
    ["e-mail", LINKS.email, `mailto:${LINKS.email}`],
    ["instagram", "@romulospuri_", LINKS.ig],
    ["produtora", "@stradsss", LINKS.strads],
    ["vídeos", "Straditerra no YouTube", LINKS.youtube],
  ];
  return (
    <section id="contato" className={`${styles.cena} ${styles.contato}`} data-cena data-ano="2026" data-lugar="Fale com ele">
      <div className={styles.contatoEsq}>
        <R as="p" className={styles.etqLima}>fale com ele</R>
        <R as="h2" className={styles.contatoTitulo}>VAMOS<br />PLANEJAR?</R>
        <R as="p" className={styles.contatoLead} atraso={80}>Para planejar a carreira, produzir um lançamento ou levar um projeto para o interior.</R>
      </div>
      <R className={styles.contatoDir} atraso={140}>
        <a className={styles.btnGrande} href={LINKS.plano} target="_blank" rel="noreferrer">Plano de carreira <i>↗</i></a>
        <ul className={styles.contatoLista}>
          {linhas.map(([rot, val, href]) => (
            <li key={rot}>
              <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">
                <small>{rot}</small>
                <b>{val}</b>
                <i>↗</i>
              </a>
            </li>
          ))}
        </ul>
      </R>
      <Fita itens={CIDADES} tom="lima" className={styles.contatoFita} />
      <p className={styles.rodape}>Nepomuceno e Alfenas, MG · Página feita pela JODO.</p>
    </section>
  );
}

export default function SpuriEstrada() {
  const raiz = useRef(null);
  const [marca, setMarca] = useState("#ece9e2");
  const [trilho, setTrilho] = useState({ ano: "2026", lugar: "Sul de Minas" });
  const [trilhoOn, setTrilhoOn] = useState(false);
  const [topo, setTopo] = useState(false);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      let tom = "escuro";
      for (const el of document.elementsFromPoint(innerWidth / 2, 36)) {
        const s = el.closest && el.closest("[data-cena]");
        if (s) { tom = s.dataset.tom === "claro" ? "claro" : "escuro"; break; }
      }
      setMarca(tom === "claro" ? "#141413" : "#ece9e2");
      setTopo(scrollY > innerHeight * 1.1);
      setTrilhoOn(scrollY > innerHeight * 0.7);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => { removeEventListener("scroll", on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const cenas = [...raiz.current.querySelectorAll("[data-cena]")];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setTrilho({ ano: e.target.dataset.ano, lugar: e.target.dataset.lugar }); }),
      { rootMargin: "-48% 0px -48% 0px" }
    );
    cenas.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  // o layout global usa overflow-x: hidden em html e body (quebra o position: sticky das sessões fixas); aqui vira clip
  useEffect(() => {
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    els.forEach((e) => { e.style.overflowX = "clip"; });
    return () => els.forEach((e, i) => { e.style.overflowX = antes[i]; });
  }, []);

  return (
    <main ref={raiz} className={styles.raiz}>
      <VoltarJodo />
      <MarcaTopo nome="RÔMULO SPURI" cor={marca} />
      <aside className={`${styles.trilho} ${trilhoOn ? styles.trilhoOn : ""}`} aria-hidden="true">
        <b key={trilho.ano}>{trilho.ano}</b>
        <span key={trilho.lugar}>{trilho.lugar}</span>
      </aside>
      <button type="button" className={`${styles.topoFixo} ${topo ? styles.topoOn : ""}`} onClick={() => scrollTo({ top: 0, behavior: "smooth" })} aria-label="Voltar ao topo">↑</button>

      <Capa />
      <Quem />
      <Plano />
      <Grammy />
      <Palestras />
      <Pais />
      <Folia />
      <Congada />
      <Pista />
      <Strads />
      <Rua />
      <Palco11 />
      <Cinema />
      <Coliseu />
      <Estrada />
      <Midia />
      <Origem />
      <Contato />
    </main>
  );
}
