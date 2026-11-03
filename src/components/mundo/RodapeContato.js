"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/rodapeContato.module.css";

/*
  Rodapé discreto: contato da JODO e "Políticas e termos" (janela com o texto).
  O texto é um rascunho honesto do que o site faz hoje; revisar com um advogado antes de abrir contas de usuários.
*/
const EMAIL = "contatojodo@gmail.com";
const ICONES = {
  Instagram: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  YouTube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  Contato: "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z",
};
const LINKS = [
  { rotulo: "Instagram", titulo: "Instagram da JODO", href: "https://www.instagram.com/_jodo/" },
  { rotulo: "YouTube", titulo: "YouTube da JODO", href: "https://www.youtube.com/@JODOJODOJODO" },
  { rotulo: "Contato", titulo: `E-mail: ${EMAIL}`, href: `mailto:${EMAIL}` },
];

export default function RodapeContato({ extra = null, escondido = false }) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const fecha = (e) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fecha);
    return () => window.removeEventListener("keydown", fecha);
  }, [aberto]);

  return (
    <>
      <nav className={styles.rodape} aria-label="Contato e políticas">
        {extra}
        <span className={`${styles.links} ${escondido ? styles.linksOcultos : ""}`}>
        {LINKS.map((l) => (
          <a
            key={l.rotulo}
            className={styles.icone}
            data-marca={l.rotulo}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={l.titulo}
            title={l.titulo}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d={ICONES[l.rotulo]} fill="currentColor" />
            </svg>
          </a>
        ))}
      </span>
      </nav>
      <button className={`${styles.politicas} ${escondido ? styles.linksOcultos : ""}`} onClick={() => setAberto(true)}>Políticas e termos</button>

      <div className={`${styles.fundo} ${aberto ? styles.fundoAberto : ""}`} onClick={() => setAberto(false)} aria-hidden={!aberto}>
        <section className={styles.folha} role="dialog" aria-label="Políticas e termos" onClick={(e) => e.stopPropagation()}>
          <button className={styles.fechar} onClick={() => setAberto(false)} tabIndex={aberto ? 0 : -1}>
            Fechar
          </button>
          <h2>Políticas e termos</h2>

          <h3>O que é este site</h3>
          <p>
            A JODO é um coletivo e selo independente de vídeo e música. Este site mostra artistas, o acervo de
            trabalhos e textos da JODO, e ainda está em construção.
          </p>

          <h3>Sua página, sua decisão</h3>
          <p>
            Cada página de artista é feita com a combinação e a autorização do artista. <strong>Qualquer artista pode pedir
            para alterar ou apagar a própria página, ou qualquer trabalho seu do acervo, quando quiser, sem custo e sem
            precisar explicar o motivo.</strong> Basta escrever para{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ou chamar no Instagram{" "}
            <a href="https://www.instagram.com/_jodo/" target="_blank" rel="noopener noreferrer">@_jodo</a>. Atendemos o
            pedido o quanto antes.
          </p>

          <h3>Créditos e direitos</h3>
          <p>
            As músicas, vídeos, fotos e artes pertencem aos seus autores; a JODO apresenta e dá o crédito. Os vídeos do
            acervo ficam no YouTube e são mostrados por incorporação. Se algum crédito estiver errado ou faltando, avise e
            corrigimos. A montanha do logo é uma arte criada por Guilherme Valério.
          </p>

          <h3>Dados e privacidade</h3>
          <p>
            O site não pede cadastro. Usamos o Google Analytics e o Google Tag Manager para medir as visitas de forma
            agregada, o que pode envolver cookies. O mapa é carregado de servidores externos (OpenFreeMap, com dados do
            OpenStreetMap) e, ao tocar em um vídeo, o YouTube pode registrar o acesso conforme a política dele. Não vendemos
            dados. Para pedir informações ou a exclusão de dados pessoais, escreva para o e-mail acima.
          </p>

          <h3>Lugares no mapa</h3>
          <p>
            Os pontos do mapa são aproximados. Não publicamos endereço de moradia; endereços de casas e eventos só aparecem
            com autorização de quem organiza.
          </p>

          <h3>Mudanças</h3>
          <p>Podemos atualizar estes termos. Última revisão: 20/10/2026.</p>
        </section>
      </div>
    </>
  );
}
