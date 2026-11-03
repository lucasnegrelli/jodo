import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/*
  Cenas 3D da página do Davzera. Cada uma cria o próprio renderer dentro de um div e devolve a função que desmonta.
  st = { u: progresso local 0..1 da cena, vis: está na tela, px/py: ponteiro -1..1 }
*/
function base(el, st, mk, { amb = true } = {}) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  el.appendChild(r.domElement);
  r.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  let pm = null;
  if (amb) { pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; }
  const api = mk({ r, scene, cam, st });
  const ray = new THREE.Raycaster(), mp = new THREE.Vector2();
  const acerta = (e) => {
    if (!api.alvos || !st.vis) return false;
    const rc = r.domElement.getBoundingClientRect();
    mp.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1); ray.setFromCamera(mp, cam);
    return ray.intersectObjects(api.alvos, false).length > 0;
  };
  const aoMover = (e) => { r.domElement.style.cursor = acerta(e) ? "pointer" : ""; };
  const aoClicar = (e) => { if (acerta(e)) st.play?.(); };
  r.domElement.addEventListener("pointermove", aoMover); r.domElement.addEventListener("click", aoClicar);
  const fit = () => {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); api.fit?.(w, h);
  };
  fit();
  const ro = new ResizeObserver(fit); ro.observe(el);
  let raf = 0, vivo = true; const t0 = performance.now();
  const laco = (now) => {
    if (!vivo) return;
    raf = requestAnimationFrame(laco);
    if (!st.vis) return;
    api.tick((now - t0) / 1000);
    r.render(scene, cam);
  };
  raf = requestAnimationFrame(laco);
  return () => {
    vivo = false; cancelAnimationFrame(raf); ro.disconnect();
    r.domElement.removeEventListener("pointermove", aoMover); r.domElement.removeEventListener("click", aoClicar);
    scene.traverse((o) => {
      o.geometry?.dispose();
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      ms.forEach((m) => { m.map?.dispose(); m.dispose(); });
    });
    api.dispose?.(); scene.environment?.dispose(); pm?.dispose(); r.dispose(); r.domElement.remove();
  };
}

const carrega = (url, fn) => new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; fn?.(t); });
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* Robô de Roleta 50-50: uma roleta de verdade; a rolagem gira o prato e a bolinha cai no bolso */
export function roleta(el, st) {
  return base(el, st, ({ scene, cam }) => {
    const N = 16, TAU = Math.PI * 2;
    const cv = document.createElement("canvas"); cv.width = cv.height = 1024;
    const g = cv.getContext("2d"), C = 512;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * TAU - Math.PI / 2, a1 = ((i + 1) / N) * TAU - Math.PI / 2;
      g.beginPath(); g.moveTo(C, C); g.arc(C, C, 500, a0, a1); g.closePath();
      g.fillStyle = i % 4 === 0 ? "#d9ff3d" : i % 2 ? "#0c0c0c" : "#1d6b34"; g.fill();
      g.strokeStyle = "#caa24a"; g.lineWidth = 5; g.stroke();
      if (i % 4 === 0) {
        const am = (a0 + a1) / 2; g.save(); g.translate(C + Math.cos(am) * 410, C + Math.sin(am) * 410); g.rotate(am + Math.PI / 2);
        g.fillStyle = "#0c0c0c"; g.font = "700 64px Montserrat, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i / 4 + 1), 0, 0); g.restore();
      }
    }
    g.beginPath(); g.arc(C, C, 300, 0, TAU); g.strokeStyle = "#caa24a"; g.lineWidth = 8; g.stroke();
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const roda = new THREE.Group(); scene.add(roda);
    const prato = new THREE.Mesh(new THREE.CircleGeometry(2, 96), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.38, metalness: 0.25 }));
    prato.rotation.x = -Math.PI / 2; roda.add(prato);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(2.08, 0.16, 24, 120), new THREE.MeshStandardMaterial({ color: 0xcaa24a, metalness: 1, roughness: 0.22 }));
    aro.rotation.x = Math.PI / 2; aro.position.y = 0.04; scene.add(aro);
    const miolo = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.22, 48), new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0.7, roughness: 0.3 }));
    miolo.position.y = 0.1; roda.add(miolo);
    const capa = new THREE.Mesh(new THREE.CircleGeometry(0.62, 64), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    capa.rotation.x = -Math.PI / 2; capa.position.y = 0.221; roda.add(capa);
    carrega("/dz/robo.jpg", (t) => { capa.material.map = t; capa.material.needsUpdate = true; });
    const bola = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.08 }));
    scene.add(bola);
    scene.add(new THREE.DirectionalLight(0xffffff, 2.2).translateX(-3).translateY(6).translateZ(2));
    return {
      alvos: [capa, miolo],
      fit(w, h) { cam.position.set(0, w / h < 1.3 ? 7.3 : 5.6, w / h < 1.3 ? 4.6 : 4.9); },
      tick(t) {
        const u = st.u, sp = u * 7 + t * 0.12;
        roda.rotation.y = sp;
        // a bolinha corre no sentido contrário, perde raio e cai no bolso
        const cai = suave(0.15, 0.82, u), ang = -u * 38 - t * 0.6 * (1 - cai) + 1.1;
        const raio = 1.92 - cai * 0.92 - (1 - cai) * 0.02;
        const a = ang;
        bola.position.set(Math.cos(a) * raio, 0.17 + Math.abs(Math.sin(u * 60)) * 0.16 * (1 - cai) * (1 - cai), Math.sin(a) * raio);
        cam.position.x += (st.px * 0.7 - cam.position.x) * 0.05;
        cam.lookAt(0, 0, 0);
      },
    };
  });
}

