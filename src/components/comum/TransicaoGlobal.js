"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import TransicaoSaida from "@/components/mundo/TransicaoSaida";

/*
  Fica no layout (não some quando a página troca). O mapa dispara o evento "jodo:transicao" com { x, y, cor, tipo };
  a animação roda por cima do mapa, continua cobrindo a tela enquanto a página nova abre e então se desfaz em fade
  (sem corte seco). Se a página não trocar em 5 s, também se desfaz.
*/
export default function TransicaoGlobal() {
  const [s, setS] = useState(null);
  const [fade, setFade] = useState(false);
  const path = usePathname();
  const ini = useRef(null);

  useEffect(() => {
    const on = (e) => {
      setFade(false);
      ini.current = window.location.pathname;
      setS({ ...e.detail, id: Date.now() });
    };
    window.addEventListener("jodo:transicao", on);
    return () => window.removeEventListener("jodo:transicao", on);
  }, []);

  useEffect(() => {
    if (!s || path === ini.current) return;
    const t1 = setTimeout(() => setFade(true), 450);
    const t2 = setTimeout(() => setS(null), 450 + 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [path, s]);

  useEffect(() => {
    if (!s) return;
    const t1 = setTimeout(() => setFade(true), 5000);
    const t2 = setTimeout(() => setS(null), 5900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [s]);

  if (!s) return null;
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", opacity: fade ? 0 : 1, transition: "opacity 0.85s ease" }}>
      <TransicaoSaida key={s.id} x={s.x} y={s.y} cor={s.cor} tipo={s.tipo} />
    </div>
  );
}
