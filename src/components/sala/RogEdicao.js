"use client";

import { useEffect, useRef, useState } from "react";
import { Instrument_Serif, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LINKS } from "@/data/rogdog";
import { TIPOS, ABERTURA, FOTOS } from "@/data/rogEdicao";
import styles from "@/styles/rogEdicao.module.css";

/*
  Rog: "Mesa de edição". Um único palco fixo com um monitor cujo ENQUADRAMENTO muda conforme o tipo de trabalho
  (videoclipe 16:9, publicidade 9:16, institucional 4:3, documentário 2.39:1, RogDog 1:1). Ao lado, instrumentos de
  resumo do tipo (números reais dos dados) e papéis do trabalho em foco; o controle
  "bruto / finalizado" muda a imagem e os instrumentos juntos. A cor da página vem do quadro. Embaixo, a linha do tempo
  do tipo atual. A rolagem troca de tipo; a JODO aparece dentro dos tipos.
  Cenas: 0 abertura · 1..5 tipos · 6 contato.
*/

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--rg-serif", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--rg-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--rg-mono", display: "swap" });

const N = TIPOS.length + 2;
const MENU = [...TIPOS.map((t, i) => [i + 1, t.nome]), [N - 1, "Contato"]];
const semFaixa = (e) => { const t = e.target; if (t.src.includes("maxresdefault")) t.src = t.src.replace("maxresdefault", "mqdefault"); };
const num = (n) => String(n).padStart(2, "0");

const SERVICOS = [["Direção", /dire[cç][aã]o/i], ["Fotografia", /fotografia|imagens/i], ["Edição", /edi[cç][aã]o/i], ["Finalização", /finaliza[cç][aã]o|color/i]];
const seg = (d) => (d ? d.split(":").reduce((a, v) => a * 60 + (+v || 0), 0) : 0);

