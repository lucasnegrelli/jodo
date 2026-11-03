"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import VoltarJodo from "@/components/comum/VoltarJodo";
import MarcaTopo from "@/components/comum/MarcaTopo";
import IsaRota from "@/components/sala/IsaRota";
import styles from "@/styles/isaFolha.module.css";
import {
  LINKS, yt, NUMEROS, CUBA, CAMPANHA, VIMEO, CLIPES, JODO, JODO_LINHA, LUNAR, PARENTESES, PREMIO, REGISTROS, CINEMA,
  HIPHOP, MUSICA, TEXTOS, MESAS, COLETIVOS, DESENHOS,
} from "@/data/isaKatupyryb";

/*
 * Isa Katupyryb · caderno de colagem (v2).
 * Cada capítulo é uma sessão de tela cheia, com a sua cor, e entra por cima da anterior com a borda de papel rasgado.
 * A arte dela (onça, máscara, cobra, criaturas, rostos) está recortada em /ik/corte e flutua em camadas com parallax;
 * algumas peças atravessam a borda e passam de uma sessão para a outra (as "pontes").
 * Tipografia: Instrument Serif (a voz), Helvetica Now (cartaz), Space Mono (ficha) e Reenie Beanie (anotação à mão).
 */

const foto = (n) => `/ik/fotos/${n}.webp`;
const arte = (n) => `/ik/arte/${n}.webp`;
const capa = (n) => `/ik/capas/${n}.webp`;
const corte = (n) => `/ik/corte/${n}.webp`;
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const rot = (i, amp = 4) => ((i * 53) % (amp * 2 + 1)) - amp; // rotação determinística (sem Math.random: evita erro de hidratação)

// observa quando o elemento entra na tela. repete = também desliga ao sair (para vídeos).
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

/*
 * Camada: elemento solto da sessão, com parallax. --p (de -1 a 1) vem da sessão; y/x em px e g em graus por unidade de p.
 * l/t/r/b/w posicionam em desktop; lm/tm/rm/bm/wm sobrescrevem no celular; hide some no celular.
 */