/* Low Carb: o prato dourado da capa, em metal, com a luz passeando */
export function prato(el, st) {
  return base(el, st, ({ scene, cam }) => {
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.85, roughness: 0.32 });
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.55, 0.14, 120), mat);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.07, 20, 140), new THREE.MeshStandardMaterial({ color: 0xc89a3c, metalness: 1, roughness: 0.2 }));
    aro.rotation.x = Math.PI / 2; aro.position.y = 0.07;
    const grupo = new THREE.Group(); grupo.add(disco, aro); scene.add(grupo);
    carrega("/dz/lowcarb.jpg", (t) => { t.repeat.set(0.56, 0.56); t.offset.set(0.215, 0.215); mat.map = t; mat.needsUpdate = true; });
    const luz = new THREE.PointLight(0xffd27a, 90, 14); scene.add(luz);
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    return {
      alvos: [disco],
      fit(w, h) { cam.position.set(0, 0.5, w / h < 0.9 ? 13.5 : 8.6); },
      tick(t) {
        const u = st.u;
        grupo.rotation.x = 1.2 - u * 1.05 + st.py * 0.12;
        grupo.rotation.z = Math.sin(t * 0.4) * 0.05 + st.px * 0.1;
        grupo.rotation.y = u * 1.8 + t * 0.08;
        const s = 0.8 + suave(0, 0.35, u) * 0.35; grupo.scale.setScalar(s);
        luz.position.set(Math.cos(t * 0.7 + u * 6) * 4, 2.5 + Math.sin(t * 0.5) * 1.2, 3.5);
        cam.lookAt(0, 0, 0);
      },
    };
  });
}

/* Cozinha Marginal: pés de ganja desenhados à tinta, cinco tipos diferentes (alto com cola, arbusto de vários buds, folhoso sem flor, ramificado, magro com buds ao longo do caule), em tons perto da capa */
const LAR = 512, ALT = 800, NVAR = 5;

