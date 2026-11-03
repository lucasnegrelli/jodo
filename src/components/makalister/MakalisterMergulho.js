"use client";
// Makalister · mergulho nas capas. As capas dos discos flutuam no escuro; a rolagem voa por entre elas e clicar numa capa é ENTRAR nela:
// a câmera atravessa a imagem e ela vira o mundo do disco (mundos.js). Cada disco tem a própria brisa; só o mergulho é comum.
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Inter_Tight, Reenie_Beanie, Bowlby_One, Special_Elite, JetBrains_Mono } from "next/font/google";
import MarcaTopo from "@/components/comum/MarcaTopo";
import VoltarJodo from "@/components/comum/VoltarJodo";
import { LANCAMENTOS } from "@/data/makalisterLancamentos";
import { MUNDOS, MundoGenerico, TEMA_CLARO } from "./mundos";
import s from "@/styles/makalisterMergulho.module.css";

const ui = Inter_Tight({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--mk-ui" });
const mao = Reenie_Beanie({ subsets: ["latin"], weight: "400", variable: "--mk-mao" });
const grosso = Bowlby_One({ subsets: ["latin"], weight: "400", variable: "--mk-grosso" });
const maquina = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--mk-maquina" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--mk-mono" });

const DISCOS = LANCAMENTOS.filter((l) => l.faixas.length > 0); // do mais novo ao mais velho
const PASSO = 2.7; // distância entre capas, em profundidade

// onde cada capa flutua: uma espiral frouxa que desce o túnel
const lugar = (i) => { const a = i * 2.39996, r = 1.7 + (i % 3) * 0.75; return { x: Math.cos(a) * r * 1.25, y: Math.sin(a) * r * 0.62, z: -i * PASSO }; };