export default function RogEdicao() {
  const [cena, setCena] = useState(0);
  const [sel, setSel] = useState(TIPOS.map(() => 0));
  const [aberto, setAberto] = useState(null);
  const [ab, setAb] = useState(0);
  const [estreito, setEstreito] = useState(false);
  const [cor, setCor] = useState([60, 60, 70]);
  const rolo = useRef(null);
  const palco = useRef(null);
  const area = useRef(null);
  const moldura = useRef(null);
  const trilho = useRef(null);
  const px = useRef(null);

  const tipoI = cena >= 1 && cena <= TIPOS.length ? cena - 1 : -1;
  const tipo = tipoI >= 0 ? TIPOS[tipoI] : null;
  const item = tipo ? tipo.itens[Math.min(sel[tipoI], tipo.itens.length - 1)] : null;
  const foto = FOTOS[ab % FOTOS.length];
  const imgAtual = item ? item.img : cena === 0 ? foto.img : ABERTURA[(ab + 3) % ABERTURA.length];
  const ratio = item ? item.ratio : cena === 0 && estreito ? 1 : 16 / 9; // fotos da abertura: 16:9 no computador, quadradas no celular (object-position em FOTOS)

  // mesmo ponto de corte do CSS (820px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const f = () => setEstreito(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  // abertura: quadros trocam sozinhos
  useEffect(() => {
    const reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz) return;
    const t = setInterval(() => setAb((v) => (v + 1) % 24), 3600); // 24 = múltiplo de 3 fotos e dos 8 quadros do contato
    return () => clearInterval(t);
  }, []);

  // rolagem → cena atual e parallax (--p)
  useEffect(() => {
    const el = rolo.current;
    if (!el) return;
    let raf = 0;
    const atualizar = () => {
      raf = 0;
      const t = el.scrollTop / el.clientHeight;
      if (palco.current) palco.current.style.setProperty("--p", (t - Math.round(t)).toFixed(3));
      setCena(Math.max(0, Math.min(N - 1, Math.round(t))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(atualizar); };
    atualizar();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const ir = (i) => { if (rolo.current) rolo.current.scrollTo({ top: i * rolo.current.clientHeight, behavior: "smooth" }); };

  // o enquadramento: calcula largura e altura da moldura para o formato da cena (transição por CSS)
  useEffect(() => {
    const medir = () => {
      const a = area.current, m = moldura.current;
      if (!a || !m) return;
      const cw = a.clientWidth, ch = a.clientHeight;
      const w = Math.min(cw, ch * ratio);
      m.style.width = `${Math.round(w)}px`;
      m.style.height = `${Math.round(w / ratio)}px`;
    };
    medir();
    window.addEventListener("resize", medir);
    // a área muda de altura quando o texto ao lado quebra em mais linhas (celular): remede para a moldura não passar por cima dele
    const ro = typeof ResizeObserver !== "undefined" && area.current ? new ResizeObserver(medir) : null;
    if (ro) ro.observe(area.current);
    return () => { window.removeEventListener("resize", medir); if (ro) ro.disconnect(); };
  }, [ratio]);

  // cor da página: média do quadro em foco (se o navegador não deixar ler, mantém a cor anterior)
  useEffect(() => {
    let vivo = true;
    const im = new Image();
    if (!imgAtual.startsWith("/")) im.crossOrigin = "anonymous";
    im.onload = () => {
      if (!vivo) return;
      try {
        const W = 32, H = 18;
        const c = px.current || (px.current = document.createElement("canvas"));
        c.width = W; c.height = H;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(im, 0, 0, W, H);
        const d = x.getImageData(0, 0, W, H).data;
        let sr = 0, sg = 0, sb = 0;
        for (let i = 0; i < d.length; i += 4) { sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; }
        const nn = W * H;
        setCor([Math.round(sr / nn), Math.round(sg / nn), Math.round(sb / nn)]);
      } catch (e) { /* mantém a cor */ }
    };
    im.onerror = () => {
      if (vivo && im.src.includes("maxresdefault")) im.src = im.src.replace("maxresdefault", "mqdefault");
    };
    im.src = imgAtual;
    return () => { vivo = false; };
  }, [imgAtual]);

  // linha do tempo: leva o item selecionado para o centro
  useEffect(() => {
    const t = trilho.current;
    if (!t || tipoI < 0) return;
    // escolha feita com o mouse não recentraliza: a linha andando sob o cursor trocava o clipe sozinho
    if (semCentrar.current) { semCentrar.current = false; return; }
    const el = t.querySelector('[data-on="1"]');
    if (el) t.scrollTo({ left: el.offsetLeft - t.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [tipoI, sel]);

  const semCentrar = useRef(false);
  const escolher = (i) => setSel((s) => s.map((v, k) => (k === tipoI ? i : v)));

  // teclado
  useEffect(() => {
    const k = (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (aberto) {
        if (e.key === "Escape") setAberto(null);
        return;
      }
      if (["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey)) { e.preventDefault(); ir(Math.min(N - 1, cena + 1)); }
      else if (["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) { e.preventDefault(); ir(Math.max(0, cena - 1)); }
      else if (tipo && e.key === "ArrowRight") escolher(Math.min(tipo.itens.length - 1, sel[tipoI] + 1));
      else if (tipo && e.key === "ArrowLeft") escolher(Math.max(0, sel[tipoI] - 1));
      else if (tipo && e.key === "Enter") setAberto(item);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const [r, gg, b] = cor;
  const estilo = { "--ac": `rgb(${r},${gg},${b})`, "--ac2": `rgba(${r},${gg},${b},0.34)` };
  const total = tipo ? tipo.itens.length : 0;
  const minutos = tipo ? Math.round(tipo.itens.reduce((a, x) => a + seg(x.d), 0) / 60) : 0;
  const comAno = tipo ? tipo.itens.filter((x) => x.ano) : [];
  const anos = tipo ? [Math.min(...comAno.map((x) => x.ano)), Math.max(...comAno.map((x) => x.ano))] : null;

  return (
    <div className={`${styles.pagina} ${serif.variable} ${sans.variable} ${mono.variable}`} style={estilo}>
      <VoltarJodo />
      <MarcaTopo nome="Rog" cor="#efece6" aoSubir={() => ir(0)} />

      <nav className={styles.menu} aria-label="Tipos de trabalho">
        {MENU.map(([i, rot]) => (
          <button key={i} className={cena === i ? styles.menuOn : ""} onClick={() => ir(i)} aria-current={cena === i ? "true" : undefined}>{rot}</button>
        ))}
      </nav>

      <div ref={rolo} className={styles.rolo} style={aberto ? { overflow: "hidden" } : undefined}>
        <div ref={palco} className={`${styles.palco} ${cena === 0 ? styles.cAbertura : cena === N - 1 ? styles.cContato : styles.cTipo}`}>
          <div className={styles.luz} aria-hidden="true" />

          {/* texto de cada cena */}
          <div className={styles.esq}>
            {cena === 0 && (
              <div className={styles.abertura} key="a">
                <h1 className={styles.nome}><span>Rogério</span><span>Soares</span></h1>
                <p className={styles.linha}>Eu dirijo, filmo e <em>edito</em>.</p>
                <p className={styles.sub}>Videomaker em Lisboa · trabalhos desde 2015</p>
                <button className={styles.descer} onClick={() => ir(1)}>Ver o trabalho <i aria-hidden="true">↓</i></button>
              </div>
            )}
            {tipo && (
              <div className={styles.tipoTexto} key={tipo.id}>
                <p className={styles.idx}>{num(tipoI + 1)} / {num(TIPOS.length)}</p>
                <h2 className={styles.tipoNome}>{tipo.nome}</h2>
                {item && (
                  <div className={styles.ficha} key={item.id}>
                    <h3>{item.t}</h3>
                    <p>{[item.ano, item.d].filter(Boolean).join(" · ")}</p>
                    {item.papel && <p className={styles.papel}>{item.papel}</p>}
                  </div>
                )}
              </div>
            )}
            {cena === N - 1 && (
              <div className={styles.contato} key="c">
                <h2><span>Qual é o</span> <span>próximo <i>vídeo</i>?</span></h2>
                <div className={styles.contatoLinks}>
                  <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram <span>chame no direct ↗</span></a>
                  <a href={LINKS.vimeo} target="_blank" rel="noopener noreferrer">Vimeo <span>os trabalhos completos ↗</span></a>
                </div>
                <p className={styles.pe}>Rogério Soares · Lisboa · Página feita pela JODO</p>
              </div>
            )}
          </div>

          {/* o monitor */}
          <div ref={area} className={styles.area}>
            <div ref={moldura} className={styles.moldura}>
              {[imgAtual].map((s) => (
                <img key={s} src={s} alt="" onError={semFaixa} className={styles.quadro} style={cena === 0 && !item ? { objectPosition: estreito ? foto.posM : foto.pos } : undefined} />
              ))}
              {item && <button className={styles.assistir} onClick={() => setAberto(item)} aria-label={`Assistir ${item.t}`}><i aria-hidden="true">▶</i> Assistir</button>}
            </div>
          </div>

          {/* painel do tipo */}
          <aside className={styles.dir} aria-label="Resumo do tipo">
            {tipo && (
              <>
                <p className={styles.rotulo}>Neste tipo</p>
                <dl className={styles.numeros}>
                  <div><dt>{total}</dt><dd>{total === 1 ? "trabalho" : "trabalhos"}</dd></div>
                  <div><dt>{anos[1] - anos[0] + 1}</dt><dd>{anos[1] - anos[0] + 1 === 1 ? "ano" : "anos"} neste tipo</dd></div>
                  <div><dt>{minutos}</dt><dd>min de vídeo</dd></div>
                </dl>
                {item && item.papel && (
                  <>
                    <p className={styles.rotulo}>Neste trabalho</p>
                    <ul className={styles.servicos}>
                      {SERVICOS.map(([nome, re]) => (
                        <li key={nome} className={re.test(item.papel) ? styles.servicoOn : ""}><i aria-hidden="true" />{nome}</li>
                      ))}
                    </ul>
                  </>
                )}
                <a className={styles.chamar} href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Chamar para um trabalho <i aria-hidden="true">↗</i></a>
              </>
            )}
          </aside>

          {/* linha do tempo */}
          {tipo && (
            <div className={styles.linhaTempo}>
              <div className={styles.regua}><span>{anos[0]}</span><span>{anos[1]}</span></div>
              <div ref={trilho} className={styles.trilhoClips}>
                {tipo.itens.map((x, i) => (
                  <button
                    key={x.id}
                    data-on={i === sel[tipoI] ? "1" : "0"}
                    className={`${styles.clipe} ${i === sel[tipoI] ? styles.clipeOn : ""}`}
                    onPointerEnter={(e) => { if (e.pointerType === "mouse") { semCentrar.current = i !== sel[tipoI]; escolher(i); } }}
                    onFocus={() => { semCentrar.current = i !== sel[tipoI]; escolher(i); }}
                    onClick={() => { if (i === sel[tipoI]) setAberto(x); else { semCentrar.current = true; escolher(i); } }}
                    aria-label={x.t}
                    title={x.t}
                  >
                    <img src={x.img} alt="" loading="lazy" onError={semFaixa} />
                    <span>{x.ano || ""}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={styles.agulha} aria-hidden="true" />
        </div>
        <div className={styles.trilha} aria-hidden="true">{Array.from({ length: N }).map((_, i) => <div key={i} className={styles.marcador} />)}</div>
      </div>

      {aberto && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label={aberto.t} onClick={() => setAberto(null)}>
          <div className={styles.modalInterno} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTopo}>
              <div>
                <h3>{aberto.t}</h3>
                <p>{[aberto.ano, aberto.d, aberto.papel].filter(Boolean).join(" · ")}</p>
              </div>
              <button onClick={() => setAberto(null)} aria-label="Fechar">Fechar ✕</button>
            </div>
            <div className={styles.player}>
              <iframe
                key={aberto.id}
                src={aberto.vimeo ? `https://player.vimeo.com/video/${aberto.vimeo}?autoplay=1&dnt=1&title=0&byline=0&portrait=0` : `https://www.youtube-nocookie.com/embed/${aberto.yt}?autoplay=1&rel=0`}
                title={aberto.t}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.modalBase}>
              <a href={aberto.vimeo ? `https://vimeo.com/${aberto.vimeo}` : `https://www.youtube.com/watch?v=${aberto.yt}`} target="_blank" rel="noopener noreferrer">Ver no {aberto.vimeo ? "Vimeo" : "YouTube"} ↗</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