function desenhaPlanta(g, v) {
  const cx = 256, tinta = "#06180a";
  let sem = 11 + v * 977; const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
  g.lineJoin = "round"; g.lineCap = "round";
  const folheto = (ang, len, larg, k) => {
    g.save(); g.rotate((ang * Math.PI) / 180);
    const n = 9, pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, w = larg * Math.sin(Math.PI * Math.pow(t, 0.75)) * (i % 2 ? 1 : 0.62); pts.push([w, -t * len]); }
    g.beginPath(); g.moveTo(0, 0);
    for (const [w, y] of pts) g.lineTo(w, y);
    g.lineTo(0, -len);
    for (let i = n; i >= 0; i--) g.lineTo(-pts[i][0], pts[i][1]);
    g.closePath();
    const gr = g.createLinearGradient(0, 0, 0, -len); gr.addColorStop(0, "#10381a"); gr.addColorStop(0.55, "#2f6b2a"); gr.addColorStop(1, "#7fa84a");
    g.fillStyle = gr; g.fill(); g.strokeStyle = tinta; g.lineWidth = 4.5 / k; g.stroke();
    g.strokeStyle = "rgba(200,230,150,.55)"; g.lineWidth = 2.4 / k; g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -len * 0.9); g.stroke();
    g.restore();
  };
  // folhas em leque com 3, 5, 7 ou 9 folíolos
  const LEQUES = { 3: [[-48, 150, 20], [48, 150, 20], [0, 215, 25]], 5: [[-72, 140, 18], [72, 140, 18], [-34, 195, 22], [34, 195, 22], [0, 232, 25]], 7: [[-90, 118, 15], [90, 118, 15], [-60, 172, 20], [60, 172, 20], [-30, 222, 24], [30, 222, 24], [0, 258, 27]], 9: [[-100, 90, 12], [100, 90, 12], [-76, 135, 16], [76, 135, 16], [-50, 185, 20], [50, 185, 20], [-24, 232, 24], [24, 232, 24], [0, 268, 27]] };
  const leque = (x, y, rot, k, n) => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); LEQUES[n].forEach(([a, l, w]) => folheto(a, l, w, k)); g.restore(); };
  const bud = (x, yTopo, comp, larg, rot, tom) => {
    g.save(); g.translate(x, yTopo + comp); g.rotate(rot);
    const blobs = [], linhas = Math.max(3, Math.round(comp / 15));
    for (let i = 0; i <= linhas; i++) {
      const t = i / linhas, w = (larg / 2) * Math.sin(Math.PI * (0.12 + 0.88 * Math.pow(t, 0.8))), q = 2 + Math.floor(w / 9);
      for (let j = 0; j < q; j++) blobs.push([(-w + (2 * w * (j + rnd() * 0.6)) / q) * (0.9 + rnd() * 0.2), -t * comp + (rnd() - 0.5) * 8, 7 + rnd() * 5 + w * 0.12]);
    }
    blobs.sort((a, b) => b[1] - a[1]);
    const [c0, c1, c2] = tom;
    for (const [bx, by, r] of blobs) {
      const gr = g.createRadialGradient(bx - r * 0.3, by - r * 0.35, r * 0.1, bx, by, r);
      gr.addColorStop(0, c0); gr.addColorStop(0.55, c1); gr.addColorStop(1, c2);
      g.fillStyle = gr; g.beginPath(); g.ellipse(bx, by, r, r * 1.18, 0, 0, 7); g.fill(); g.strokeStyle = tinta; g.lineWidth = 2; g.stroke();
    }
    for (let i = 0; i < Math.round(comp * 0.26); i++) {
      const [bx, by] = blobs[Math.floor(rnd() * blobs.length)], a = (rnd() - 0.5) * 2.4 - Math.PI / 2, l = 10 + rnd() * 16;
      g.strokeStyle = rnd() < 0.5 ? "#b8672a" : "#d99a52"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + Math.cos(a) * l * 0.5 + (rnd() - 0.5) * 8, by + Math.sin(a) * l * 0.5, bx + Math.cos(a) * l, by + Math.sin(a) * l); g.stroke();
    }
    g.fillStyle = "rgba(240,248,225,.7)";
    for (let i = 0; i < comp * 0.35; i++) { const [bx, by, r] = blobs[Math.floor(rnd() * blobs.length)]; g.beginPath(); g.arc(bx + (rnd() - 0.5) * r * 1.6, by + (rnd() - 0.5) * r * 1.6, 0.8 + rnd() * 1.2, 0, 7); g.fill(); }
    g.restore();
  };
  const linha = (x0, y0, cx1, cy1, x1, y1, e) => {
    g.strokeStyle = tinta; g.lineWidth = e + 6; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx1, cy1, x1, y1); g.stroke();
    g.strokeStyle = "#3e7a34"; g.lineWidth = e; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx1, cy1, x1, y1); g.stroke();
  };
  const T = [["#c9dd8c", "#5f8c34", "#1f4a22"], ["#c6c98a", "#7d8a3a", "#34401c"], ["#cfd49a", "#6a8a46", "#243d22"], ["#bfb9d6", "#6c6f9a", "#2b2c4a"]];
  const tom = T[v % 3];
  if (v === 0) { // alto, uma cola grande no topo
    linha(cx, ALT, cx + 18, 520, cx + 6, 250, 9);
    [[690, -1, 0.5, 7], [585, 1, 0.5, 7], [490, -1, 0.42, 5], [405, 1, 0.38, 5], [330, -1, 0.3, 3]].forEach(([y, l, k, n], i) => { const x = cx + 12 - (y - 250) * 0.01, ex = x + l * 28 * (k + 0.4); linha(x, y, x + l * 20, y - 30, ex, y - 36, 4); leque(ex, y - 36, l * 0.78, k, n); if (i % 2 === 0) bud(x - l * 6, y - 100, 90 + (4 - i) * 12, 50, -l * 0.18, tom); });
    bud(cx + 6, 28, 290, 112, 0.04, tom);
  } else if (v === 1) { // arbusto: três colas médias de alturas diferentes
    linha(cx, ALT, cx - 10, 560, cx - 6, 400, 11);
    linha(cx - 6, 420, cx - 80, 380, cx - 120, 280, 6); linha(cx - 6, 420, cx + 70, 360, cx + 130, 250, 6);
    [[700, -1, 0.55, 9], [610, 1, 0.5, 7], [520, -1, 0.42, 7]].forEach(([y, l, k, n]) => { const x = cx - 8, ex = x + l * 28 * (k + 0.4); linha(x, y, x + l * 20, y - 24, ex, y - 30, 4); leque(ex, y - 30, l * 0.7, k, n); });
    bud(cx - 120, 90, 190, 80, -0.14, tom); bud(cx + 130, 60, 220, 88, 0.12, tom); bud(cx - 6, 190, 150, 70, 0.02, tom);
    leque(cx - 6, 400, -0.1, 0.32, 5);
  } else if (v === 2) { // duas colas lado a lado, poucas folhas
    linha(cx, ALT, cx - 6, 600, cx - 4, 380, 10);
    linha(cx - 4, 400, cx - 70, 340, cx - 96, 230, 6); linha(cx - 4, 400, cx + 64, 330, cx + 92, 190, 6);
    [[700, -1, 0.5, 7], [600, 1, 0.42, 5]].forEach(([y, l, k, n]) => { const x = cx - 6, ex = x + l * 28 * (k + 0.4); linha(x, y, x + l * 12, y - 16, ex, y - 22, 4); leque(ex, y - 22, l * 0.7, k, n); });
    bud(cx - 96, 70, 170, 74, -0.1, tom); bud(cx + 92, 20, 200, 84, 0.1, tom); bud(cx - 6, 220, 140, 60, 0.02, tom);
    bud(cx - 4, 470, 80, 40, 0.08, tom);
  } else if (v === 3) { // ramificado e torto, dois ramos com buds de tamanhos diferentes
    linha(cx, ALT, cx + 60, 560, cx + 30, 330, 10);
    linha(cx + 40, 500, cx - 40, 430, cx - 100, 300, 6); linha(cx + 36, 380, cx + 120, 300, cx + 150, 190, 6);
    [[730, -1, 0.5, 7], [640, 1, 0.46, 5], [560, -1, 0.4, 5]].forEach(([y, l, k, n]) => { const x = cx + 40, ex = x + l * 28 * (k + 0.4); linha(x, y, x + l * 20, y - 28, ex, y - 34, 4); leque(ex, y - 34, l * 0.74, k, n); });
    leque(cx - 100, 310, -0.5, 0.42, 7); leque(cx + 150, 200, 0.5, 0.36, 5);
    bud(cx - 100, 150, 150, 62, -0.12, tom); bud(cx + 36, 60, 240, 96, 0.06, tom); bud(cx + 150, 110, 90, 46, 0.1, tom);
  } else { // magro, buds pequenos ao longo do caule
    linha(cx, ALT, cx - 14, 560, cx + 4, 120, 7);
    for (let i = 0; i < 8; i++) { const y = 700 - i * 76, l = i % 2 ? 1 : -1, x = cx + (i % 3) * 2; linha(x, y, x + l * 14, y - 12, x + l * 34, y - 22, 3); if (i < 5) leque(x + l * 34, y - 22, l * 0.8, 0.26, 5); bud(x + l * 32, y - 70, 54 + (i % 3) * 14, 28 + (i % 2) * 8, l * 0.2, tom); }
    bud(cx + 4, 20, 170, 56, 0.02, tom);
  }
}