function Camada({ src, alt = "", y = 0, x = 0, g = 0, z = 3, l, t, r, b, w, lm, tm, rm, bm, wm, hide = false, giro = 0, eager = false, rel = false, className = "", children }) {
  const v = { "--z": z };
  if (l != null) v["--l"] = l; if (t != null) v["--t"] = t; if (r != null) v["--r"] = r; if (b != null) v["--b"] = b; if (w != null) v["--w"] = w;
  if (lm != null) v["--lm"] = lm; if (tm != null) v["--tm"] = tm; if (rm != null) v["--rm"] = rm; if (bm != null) v["--bm"] = bm; if (wm != null) v["--wm"] = wm;
  return (
    <div data-par="" data-y={y} data-x={x} data-g={g} data-giro={giro} data-z={z} className={`${styles.cam} ${rel ? styles.camRel : ""} ${hide ? styles.camHide : ""} ${className}`} style={v} aria-hidden={src ? "true" : undefined}>
      <div className={styles.camGiro} style={{ transform: `rotate(${giro}deg)` }}>{src ? <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" /> : children}</div>
    </div>
  );
}

// foto ou desenho colado na mesa: papel rasgado (rasga 1 a 3) ou moldura de impressão, com fita
function Recorte({ src, alt = "", rasga = 1, giro = 0, moldura = false, fita = true, legenda, className = "", style, largura, altura }) {
  const [ref, vista] = useVista(false, 0.25);
  return (
    <figure
      ref={ref}
      className={`${styles.rec} ${moldura ? styles.moldura : styles[`rasga${rasga}`]} ${vista ? styles.vista : ""} ${className}`}
      style={{ "--rot": `${giro}deg`, ...style }}
    >
      <span className={styles.molde}>
        <img src={src} alt={alt} width={largura} height={altura} loading="lazy" decoding="async" />
      </span>
      {fita && <i className={styles.fita} />}
      {legenda && <figcaption>{legenda}</figcaption>}
    </figure>
  );
}

// fotos que passam sozinhas (o "GIF"): só roda com o quadro na tela
function Passa({ fotos, legenda, className = "", ar = "4 / 3", rasga = 1, giro = 0, intervalo = 3000, limpo = false, inicio = 0 }) {
  const [ref, vista] = useVista(true, 0.2);
  const [i, setI] = useState(inicio % fotos.length);
  useEffect(() => {
    if (!vista) return;
    const t = setInterval(() => setI((k) => (k + 1) % fotos.length), intervalo);
    return () => clearInterval(t);
  }, [vista, fotos.length, intervalo]);
  return (
    <figure ref={ref} className={`${styles.passa} ${limpo ? styles.passaLimpa : styles[`rasga${rasga}`]} ${className}`} style={{ "--rot": `${giro}deg`, ...(ar ? { aspectRatio: ar } : {}) }}>
      <span className={styles.molde}>
        {fotos.map((f, k) => (<img key={f} src={foto(f)} alt="" className={k === i ? styles.passaOn : ""} loading="lazy" decoding="async" />))}
      </span>
      {!limpo && <i className={styles.fita} />}
      <span className={styles.passaCont}>{String(i + 1).padStart(2, "0")}/{String(fotos.length).padStart(2, "0")}</span>
      {legenda && <figcaption>{legenda}</figcaption>}
    </figure>
  );
}

// foto no estilo do LUNAR: nítida, moldura fina e brilho frio
function FotoLimpa({ src, alt = "", className = "" }) {
  const [ref, vista] = useVista(false, 0.2);
  return (
    <figure ref={ref} className={`${styles.limpa} ${vista ? styles.limpaOn : ""} ${className}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </figure>
  );
}

/* palco: lista de títulos de um lado, a tela do clipe do outro. O vídeo só carrega e toca com o palco na tela. */
function Palco({ lista, rotulo = "assistir ↗" }) {
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
              <span className={styles.pa}>{x.ano}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={styles.palcoTela}>
        <div className={styles.palcoVideo} style={{ aspectRatio: c.ar }}>
          {vista ? (
            <video key={c.id} src={`/ik/clipes/${c.id}.mp4`} poster={`/ik/clipes/${c.id}.webp`} muted loop playsInline autoPlay preload="auto" />
          ) : (
            <img src={`/ik/clipes/${c.id}.webp`} alt="" />
          )}
          <span className={styles.palcoAno}>{c.ano}</span>
        </div>
        <div className={styles.palcoInfo}>
          <h3>{c.t}</h3>
          <p className={styles.palcoQ}>{c.q}</p>
          {c.ela ? (
            <>
              <p className={styles.palcoEla}><b>Isa Hansen</b>{c.ela}</p>
              <p className={styles.palcoCom}>{c.com}</p>
            </>
          ) : (
            <p className={styles.palcoP}>{c.p}</p>
          )}
          {c.selo && <p className={styles.selo}>{c.selo}</p>}
          {c.nota && <p className={styles.palcoN}>{c.nota}</p>}
          <div className={styles.links}>
            <a href={yt(c.y)} target="_blank" rel="noreferrer">{rotulo}</a>
            {c.interno && <Link href={c.interno}>página do artista ↗</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 01 CAPA ============ */
function Capa() {
  return (
    <header className={`${styles.cena} ${styles.capa}`} data-tom="claro" data-cena>
      <p className={styles.capaVert} aria-hidden="true">MADE IN PINDORAMA</p>
      <Camada className={styles.capaOnca} eager src={corte("onca-linha-tinta")} y={-110} r="-5vw" b="-3vh" w="auto" z={0} />
      <p className={styles.capaTag}>Ficções documentais, hip hop e produção de cultura pelo anti-etnocídio indígena</p>
      <p className={styles.capaBio}>Cineasta, fotógrafe e artista visual. Mais de 60 videoclipes de rap, a Revista Parenteses, o Prêmio Vidas Indígenas e, agora, o mestrado na EICTV, em Cuba.</p>
      <Camada y={-46} z={4} className={styles.capaNomeCam}>
        <h1 className={styles.capaNome}>
          <span>isa <s className={styles.hansen}>hansen</s></span>
          <span>katupyryb</span>
        </h1>
      </Camada>
      <Camada y={90} g={-5} z={3} r="clamp(40px, 11vw, 190px)" t="clamp(80px, 12vh, 130px)" w="clamp(170px, 21vw, 330px)" rm="3vw" tm="33vh" wm="29vw">
        <Recorte src={foto("ret-pb")} rasga={2} giro={-4} className={styles.cheio} alt="Retrato de Isa Katupyryb" legenda="ela/elu/ele" />
      </Camada>
      <Camada y={-170} g={8} z={3} r="clamp(14px, 3.5vw, 60px)" b="clamp(70px, 13vh, 150px)" w="clamp(110px, 13vw, 210px)" hide>
        <Recorte src={arte("colagem-cor")} moldura giro={6} className={styles.cheio} />
      </Camada>
      <Camada y={130} g={-6} z={3} r="clamp(150px, 24vw, 420px)" t="clamp(200px, 40vh, 380px)" w="clamp(120px, 14vw, 230px)" hide>
        <Recorte src={arte("pindorama")} moldura giro={-7} className={styles.cheio} />
      </Camada>
      {/* ponte: a máscara passa para a declaração */}
      <Camada src={corte("mascara")} y={-190} g={14} z={6} l="38vw" b="-15vh" w="clamp(110px, 13vw, 210px)" lm="auto" rm="5vw" wm="27vw" bm="-4vh" />
      <p className={styles.capaSub}>Multiartivista do cinema, do hip hop e do anti-etnocídio indígena. São Paulo.</p>
      <span className={styles.capaNota}>role: tem colagem, tem vaquinha, tem história</span>
    </header>
  );
}

/* ============ 02 DECLARAÇÃO (a sessão fica fixa e as palavras acendem com a rolagem) ============ */
function Declaracao() {
  const ref = useRef(null);
  const [fase2, setFase2] = useState(false);
  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    const ws = [...sec.querySelectorAll("[data-w]")];
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const total = Math.max(1, r.height - innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / total));
      const k = Math.ceil(Math.min(1, p / 0.62) * ws.length);
      ws.forEach((w, i) => w.classList.toggle(styles.acesa, i < k));
      setFase2(p > 0.74);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const frases = [
    "Minha câmera é corpo.",
    "Não nego o orgânico, não temo o experimental, não sufoco o poético.",
    "Se meu corpo treme, por que minha imagem não pode tremer?",
  ];
  let i = 0;
  return (
    <section id="declaracao" ref={ref} className={`${styles.cena} ${styles.decl}`} data-tom="claro" data-cena>
      <div className={styles.pino}>
        <Camada src={corte("rosto-1")} y={-420} g={-5} z={1} r="26vw" t="10vh" w="min(12.5vw, 200px)" wm="22vw" rm="70vw" tm="3vh" bm="auto" />
        <Camada src={corte("rosto-2")} y={-210} g={4} z={1} r="13vw" t="6vh" w="min(13.5vw, 215px)" wm="22vw" rm="40vw" tm="1vh" bm="auto" />
        <Camada src={corte("rosto-3")} y={-560} g={-3} z={1} r="0vw" t="14vh" w="min(14vw, 220px)" wm="22vw" rm="8vw" tm="4vh" bm="auto" />
        <div className={`${styles.declA} ${fase2 ? styles.sai : ""}`}>
          <p className={styles.etq}>declaração de artista</p>
          {frases.map((f, k) => (
            <p key={k} className={`${styles.declFrase} ${k === 2 ? styles.declTreme : ""}`}>
              {f.split(" ").map((w) => (
                <span key={i} data-w={i++} className={styles.palavra}>{w} </span>
              ))}
            </p>
          ))}
          <p className={styles.declFim}>
            Meu audiovisual é, porque eu sou: <strong>memória e presença.</strong>
          </p>
        </div>
        <div className={`${styles.declB} ${fase2 ? styles.entra : ""}`}>
          <div className={styles.carimbos}>
            {NUMEROS.map((x, k) => (
              <div key={x.n} style={{ "--rot": `${[-3, 2, -2, 3][k]}deg` }}>
                <b>{x.n}</b><span>{x.t}</span>
                <em>{x.links.map(([rot, href]) => (<a key={rot} href={href} target="_blank" rel="noreferrer">{rot} ↗</a>))}</em>
              </div>
            ))}
          </div>
          <p className={styles.declBaixo}>
            A pesquisa central é o registro de identidades que historicamente foram, e ainda são, apagadas. A narrativa se constrói na ilha de edição, no encontro entre estética, afeto e diversidade.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============ 03 CUBA ============ */
function Cuba() {
  const [copiado, setCopiado] = useState(false);
  const compartilhar = useCallback(async () => {
    try {
      if (navigator.share) { await navigator.share({ title: "Isa Katupyryb · Rumo à EICTV", url: LINKS.vakinha }); return; }
      await navigator.clipboard.writeText(LINKS.vakinha);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2600);
    } catch {}
  }, []);

  return (
    <section id="cuba" className={`${styles.cena} ${styles.cuba}`} data-cena>
      <div className={styles.cubaFundo} data-bgy="-40" data-bgbase="-110" aria-hidden="true" />
      <div className={styles.cubaTxt}>
        <R as="p" className={styles.etq}>2026 · acontecendo agora</R>
        <R as="h2" className={styles.cubaTitulo}>RUMO<br />À EICTV</R>
        <R as="p" className={styles.cubaLead} atraso={80}>
          Mestrado na Escuela Internacional de Cine y TV, em Cuba. Aprovade três vezes. O que falta é chegar lá.
        </R>
        <R className={styles.cubaCta} atraso={120}>
          <a className={styles.btnGrande} href={LINKS.vakinha} target="_blank" rel="noreferrer">Apoiar na Vakinha <i>↗</i></a>
          <button type="button" className={styles.btnFino} onClick={compartilhar}>{copiado ? "link copiado" : "compartilhar a campanha"}</button>
        </R>
        <R as="blockquote" className={styles.cubaFrase} atraso={160}>
          “Estudar não devia ser privilégio de alguns.”
          <cite>Isa Katupyryb, na campanha</cite>
        </R>
      </div>
      <div className={styles.cubaViz}>
        <Camada y={-60} z={2} className={styles.globoCam}>
          <div className={styles.globo}><IsaRota /></div>
        </Camada>
        <Camada y={70} g={-3} z={4} className={styles.recibosCam}>
          <div className={styles.recibos}>
            <div style={{ "--rot": "-3deg" }}><small>o curso</small><b>{CUBA.curso}</b><span>{CUBA.cursoReais}</span></div>
            <div style={{ "--rot": "2deg" }}><small>passagens e passaporte</small><b>+ R$ 10 mil</b><span>{CUBA.extras}</span></div>
            <div style={{ "--rot": "-1.5deg" }}><small>reserva</small><b>área rural</b><span>transporte, internet e farmácia são escassos perto da escola</span></div>
          </div>
        </Camada>
      </div>
      {/* ponte: a pula-corda sai de Cuba e entra no diário */}
      <Camada src={corte("pula-corda")} y={-90} g={-3} z={6} r="-3.5vw" b="-16vh" w="clamp(90px, 9vw, 140px)" wm="22vw" rm="2vw" bm="-24vh" />
    </section>
  );
}

/* ============ 04 DIÁRIO DA CAMPANHA ============ */
function Campanha() {
  const [copiado, setCopiado] = useState(false);
  const copiar = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CAMPANHA.pix);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2400);
    } catch {}
  }, []);
  const pct = (CAMPANHA.atual / CAMPANHA.meta) * 100;
  return (
    <section id="campanha" className={`${styles.cena} ${styles.camp}`} data-tom="claro" data-cena>
      <header className={styles.campCab}>
        <R as="p" className={styles.etq}>diário da campanha · parte 2</R>
        <R as="h2" className={styles.campTitulo}>onde a campanha está</R>
      </header>
      <div className={styles.campCorpo}>
        <R className={styles.medidor}>
          <div className={styles.medNum}>
            <b>R$ {fmt(CAMPANHA.atual)}</b>
            <span>de R$ {fmt(CAMPANHA.meta)}</span>
          </div>
          <div className={styles.barra} role="img" aria-label={`${pct.toFixed(2).replace(".", ",")}% da meta`}>
            <i style={{ width: `${Math.max(pct, 0.9)}%` }} />
            {["25 mil", "50 mil", "75 mil", "100 mil"].map((t, k) => (<u key={t} style={{ left: `${(k + 1) * 25}%` }}>{t}</u>))}
          </div>
          <ul className={styles.medStats}>
            <li><b>{CAMPANHA.apoiadores}</b>apoiadores</li>
            <li><b>{pct.toFixed(2).replace(".", ",")}%</b>da meta</li>
            <li><b>R$ {fmt(18979)}</b>na 1ª vaquinha</li>
          </ul>
          <p className={styles.medNota}>
            Foto de {CAMPANHA.conferido}: o valor muda. O número vivo está na Vakinha. No perfil dela, {CAMPANHA.total.campanhas} campanhas somam {CAMPANHA.total.reais} de {CAMPANHA.total.pessoas} pessoas.
          </p>
          <a className={styles.btnGrande} href={LINKS.vakinha} target="_blank" rel="noreferrer">Apoiar agora <i>↗</i></a>
        </R>

        <ol className={styles.tempo}>
          {CAMPANHA.tempo.map((e, k) => (
            <R as="li" key={e.d} atraso={k * 70}>
              <time>{e.d}</time>
              <div>
                <h3>{e.t}</h3>
                <p>{e.x}</p>
                {e.href && <a href={e.href} target="_blank" rel="noreferrer">{e.rot} ↗</a>}
              </div>
            </R>
          ))}
        </ol>

        <R className={styles.pedidos} atraso={120}>
          <h3>como ajudar <em>além de doar</em></h3>
          <ul>
            {CAMPANHA.pedidos.map(([k, v]) => (<li key={k}><b>{k}</b><span>{v}</span></li>))}
          </ul>
          <div className={styles.pix}>
            <small>chave Pix da campanha</small>
            <code>{CAMPANHA.pix}</code>
            <button type="button" className={styles.btnFino} onClick={copiar}>{copiado ? "chave copiada" : "copiar chave"}</button>
          </div>
        </R>
      </div>
      {/* ponte: a criatura laranja desce para LUNAR */}
      <Camada src={corte("laranja")} y={-160} g={9} z={6} l="27vw" b="-17vh" w="clamp(110px, 11vw, 170px)" hide />
    </section>
  );
}

/* ============ 05 LUNAR ============ */
function Lunar() {
  return (
    <section id="lunar" className={`${styles.cena} ${styles.lunar}`} data-cena>
      <Camada src={arte("azul")} y={-120} z={0} l="30vw" t="-6vh" w="70vw" className={styles.lunarCeu} />
      <Camada y={-80} z={1} className={styles.lua}><div /></Camada>
      <div className={styles.lunarFotos}>
        <Camada y={-40} z={2} className={styles.lf1}>
          <Passa limpo ar={null} intervalo={3800} fotos={["lunar-cap", "lunar-alto-1", "lunar-corpo"]} legenda="ensaio · Souto MC" />
        </Camada>
        <Camada y={30} z={3} className={styles.lf2}>
          <Passa limpo ar={null} intervalo={3200} inicio={1} fotos={["lunar-mk-1", "lunar-mk-2", "lunar-mk-3"]} legenda="making of" />
        </Camada>
        <Camada y={-60} z={3} className={styles.lf3}>
          <Passa limpo ar={null} intervalo={3500} fotos={["lunar-alto-2", "lunar-alto-3"]} legenda="ensaio" />
        </Camada>
      </div>
      <div className={styles.lunarTxt}>
        <R as="p" className={styles.etq}>{LUNAR.ano} · ensaio fotográfico</R>
        <R as="h2" className={styles.lunarTitulo}>{LUNAR.titulo}</R>
        <R as="p" className={styles.lunarQuem} atraso={80}>{LUNAR.quem}</R>
        <div className={styles.fases} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (<i key={i} style={{ "--f": Math.abs(4 - i) / 4 }} />))}
        </div>
        <R as="dl" className={styles.ficha} atraso={120}>
          {LUNAR.ficha.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </R>
        <p className={styles.fichaApoio}>{LUNAR.apoio}</p>
        <div className={styles.linksLinha}>
          {LUNAR.links.map(([t, h]) => (<a key={t} className={styles.btnLinhaClara} href={h} target="_blank" rel="noreferrer">{t} ↗</a>))}
        </div>
      </div>
    </section>
  );
}

/* ============ 06 PARENTESES (um projeto dela) ============ */
function Parenteses() {
  return (
    <section id="parenteses" className={`${styles.cena} ${styles.paren}`} data-tom="claro" data-cena>
      <Camada src={corte("alienigena-limpo")} y={-50} g={-3} z={1} r="2vw" t="0.5vh" w="min(16vw, 245px)" hide />
      <div className={styles.parenCab}>
        <R as="p" className={styles.etq}>{PARENTESES.ano} · direção criativa e executiva</R>
        <R as="h2" className={styles.parenTitulo}><span>(</span>PARENTESES<span>)</span></R>
        <R as="p" className={styles.parenFrase} atraso={80}>{PARENTESES.frase}</R>
      </div>
      <div className={styles.parenCorpo}>
        <div className={styles.parenMidia}>
          <Camada y={-60} g={-2} z={2} className={styles.pm1}>
            <Recorte src={arte("cobra")} moldura giro={-3} className={styles.cheio} />
          </Camada>
          <Camada y={80} g={3} z={3} className={styles.pm2}>
            <Recorte src={capa("revista-mao")} rasga={2} giro={4} className={styles.cheio} alt="A revista Parenteses, folheada" />
          </Camada>
        </div>
        <div className={styles.parenDados}>
          <ul className={styles.parenNum}>
            {PARENTESES.numeros.map(([n, t], i) => (<R as="li" key={n} atraso={i * 60}><b>{n}</b><span>{t}</span></R>))}
          </ul>
          <R as="p" className={styles.parenTemas}>{PARENTESES.temas.join(" · ")}</R>
          <R as="dl" className={styles.ficha}>
            {PARENTESES.ficha.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
          </R>
          <p className={styles.fichaApoio}>{PARENTESES.nota}</p>
          <a className={styles.btnLinha} href={LINKS.parenteses} target="_blank" rel="noreferrer">@parentesesrevista ↗</a>
        </div>
      </div>
    </section>
  );
}

/* ============ 07 PRÊMIO ============ */
function Premio() {
  return (
    <section id="premio" className={`${styles.cena} ${styles.premio}`} data-tom="claro" data-cena>
      <div className={styles.premioFotos}>
        <Camada y={-40} z={2} className={styles.premioPassa}>
          <Passa fotos={["premio-1", "premio-2", "premio-3", "premio-4"]} ar="4 / 3" rasga={1} giro={-2} legenda="Vidas Indígenas · 2025" />
        </Camada>
      </div>
      <R className={styles.premioTxt}>
        <p className={styles.etq}>2025 · prêmio Vidas Indígenas, Museu da Pessoa</p>
        <h3>{PREMIO.titulo}</h3>
        <p>{PREMIO.texto}</p>
        <a className={styles.btnLinha} href={LINKS.vidasIndigenas} target="_blank" rel="noreferrer">a exposição Vidas Indígenas ↗</a>
        <div className={styles.registros}>
          <p className={styles.etq}>2024 · 2025 · registros</p>
          <ul>
            {REGISTROS.map(([d, t, x]) => (<li key={t}><time>{d}</time><b>{t}</b><span>{x}</span></li>))}
          </ul>
        </div>
      </R>
    </section>
  );
}

/* ============ 08 CINEMA ============ */
function Cinema() {
  return (
    <section id="cinema" className={`${styles.cena} ${styles.cinema}`} data-tom="claro" data-cena>
      <div className={styles.capCab}>
        <R as="p" className={styles.etq}>2019 · 2025</R>
        <R as="h2" className={styles.capTituloM}>cinema e documentário</R>
      </div>
      <ul className={styles.linhaTempo}>
        {CINEMA.map((c, i) => (
          <R as="li" key={c.t} atraso={(i % 4) * 60}>
            <time>{c.ano}</time>
            <div>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
              {c.href && <a href={c.href} target="_blank" rel="noreferrer">{c.rot} ↗</a>}
            </div>
          </R>
        ))}
      </ul>
      <Camada y={-80} g={-3} z={3} r="clamp(14px, 3vw, 50px)" t="24vh" w="clamp(160px, 18vw, 290px)" hide className={styles.cinemaFoto}>
        <Passa fotos={["bioma-1", "enawene", "naolugar-1", "bioma-2", "naolugar-2", "bioma-3"]} ar="3 / 4" rasga={2} giro={3} legenda="Bioma · Vidas Indígenas · O Não-Lugar" />
      </Camada>
    </section>
  );
}

/* ============ 09 CLIPES ============ */
function Clipes() {
  return (
    <section id="clipes" className={`${styles.cena} ${styles.clipes}`} data-cena>
      <div className={styles.capCabP}>
        <R as="p" className={styles.etq}>2017 · 2024 · mais de 60 videoclipes de rap</R>
        <R as="h2" className={styles.capTituloP}>videoclipe</R>
        <R as="p" className={styles.capLeadP}>
          Direção, direção de fotografia e edição. Passe o mouse nos títulos para ver o trecho; o clipe inteiro está no YouTube.
        </R>
        <a className={styles.btnLinha} href={LINKS.playlistClipes} target="_blank" rel="noreferrer">a playlist completa ↗</a>
      </div>
      <Palco lista={CLIPES} />
    </section>
  );
}

/* ============ 10 HIP HOP (a) ============ */
function HipHop() {
  return (
    <section id="hiphop" className={`${styles.cena} ${styles.hiphop}`} data-tom="claro" data-cena>
      <Camada y={-60} g={-2} z={1} className={styles.hhTituloCam}>
        <h2 className={styles.hhTitulo}>HIP HOP</h2>
      </Camada>
      <Camada y={-120} g={4} z={3} r="3vw" t="clamp(190px, 33vh, 310px)" w="min(30vw, 460px)" wm="62vw" tm="150px">
        <Recorte src={foto("colagem-hh")} rasga={1} giro={3} className={styles.cheio} />
      </Camada>
      <Camada y={50} g={-3} z={4} r="27vw" b="4vh" w="min(15vw, 240px)" hide>
        <Recorte src={foto("hh-capa")} rasga={3} giro={-4} className={styles.cheio} />
      </Camada>
      <div className={styles.hhCorpo}>
        <R as="p" className={styles.hhTexto}>{HIPHOP.texto}</R>
        <ul className={styles.hhJuri}>
          {HIPHOP.juri.map(([a, t]) => (<R as="li" key={t}><b>{a}</b><span>{t}</span></R>))}
        </ul>
      </div>
    </section>
  );
}

/* ============ 11 HIP HOP (b): a parede ============ */
function Parede() {
  const grade = ["p11-0", "p11-1", "p11-2", "p11-3", "p11-4", "p11-5", "p11-6", "p11-7", "p11-8", "p11-9", "p11-10", "p11-11"];
  const speeds = [-170, 90, -60, 150];
  return (
    <section id="parede" className={`${styles.cena} ${styles.parede}`} data-cena>
      <div className={styles.paredeCols}>
        {[0, 1, 2, 3].map((c) => (
          <Camada key={c} y={speeds[c]} z={2} className={styles.paredeCol}>
            {grade.filter((_, i) => i % 4 === c).map((n, k) => (
              <Recorte key={n} src={foto(n)} rasga={((c + k) % 3) + 1} giro={rot(c * 3 + k, 3)} fita={k % 2 === 0} className={styles.cheio} />
            ))}
          </Camada>
        ))}
      </div>
      <div className={styles.paredeTxt}>
        <R as="p" className={styles.etqNeon}>quem passou pela lente</R>
        <R as="p" className={styles.paredeNomes}>{HIPHOP.nomes.join(" · ")}</R>
      </div>
    </section>
  );
}

/* ============ 12 MÚSICA INDÍGENA ============ */
function Musica() {
  const fotos = ["p32-0", "p32-1", "p32-2", "p32-3", "p32-4", "p32-5", "p32-6", "p32-7", "p32-8", "p30-0", "p30-1", "p30-2", "p30-3", "p30-4", "p31-0", "p31-1", "p31-2", "p31-3", "p16-3", "p16-8"];
  const speeds = [-200, 110, -90];
  return (
    <section id="musica" className={`${styles.cena} ${styles.musica}`} data-cena>
      <div className={styles.musicaTxt}>
        <R as="p" className={styles.etq}>2018 · 2022 · fotografia e curadoria</R>
        <R as="h2" className={styles.capTituloM}>música indígena<br />contemporânea</R>
        <R as="p" className={styles.capLeadP}>{MUSICA.texto}</R>
        <div className={styles.linksLinha}>
          <a className={styles.btnGrande} href={LINKS.playlistMusica} target="_blank" rel="noreferrer">ouvir a playlist <i>↗</i></a>
          <a className={styles.btnLinha} href={LINKS.kalamidade} target="_blank" rel="noreferrer">a matéria no Kalamidade ↗</a>
        </div>
        <div className={styles.capas}>
          {MUSICA.capas.map((c, k) => (
            <a key={c.f} href={c.href} target="_blank" rel="noreferrer" title={`${c.t} · ${c.q} · ${c.a}`} style={{ "--rot": `${rot(k, 3)}deg` }}>
              <img src={capa(c.f)} alt={`Capa: ${c.t}, ${c.q}`} loading="lazy" />
              <span><b>{c.t}</b>{c.q} · {c.a}</span>
            </a>
          ))}
        </div>
        <p className={styles.fichaApoio}>Fotografou, entre outros: {MUSICA.fotografados.join(", ")}.</p>
      </div>
      <div className={styles.musicaCols}>
        {[0, 1, 2].map((c) => (
          <Camada key={c} y={speeds[c]} z={2} className={styles.musicaCol}>
            {fotos.filter((_, i) => i % 3 === c).map((n, k) => (
              <Recorte key={n} src={foto(n)} rasga={((c + k) % 3) + 1} giro={rot(c * 7 + k, 2)} fita={k % 2 === 0} className={styles.cheio} />
            ))}
          </Camada>
        ))}
      </div>
    </section>
  );
}

/* ============ 13 O TRAÇO: a mesa dos desenhos, em grade (sem sobreposição) ============ */
function Traco() {
  // [coluna, linha, y do parallax, giro, tipo]: tipo "c" = recorte solto, "p" = impressão com moldura
  const itens = [
    ["1 / 4", "1 / 4", -26, -2, "c", corte("onca")],
    ["4 / 6", "1 / 4", 22, 2, "p", arte("alienigena")],
    ["6 / 8", "1 / 4", -22, -2, "p", arte("passaros-linha")],
    ["8 / 12", "1 / 4", 26, 2, "p", arte("padrao-vermelho")],
    ["1 / 5", "4 / 7", 24, -1, "c", corte("rostos-verdes")],
    ["5 / 7", "4 / 7", -22, 2, "p", arte("pindorama")],
    ["7 / 10", "4 / 7", 26, -2, "p", arte("colagem-laranja")],
    ["10 / 12", "4 / 7", -24, 2, "p", arte("azul")],
    ["1 / 3", "7 / 10", 22, 2, "c", corte("laranja")],
    ["3 / 5", "7 / 10", -22, -2, "c", corte("mascara")],
    ["5 / 7", "7 / 10", 24, 2, "c", corte("pula-corda")],
    ["7 / 9", "7 / 10", -20, -2, "p", arte("colagem-cor")],
    ["9 / 12", "7 / 10", 22, 2, "p", arte("cobra")],
  ];
  return (
    <section id="desenho" className={`${styles.cena} ${styles.traco}`} data-tom="claro" data-cena>
      <Camada y={-30} z={0} className={styles.tracoTitulo}>
        <h2>o traço</h2>
      </Camada>
      <div className={styles.tracoLead}>
        <R as="p" className={styles.etq}>desenho, colagem e capa</R>
        <R as="p" className={styles.capLeadP}>
          Para além do audiovisual, o desenho, a colagem e o texto são plataformas. Aqui o lápis não é de edição: é de criar.
        </R>
      </div>
      <div className={styles.tg}>
        {itens.map(([col, lin, y, g, tipo, src]) => (
          <div key={src} className={styles.ti} style={{ gridColumn: col, gridRow: lin }}>
            <Camada rel y={y} g={g} z={3}>
              {tipo === "c" ? <img src={src} alt="" loading="lazy" decoding="async" /> : <Recorte src={src} moldura giro={g} className={styles.cheio} />}
            </Camada>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ 14 TEXTO / MESAS / COLETIVOS ============ */
function Texto() {
  return (
    <section id="texto" className={`${styles.cena} ${styles.texto}`} data-tom="claro" data-cena>
      <div className={styles.textoCol}>
        <R as="p" className={styles.etq}>texto e pesquisa</R>
        <ul className={styles.textos}>
          {TEXTOS.map((t) => (
            <R as="li" key={t.t}>
              <time>{t.ano}</time>
              <div>
                <h3>{t.href ? <a href={t.href} target="_blank" rel="noreferrer">{t.t} ↗</a> : t.t}</h3>
                <p>{t.d}</p>
                {t.alt && <a className={styles.mini} href={t.alt.href} target="_blank" rel="noreferrer">{t.alt.rot} ↗</a>}
              </div>
            </R>
          ))}
        </ul>
      </div>
      <div className={styles.textoCol}>
        <R as="p" className={styles.etq}>mesas de conversa</R>
        <ul className={styles.textos}>
          {MESAS.map(([a, t, x]) => (
            <R as="li" key={a + t}>
              <time>{a}</time>
              <div><h3>{t}</h3><p>{x}</p></div>
            </R>
          ))}
        </ul>
      </div>
      <div className={styles.textoCol}>
        <R as="p" className={styles.etq}>coletivos</R>
        <ul className={styles.textos}>
          {COLETIVOS.map((c) => (
            <R as="li" key={c.t}>
              <time>·</time>
              <div>
                <h3>{c.href ? <a href={c.href} target="_blank" rel="noreferrer">{c.t} ↗</a> : c.t}</h3>
                <p>{c.d}</p>
              </div>
            </R>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============ 15 JODO (a): os primeiros clipes ============ */
function Jodo() {
  return (
    <section id="jodo" className={`${styles.cena} ${styles.jodo}`} data-cena>
      <div className={styles.capCabP}>
        <R as="p" className={styles.etqNeon}>2017 · 2019 · de onde a JODO saiu</R>
        <R as="h2" className={styles.capTituloP}>nos primeiros clipes da JODO</R>
        <R as="p" className={styles.capLeadP}>
          Antes dos prêmios, do mestrado e da revista, Isa estava entre as pessoas que montaram a JODO: edição, direção, câmera e cor, junto com Joaquim Macruz.
          {" "}<span className={styles.mao}>o primeiro trampo é o do topo da lista</span>
        </R>
      </div>
      <Palco lista={JODO} />
    </section>
  );
}

/* ============ 16 JODO (b): o Vimeo ============ */
function VimeoCena() {
  // capa em tamanho maior, discreta, perto do mouse (só onde existe mouse)
  const [prev, setPrev] = useState(null);
  const mostra = (id) => (e) => setPrev({ id, x: e.clientX, y: e.clientY });
  const move = (e) => setPrev((p) => (p ? { ...p, x: e.clientX, y: e.clientY } : p));
  const some = () => setPrev(null);
  return (
    <section id="vimeo" className={`${styles.cena} ${styles.vimeo}`} data-cena>
      <div className={styles.vimeoCab}>
        <R as="p" className={styles.etqNeon}>2019 · canal no Vimeo · {VIMEO.total} vídeos</R>
        <R as="h2" className={styles.vimeoTitulo}>{VIMEO.nome}</R>
        <R as="p" className={styles.vimeoTxt} atraso={80}>{VIMEO.serie}</R>
        <div className={styles.eps}>
          <span>Vivência Chaves</span>
          {VIMEO.eps.map(([n, id]) => (
            <a key={id} href={LINKS.vimeoItem(id)} target="_blank" rel="noreferrer" onMouseEnter={mostra(id)} onMouseMove={move} onMouseLeave={some}>EP{n}</a>
          ))}
        </div>
        <a className={styles.btnNeon} href={LINKS.vimeo} target="_blank" rel="noreferrer">abrir o canal no Vimeo <i>↗</i></a>
      </div>
      <ul className={styles.vimeoLista}>
        {VIMEO.itens.map((v, k) => (
          <R as="li" key={v.id} atraso={(k % 4) * 50}>
            <a href={LINKS.vimeoItem(v.id)} target="_blank" rel="noreferrer" onMouseEnter={mostra(v.id)} onMouseMove={move} onMouseLeave={some}>
              <span className={styles.vn}>{String(k + 1).padStart(2, "0")}</span>
              <span className={styles.vt}>{v.t}<small>{v.x}</small></span>
              <span className={styles.vd}>{v.d}<small>{v.m}</small></span>
            </a>
          </R>
        ))}
      </ul>
      <img
        className={`${styles.vimeoPrev} ${prev ? styles.vimeoPrevOn : ""}`}
        src={prev ? capa(`vimeo/${prev.id}`) : undefined}
        alt=""
        style={prev ? { left: Math.min(prev.x + 26, innerWidth - 190), top: Math.max(16, Math.min(prev.y - 120, innerHeight - 260)) } : undefined}
      />
    </section>
  );
}

/* ============ 17 ORIGEM ============ */
function Origem() {
  return (
    <section id="origem" className={`${styles.cena} ${styles.origem}`} data-tom="claro" data-cena>
            <Camada src={corte("passaros-tinta")} y={-110} g={-4} z={1} r="4vw" b="-6vh" w="clamp(150px, 18vw, 290px)" hide className={styles.passarosOrigem} />
      <div className={styles.origemFoto}>
        <Camada y={-50} g={-2} z={2} className={styles.of1c}>
          <Recorte src={foto("ret-cor")} rasga={3} giro={-3} className={styles.cheio} />
        </Camada>
      </div>
      <div className={styles.origemTxt}>
        <R as="p" className={styles.etq}>2010 · o começo</R>
        <R as="p" className={styles.origemFrase}>
          Ainda criança, já sabia que seria artista. Na adolescência, emprestava câmeras de amigas da escola para fotografar mulheres, buscando construir imagens que afirmassem dignidade, sensibilidade e autoestima, inclusive as mulheres da própria família.
        </R>
        <R as="p" className={styles.origemMini} atraso={100}>
          Formade em Cinema pelo ProUni, com bolsa integral, em 2018. Autodidata. Desde 2010 constrói imagens friccionando barreiras sociais.
        </R>
      </div>
    </section>
  );
}

/* ============ 18 CONTATO ============ */
function Contato() {
  return (
    <section id="contato" className={`${styles.cena} ${styles.contato}`} data-tom="claro" data-cena>
      <Camada src={corte("onca")} y={-160} g={-5} z={1} r="1vw" b="-5vh" w="clamp(190px, 29vw, 460px)" wm="36vw" rm="2vw" bm="1vh" />
      <Camada y={90} g={4} z={1} r="2.5vw" t="11vh" w="min(14vw, 215px)" hide>
        <Recorte src={arte("colagem-laranja")} moldura giro={5} className={styles.cheio} />
      </Camada>
      <R as="h2" className={styles.contatoTitulo}>fecha<br />comigo?</R>
      <R as="p" className={styles.contatoLead} atraso={80}>Para trabalhar com Isa, ou para ajudar a chegar em Cuba.</R>
      <R className={styles.contatoLinks} atraso={140}>
        <a className={styles.btnGrande} href={LINKS.vakinha} target="_blank" rel="noreferrer">Apoiar a ida a Cuba <i>↗</i></a>
        <a className={styles.btnFino} href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
        <a className={styles.btnFino} href={LINKS.ig} target="_blank" rel="noreferrer">@isakatupyryb</a>
        <a className={styles.btnFino} href={LINKS.linktree} target="_blank" rel="noreferrer">linktr.ee/isakatupyryb</a>
        <a className={styles.btnFino} href={LINKS.portfolio} target="_blank" rel="noreferrer">portfólio em PDF</a>
      </R>
      <p className={styles.rodape}>São Paulo, SP · Página feita pela JODO.</p>
    </section>
  );
}

export default function IsaFolha() {
  const [marca, setMarca] = useState("#141413");
  const raiz = useRef(null);

  // a marca da JODO no topo escurece sobre as seções claras
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      let tom = "escuro";
      for (const el of document.elementsFromPoint(innerWidth / 2, 36)) {
        const s = el.closest && el.closest("[data-tom]");
        if (s) { tom = s.dataset.tom; break; }
      }
      setMarca(tom === "claro" ? "#141413" : "#ece9e2");
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => { removeEventListener("scroll", on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // o layout global usa overflow-x: hidden em html e body, o que quebra o position: sticky da declaração; aqui vira clip (também corta, mas não cria rolagem)
  useEffect(() => {
    const els = [document.documentElement, document.body];
    const antes = els.map((e) => e.style.overflowX);
    const snapAntes = document.documentElement.style.scrollSnapType;
    els.forEach((e) => { e.style.overflowX = "clip"; });
    // "proximity": encaixa a sessão na tela quando a rolagem para perto do início dela; sessões mais altas que a tela continuam rolando livres
    document.documentElement.style.scrollSnapType = "y proximity";
    return () => {
      els.forEach((e, i) => { e.style.overflowX = antes[i]; });
      document.documentElement.style.scrollSnapType = snapAntes;
    };
  }, []);

  // parallax: cada sessão visível move suas camadas por transform direto (sem variável herdada, bem mais leve)
  useEffect(() => {
    const cenas = [...raiz.current.querySelectorAll("[data-cena]")];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const itens = new Map(cenas.map((c) => [c, [...c.querySelectorAll("[data-par]")].map((el) => ({ el, gi: el.firstElementChild, y: +el.dataset.y, x: +el.dataset.x, a: +el.dataset.g, r: +el.dataset.giro, z: +el.dataset.z }))]));
    const fundos = new Map(cenas.map((c) => [c, [...c.querySelectorAll("[data-bgy]")]]));
    const visiveis = new Set();
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target))),
      { rootMargin: "30% 0px 30% 0px" }
    );
    cenas.forEach((c) => io.observe(c));
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = innerHeight;
      const k0 = innerWidth <= 860 ? 0.45 : 1;
      visiveis.forEach((c) => {
        const r = c.getBoundingClientRect();
        const p = -Math.max(-1.3, Math.min(1.3, (r.top + r.height / 2 - vh / 2) / (r.height / 2 + vh / 2)));
        const lista = itens.get(c);
        // primeiro lê todas as posições, depois escreve (evita recalcular o layout a cada peça)
        const ops = lista.map((it) => {
          if (it.z >= 6) return 1; // as pontes atravessam a borda e ficam inteiras
          const r2 = it.el.getBoundingClientRect();
          if (r2.height > vh * 0.5) return 1; // peças altas (colunas de fotos) não esmaecem: o centro delas fica longe da borda da tela
          const d = Math.min((r2.top + r2.bottom) / 2, vh - (r2.top + r2.bottom) / 2); // distância do centro da peça até a borda da tela
          return Math.max(0.12, Math.min(1, d / (vh * 0.2)));
        });
        lista.forEach((it, k) => {
          it.el.style.transform = `translate3d(${(p * it.x * k0).toFixed(1)}px, ${(p * it.y * k0).toFixed(1)}px, 0)`;
          if (it.a && it.gi) it.gi.style.transform = `rotate(${(it.r + p * it.a).toFixed(2)}deg)`;
          it.el.style.opacity = ops[k].toFixed(2); // as peças surgem e somem nas bordas da tela, junto com a rolagem
        });
        fundos.get(c).forEach((el) => { el.style.backgroundPositionY = k0 < 1 ? "center" : `${(+el.dataset.bgbase + p * +el.dataset.bgy).toFixed(1)}px`; });
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { io.disconnect(); removeEventListener("scroll", on); removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // na última sessão (contato) o botão "Apoie" do canto vira o botão de voltar ao topo
  const [fim, setFim] = useState(false);
  useEffect(() => {
    const el = document.getElementById("contato");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setFim(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // botão de subir aparece depois da primeira tela
  const [topo, setTopo] = useState(false);
  useEffect(() => {
    const on = () => setTopo(scrollY > innerHeight * 1.2);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <main ref={raiz} className={styles.raiz}>
      <VoltarJodo />
      <MarcaTopo nome="ISA KATUPYRYB" cor={marca} fonte='"InstrumentSerif", serif' escala={1.3} />
      {fim ? (
        <button type="button" className={`${styles.chip} ${styles.chipTopo}`} onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>↑ Voltar ao topo</button>
      ) : (
        <a className={styles.chip} href="#cuba"><i /> Apoie a ida a Cuba</a>
      )}
      <button type="button" className={`${styles.topoFixo} ${topo && !fim ? styles.topoOn : ""}`} onClick={() => scrollTo({ top: 0, behavior: "smooth" })} aria-label="Voltar ao topo">↑</button>

      <Capa />
      <Declaracao />
      <Cuba />
      <Campanha />
      <Lunar />
      <Parenteses />
      <Premio />
      <Cinema />
      <Clipes />
      <HipHop />
      <Parede />
      <Musica />
      <Traco />
      <Texto />
      <Jodo />
      <VimeoCena />
      <Origem />
      <Contato />
    </main>
  );
}