export default function MakalisterMergulho() {
  const raiz = useRef(null), cv = useRef(null), dica = useRef(null), tip = useRef(null), cont = useRef(null);
  const api = useRef({ entra: () => {}, sai: () => {} });
  const [mundo, setMundo] = useState(null); // { i, on }
  const [claro, setClaro] = useState(false);

  const abre = useCallback((i) => { setMundo({ i, on: false }); requestAnimationFrame(() => requestAnimationFrame(() => setMundo({ i, on: true }))); setClaro(TEMA_CLARO.has(DISCOS[i].id)); }, []);
  const fecha = useCallback(() => {
    setMundo((m) => (m ? { ...m, on: false } : m)); setClaro(false);
    api.current.sai(); setTimeout(() => setMundo(null), 700);
  }, []);

  useEffect(() => {
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = cv.current, W = () => window.innerWidth, H = () => window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6)); renderer.setSize(W(), H(), false);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x07070a); scene.fog = new THREE.FogExp2(0x07070a, 0.05);
    const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 140); camera.position.set(0, 0, 4.2);
    const zMax = 4.2, zMin = lugar(DISCOS.length - 1).z + 3.4;
    const loader = new THREE.TextureLoader(), geo = new THREE.PlaneGeometry(2.3, 2.3);
    const malhas = DISCOS.map((d, i) => {
      const p = lugar(i), tex = loader.load(d.img); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, color: 0xd8d8d8, fog: true, toneMapped: false }));
      m.position.set(p.x, p.y, p.z); m.rotation.set((Math.sin(i * 1.7) * 0.1), (Math.cos(i * 2.3) * 0.16), (Math.sin(i * 3.1) * 0.08)); m.userData = { i, base: m.rotation.clone(), s: 1 };
      scene.add(m); return m;
    });
    // poeira para dar profundidade
    const N = 700, pos = new Float32Array(N * 3);
    for (let k = 0; k < N; k++) { pos[k * 3] = (Math.random() - 0.5) * 16; pos[k * 3 + 1] = (Math.random() - 0.5) * 9; pos[k * 3 + 2] = 6 - Math.random() * (DISCOS.length * PASSO + 10); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.03, color: 0x9a8f7e, transparent: true, opacity: 0.55, depthWrite: false })));

    const st = { fx: 1, sc: 1, modo: "campo", alvoZ: zMax, mx: 0, my: 0, hover: -1, salvo: null, arr: false, ay: 0, moveu: 0, dx: 0, dy: 0 };
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9);
    const aponta = (e) => { ndc.x = (e.clientX / W()) * 2 - 1; ndc.y = -(e.clientY / H()) * 2 + 1; st.mx = ndc.x; st.my = ndc.y; if (tip.current) { tip.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`; } };

    const entra = (i) => {
      if (st.modo !== "campo") return; st.modo = "anim"; const m = malhas[i];
      st.salvo = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
      if (tip.current) tip.current.style.opacity = 0; if (dica.current) dica.current.style.opacity = 0;
      gsap.to(scene.fog, { density: 0.0, duration: reduz ? 0 : 1.0, ease: "power2.in" });
      gsap.to(m.rotation, { x: 0, y: 0, z: 0, duration: reduz ? 0 : 0.9, ease: "power3.out" });
      gsap.to(camera.position, { x: m.position.x, y: m.position.y, z: m.position.z + 1.27, duration: reduz ? 0 : 1.15, ease: "power3.inOut", onComplete: () => { st.modo = "dentro"; abre(i); } });
    };
    const sai = () => {
      if (st.modo !== "dentro") return; st.modo = "anim"; const m = malhas[st.hover >= 0 ? st.hover : 0];
      gsap.to(scene.fog, { density: 0.05, duration: reduz ? 0 : 1.0, ease: "power2.out" });
      malhas.forEach((mm) => gsap.to(mm.rotation, { x: mm.userData.base.x, y: mm.userData.base.y, z: mm.userData.base.z, duration: reduz ? 0 : 0.9 }));
      gsap.to(camera.position, { ...st.salvo, duration: reduz ? 0 : 1.0, ease: "power3.inOut", onComplete: () => { st.modo = "campo"; if (dica.current) dica.current.style.opacity = 1; } });
    };
    api.current = { entra, sai };

    // voar: roda do mouse e arrastar
    const roda = (e) => { if (st.modo !== "campo") return; e.preventDefault(); st.alvoZ = THREE.MathUtils.clamp(st.alvoZ - e.deltaY * 0.012, zMin, zMax); };
    const down = (e) => { st.arr = true; st.ay = e.clientY; st.moveu = 0; aponta(e); };
    const move = (e) => { aponta(e); if (st.arr && st.modo === "campo") { const dy = st.ay - e.clientY; st.moveu += Math.abs(dy); st.ay = e.clientY; st.alvoZ = THREE.MathUtils.clamp(st.alvoZ - dy * 0.03, zMin, zMax); } };
    const up = (e) => { if (st.arr && st.moveu < 9 && st.modo === "campo") { aponta(e); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(malhas)[0]; if (h) entra(h.object.userData.i); } st.arr = false; };
    const sair = () => { ndc.set(9, 9); st.hover = -1; if (tip.current) tip.current.style.opacity = 0; };
    const tecla = (e) => { if (e.key === "Escape") api.current.fechaUI?.(); if (st.modo === "campo") { if (e.key === "ArrowDown" || e.key === "ArrowRight") st.alvoZ = Math.max(zMin, st.alvoZ - PASSO); if (e.key === "ArrowUp" || e.key === "ArrowLeft") st.alvoZ = Math.min(zMax, st.alvoZ + PASSO); } };
    canvas.addEventListener("wheel", roda, { passive: false }); canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointerleave", sair); window.addEventListener("keydown", tecla);
    // em tela em pé as capas ficam menores e mais juntas, senão a mais próxima passa da borda
    const mede = () => { renderer.setSize(W(), H(), false); camera.aspect = W() / H(); camera.updateProjectionMatrix(); st.fx = Math.min(1, camera.aspect / 1.5); st.sc = Math.min(1, 0.45 + camera.aspect * 0.55); malhas.forEach((m, i) => { m.position.x = lugar(i).x * st.fx; }); };
    window.addEventListener("resize", mede); mede();

    let raf = 0, vivo = true, ult = performance.now();
    const frame = (ms) => {
      if (!vivo) return; raf = requestAnimationFrame(frame);
      if (st.modo === "dentro") return; // com o mundo aberto, o campo dorme
      const dt = Math.min(0.05, (ms - ult) / 1000); ult = ms; const k = 1 - Math.exp(-dt * 4.5);
      if (st.modo === "campo") {
        camera.position.z += (st.alvoZ - camera.position.z) * k;
        camera.position.x += (st.mx * 0.45 - camera.position.x) * k * 0.6; camera.position.y += (st.my * 0.25 - camera.position.y) * k * 0.6;
        ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(malhas)[0]; const hi = h ? h.object.userData.i : -1;
        if (hi !== st.hover) { st.hover = hi; canvas.style.cursor = hi >= 0 ? "pointer" : "grab"; if (tip.current) { if (hi >= 0) { tip.current.firstChild.textContent = DISCOS[hi].t; tip.current.lastChild.textContent = `${DISCOS[hi].d.slice(0, 4)} · ${DISCOS[hi].tipo}`; tip.current.style.opacity = 1; } else tip.current.style.opacity = 0; } }
        // o que está mais perto da câmera
        let perto = 0, dm = 1e9; malhas.forEach((m, i) => { const d = Math.abs(m.position.z - camera.position.z + 1.6); if (d < dm) { dm = d; perto = i; } });
        if (cont.current) cont.current.textContent = `${String(perto + 1).padStart(2, "0")} / ${DISCOS.length} · ${DISCOS[perto].d.slice(0, 4)}`;
      }
      malhas.forEach((m, i) => {
        const alvo = st.hover === i ? 1.09 : 1; m.userData.s += (alvo - m.userData.s) * k * 1.4; m.scale.setScalar(m.userData.s * st.sc);
        const c = st.modo === "campo" ? (st.hover === -1 ? 0.84 : st.hover === i ? 1 : 0.5) : 1; m.material.color.setScalar(m.material.color.r + (c - m.material.color.r) * k);
        if (st.modo === "campo") { m.position.y = lugar(i).y + Math.sin(ms / 1000 * 0.45 + i * 1.7) * 0.09; }
      });
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);
    return () => { vivo = false; cancelAnimationFrame(raf); canvas.removeEventListener("wheel", roda); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointerleave", sair); window.removeEventListener("keydown", tecla); window.removeEventListener("resize", mede); gsap.killTweensOf(camera.position); renderer.dispose(); geo.dispose(); malhas.forEach((m) => { m.material.map.dispose(); m.material.dispose(); }); pg.dispose(); };
  }, [abre]);

  useEffect(() => { api.current.fechaUI = fecha; }, [fecha]);

  const Mundo = mundo ? MUNDOS[DISCOS[mundo.i].id] || MundoGenerico : null;
  return (
    <main ref={raiz} className={`${s.raiz} ${ui.variable} ${mao.variable} ${grosso.variable} ${maquina.variable} ${mono.variable}`}>
      <canvas ref={cv} className={s.canvas} aria-label="Capas dos discos do Makalister, flutuando. Role para voar e clique numa capa para entrar nela." />
      <VoltarJodo />
      <MarcaTopo nome="Makalister" cor={claro ? "#1a1713" : "#e9dfc9"} plano escala={1.05} />
      <h1 className={s.marca}>makalister</h1>
      <p ref={dica} className={s.dica}>role para voar · clique numa capa para entrar</p>
      <p ref={cont} className={s.contador} aria-hidden="true" />
      <div ref={tip} className={s.tip} aria-hidden="true"><b /><span /></div>
      {mundo ? (
        <div className={`${s.mundo} ${mundo.on ? s.on : ""}`} role="dialog" aria-label={DISCOS[mundo.i].t}>
          <button type="button" className={`${s.capas} ${claro ? s.capasClaro : ""}`} onClick={fecha}>← capas</button>
          <Mundo l={DISCOS[mundo.i]} />
        </div>
      ) : null}
    </main>
  );
}