function atlasGanja() {
  const cv = document.createElement("canvas"); cv.width = LAR * NVAR; cv.height = ALT;
  const g = cv.getContext("2d");
  for (let v = 0; v < NVAR; v++) { g.save(); g.translate(v * LAR, 0); g.beginPath(); g.rect(0, 0, LAR, ALT); g.clip(); desenhaPlanta(g, v); g.restore(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const TINTAS = [[1, 1, 1], [1, 1, 1], [0.92, 1.05, 0.82], [1.08, 0.98, 0.8], [0.9, 0.95, 1.05]];

export function ervas(el, st) {
  return base(el, st, ({ scene, cam }) => {
    const tex = atlasGanja();
    const n = 22, geo = new THREE.PlaneGeometry(1, 1, 1, 12); geo.translate(0, 0.5, 0);
    const off = new Float32Array(n * 4), rot = new Float32Array(n), tint = new Float32Array(n * 3), vr = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      off[i * 4] = ((i + Math.random() * 0.9) / n - 0.5) * 21; off[i * 4 + 1] = 0; off[i * 4 + 2] = -1.5 - Math.random() * 8; off[i * 4 + 3] = 3.4 + Math.random() * 4.4; off[i * 4 + 1] = -0.34 * (10 - off[i * 4 + 2]) - 0.5 - Math.random() * 0.5;
      rot[i] = (Math.random() - 0.5) * 0.22;
      tint.set(TINTAS[Math.floor(Math.random() * TINTAS.length)], i * 3);
      vr[i * 2] = Math.floor(Math.random() * NVAR); vr[i * 2 + 1] = Math.random() < 0.5 ? -1 : 1;
    }
    geo.setAttribute("aOff", new THREE.InstancedBufferAttribute(off, 4)); geo.setAttribute("aRot", new THREE.InstancedBufferAttribute(rot, 1)); geo.setAttribute("aTint", new THREE.InstancedBufferAttribute(tint, 3)); geo.setAttribute("aVar", new THREE.InstancedBufferAttribute(vr, 2));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uU: { value: 0 }, uM: { value: 0 }, uTex: { value: tex } }, transparent: true, side: THREE.DoubleSide, depthWrite: false,
      vertexShader: `attribute vec4 aOff; attribute float aRot; attribute vec3 aTint; attribute vec2 aVar; uniform float uT,uU,uM; varying vec2 vUv; varying float vD; varying vec3 vT;
        void main(){ vUv=vec2((uv.x+aVar.x)/${NVAR}.0, uv.y); vT=aTint; float cresce=smoothstep(0.0,1.0,clamp(uU*1.9-(aOff.z+10.0)*0.035,0.0,1.0)); float h=aOff.w*(0.12+0.95*cresce);
        vec3 p=position; p.y*=h; p.x*=h*0.64*aVar.y; float k=pow(uv.y,1.7);
        float s=sin(uT*1.1+aOff.x*0.7+aOff.z)*0.3+sin(uT*2.2+aOff.x)*0.08+uM*0.5;
        float c=cos(aRot), sn=sin(aRot); p.xy=mat2(c,-sn,sn,c)*p.xy; p.x+=s*k*h*0.16;
        vD=clamp((aOff.z+10.0)/10.0,0.0,1.0);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p+vec3(aOff.x,aOff.y,aOff.z),1.0); }`,
      fragmentShader: `uniform sampler2D uTex; varying vec2 vUv; varying float vD; varying vec3 vT;
        void main(){ vec4 c=texture2D(uTex,vUv); if(c.a<0.05) discard; vec3 col=c.rgb*vT; col*=mix(0.34,1.08,vD); gl_FragColor=vec4(col,c.a); }`,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.frustumCulled = false; scene.add(mesh);
    return {
      fit(w, h) { cam.position.set(0, 0, w / h < 0.9 ? 14 : 9); mesh.position.y = w / h < 0.9 ? -1.8 : 0; },
      tick(t) {
        mat.uniforms.uT.value = t; mat.uniforms.uU.value = st.u;
        mat.uniforms.uM.value += (st.px - mat.uniforms.uM.value) * 0.05;
        cam.position.x += (st.px * 0.8 - cam.position.x) * 0.04; cam.position.y = st.py * 0.25;
        cam.lookAt(0, 0, 0);
      },
      dispose() { tex.dispose(); },
    };
  }, { amb: false });
}

/* Nauzeainc, Vol. 0: o calçamento começa cinza, sem o efeito 3D; na rolagem o vermelho e o azul voltam */
export function anaglifo(el, st) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 640;
  cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;cursor:pointer";
  el.appendChild(cv);
  const g = cv.getContext("2d"), saida = g.createImageData(640, 640);
  let R = null, G = null, B = null, ult = -1, vivo = true, raf = 0;
  const im = new Image();
  im.onload = () => {
    const t = document.createElement("canvas"); t.width = t.height = 640; const tg = t.getContext("2d"); tg.drawImage(im, 0, 0, 640, 640);
    const d = tg.getImageData(0, 0, 640, 640).data, n = 640 * 640;
    R = new Uint8Array(n); G = new Uint8Array(n); B = new Uint8Array(n);
    for (let i = 0; i < n; i++) { R[i] = d[i * 4]; G[i] = d[i * 4 + 1]; B[i] = d[i * 4 + 2]; }
    ult = -1;
  };
  im.src = "/dz/vol0.jpg";
  const clica = () => st.play?.();
  cv.addEventListener("click", clica);
  const laco = () => {
    if (!vivo) return; raf = requestAnimationFrame(laco);
    if (!R || !st.vis) return;
    const k = clamp((st.u - 0.1) / 0.6), kk = Math.round(k * 120);
    if (kk === ult) return; ult = kk;
    const o = saida.data, n = 640 * 640;
    for (let i = 0; i < n; i++) {
      const y = (G[i] + B[i]) * 0.5, y2 = (y - 128) * 1.08 + 128;
      o[i * 4] = y2 + (R[i] - y2) * k; o[i * 4 + 1] = y2 + (G[i] - y2) * k; o[i * 4 + 2] = y2 + (B[i] - y2) * k; o[i * 4 + 3] = 255;
    }
    g.putImageData(saida, 0, 0);
  };
  raf = requestAnimationFrame(laco);
  return () => { vivo = false; cancelAnimationFrame(raf); cv.removeEventListener("click", clica); cv.remove(); };
}
