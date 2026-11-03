// Lampe à lévitation en 3D (Three.js) — liasse lumineuse + socle hexagonal.
import * as THREE from 'three';

const BRAND_SHORT = 'STACK';

/* ---------- Textures générées (aucune image externe) ---------- */

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function star(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function band(ctx, cx, w, h, { stars = false, text = false } = {}) {
  ctx.fillStyle = '#f7f4ec';
  ctx.fillRect(cx - w / 2, 0, w, h);
  ctx.fillStyle = '#6f7d82';
  const s = w * 0.13;
  ctx.fillRect(cx - w / 2, 0, s, h);
  ctx.fillRect(cx + w / 2 - s, 0, s, h);
  if (stars) {
    for (let i = 0; i < 3; i++) star(ctx, cx, h * (0.22 + i * 0.28), w * 0.24, '#7a878c');
  }
  if (text) {
    ctx.save();
    ctx.translate(cx, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#5d6a6f';
    ctx.font = `bold ${w * 0.32}px Anton, Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(BRAND_SHORT, 0, 0);
    ctx.restore();
  }
}

function billTexture() {
  const W = 1024, H = 442;
  const [c, ctx] = canvas(W, H);
  const ink = '#4b5a3e';
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#efe8cf');
  g.addColorStop(0.5, '#e6e4c8');
  g.addColorStop(1, '#ece2c6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Guilloches
  ctx.strokeStyle = 'rgba(75,90,62,.16)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 26; k++) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = 30 + k * 15 + Math.sin(x / 38 + k) * 6;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }

  // Bordure ornementale
  ctx.strokeStyle = ink;
  ctx.lineWidth = 6; ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.lineWidth = 2; ctx.strokeRect(28, 28, W - 56, H - 56);
  for (let x = 40; x < W - 40; x += 14) {
    ctx.beginPath(); ctx.arc(x, 21, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, H - 21, 3, 0, Math.PI * 2); ctx.stroke();
  }

  // Sceau
  ctx.save();
  ctx.translate(140, 205);
  ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
    ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44);
    ctx.stroke();
  }
  star(ctx, 0, 0, 18, ink);
  ctx.restore();

  // Médaillon : soleil couchant + palmier
  ctx.save();
  ctx.translate(330, 221);
  ctx.beginPath(); ctx.ellipse(0, 0, 105, 150, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#e9dfc0'; ctx.fillRect(-120, -160, 240, 320);
  ctx.fillStyle = 'rgba(75,90,62,.55)';
  ctx.beginPath(); ctx.arc(0, 30, 80, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#e9dfc0';
  for (let i = 0; i < 6; i++) ctx.fillRect(-90, 30 - 8 - i * 12, 180, 3 + i * 0.6);
  ctx.strokeStyle = 'rgba(75,90,62,.5)'; ctx.lineWidth = 1.2;
  for (let y = 40; y < 160; y += 7) { ctx.beginPath(); ctx.moveTo(-110, y); ctx.lineTo(110, y); ctx.stroke(); }
  // palmier
  ctx.strokeStyle = ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(30, 150); ctx.quadraticCurveTo(40, 40, 5, -55); ctx.stroke();
  ctx.lineWidth = 5;
  [[-80, -40], [-60, -95], [0, -110], [60, -90], [75, -35], [-30, -20]].forEach(([dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(5, -55); ctx.quadraticCurveTo(5 + dx * 0.5, -55 + dy * 0.6 - 25, 5 + dx, -55 + dy * 0.5 + 25); ctx.stroke();
  });
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(330, 221, 105, 150, 0, 0, Math.PI * 2); ctx.stroke();

  // Textes
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('THE UNITED STACKS OF NEON', 780, 72);
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('IN SUNSET WE TRUST', 780, 104);
  ctx.font = 'bold 120px Georgia, serif';
  ctx.fillStyle = 'rgba(64,110,70,.85)';
  ctx.fillText('100', 790, 285);
  ctx.fillStyle = ink;
  ctx.font = 'bold 46px Georgia, serif';
  ctx.fillText('100', 80, 82);
  ctx.fillText('100', 945, H - 50);
  ctx.font = '22px monospace';
  ctx.fillStyle = '#3f7a4a';
  ctx.fillText('NS 1911 2026 A', 780, 340);
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillStyle = ink;
  ctx.fillText('ONE HUNDRED BUCKS', 780, 390);

  band(ctx, W / 2, 92, H, { text: true });
  return c;
}

function paperTexture(W, H, withBand) {
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = '#f3ecd9';
  ctx.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 2) {
    const l = 88 + Math.random() * 10;
    ctx.fillStyle = `hsla(${40 + Math.random() * 8}, 45%, ${l}%, ${0.35 + Math.random() * 0.5})`;
    ctx.fillRect(0, y, W, 1 + (Math.random() > 0.8 ? 1 : 0));
  }
  for (let i = 0; i < 18; i++) {
    const y = Math.random() * H;
    ctx.fillStyle = 'rgba(160,140,100,.18)';
    ctx.fillRect(0, y, W, 1);
  }
  if (withBand) band(ctx, W / 2, 92, H, { stars: true });
  return c;
}

function radial(stops, size = 256) {
  const [c, ctx] = canvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function tex(c, renderer) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

/* ---------- Scène ---------- */

export function mountLamp(canvasEl) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  // Lumières d'ambiance Miami
  scene.add(new THREE.HemisphereLight(0x8a7cff, 0x1a0b2e, 0.9));
  const pink = new THREE.DirectionalLight(0xff3d9a, 2.2);
  pink.position.set(-5, 3, 2);
  scene.add(pink);
  const cyan = new THREE.DirectionalLight(0x29e6ff, 1.8);
  cyan.position.set(5, 2.5, -1);
  scene.add(cyan);
  const key = new THREE.DirectionalLight(0xffe2c0, 0.55);
  key.position.set(2, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 6;
  scene.add(key);

  const root = new THREE.Group();
  scene.add(root);

  /* Socle hexagonal facetté */
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1.55, 0),
    new THREE.Vector2(1.78, 0.13),
    new THREE.Vector2(1.6, 0.38),
    new THREE.Vector2(0, 0.38),
  ];
  const baseGeo = new THREE.LatheGeometry(pts, 6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0e0d12, roughness: 0.42, metalness: 0.35, flatShading: true });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.rotation.y = Math.PI / 6;
  base.castShadow = true;
  base.receiveShadow = true;
  root.add(base);

  // Bouton tactile
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x2a2014, emissive: 0xffb347, emissiveIntensity: 1.2, metalness: 0.8, roughness: 0.3 });
  const btn = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 12, 32), btnMat);
  btn.rotation.x = -Math.PI / 2;
  btn.position.set(0.55, 0.385, 1.0);
  root.add(btn);

  // Halo lumineux sur le dessus du socle
  const poolMat = new THREE.MeshBasicMaterial({
    map: radial([[0, 'rgba(255,196,120,1)'], [0.45, 'rgba(255,150,70,.45)'], [1, 'rgba(255,120,40,0)']]),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.386;
  root.add(pool);

  // Reflet néon au sol
  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshBasicMaterial({
      map: radial([[0, 'rgba(255,70,160,.55)'], [0.5, 'rgba(120,40,200,.25)'], [1, 'rgba(0,0,0,0)']]),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = -0.01;
  root.add(floorGlow);

  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.45 }));
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.receiveShadow = true;
  root.add(shadowCatcher);

  /* Liasse lumineuse */
  const L = 2.3, D = 1.0, Hh = 1.0;
  const top = tex(billTexture(), renderer);
  const side = tex(paperTexture(1024, 442, true), renderer);
  const end = tex(paperTexture(512, 512, false), renderer);
  const mk = (map) => new THREE.MeshStandardMaterial({
    map, color: 0x6a6a6a, emissiveMap: map, emissive: new THREE.Color(0xffb35c), emissiveIntensity: 0.85, roughness: 0.9, metalness: 0,
  });
  const mats = [mk(end), mk(end), mk(top), mk(top), mk(side), mk(side)];
  const stack = new THREE.Mesh(new THREE.BoxGeometry(L, Hh, D), mats);
  stack.castShadow = true;

  const stackPivot = new THREE.Group();
  stackPivot.add(stack);
  root.add(stackPivot);
  const BASE_Y = 0.38 + 0.55 + Hh / 2;

  // Halo autour de la liasse
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radial([[0, 'rgba(255,200,130,.9)'], [0.35, 'rgba(255,150,80,.35)'], [1, 'rgba(255,120,60,0)']]),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  halo.scale.set(5.2, 3.4, 1);
  stackPivot.add(halo);

  const inner = new THREE.PointLight(0xffb066, 6, 6, 1.6);
  inner.position.y = -0.45;
  stackPivot.add(inner);

  /* Interaction : glisser pour faire tourner (le scroll vertical reste libre) */
  let on = true, glow = 1;
  let spin = 0, vel = 0, dragging = false, lastX = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  canvasEl.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvasEl.setPointerCapture(e.pointerId); });
  canvasEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    vel = dx * 0.006; spin += vel;
  });
  const stop = () => { dragging = false; };
  canvasEl.addEventListener('pointerup', stop);
  canvasEl.addEventListener('pointercancel', stop);

  let mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  /* Cadrage responsive */
  function resize() {
    const w = canvasEl.clientWidth, h = canvasEl.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(2.3 / (t * camera.aspect), 1.75 / t) * 1.08;
    camera.position.set(0, dist * 0.42, dist * 0.95);
    camera.lookAt(0, 1.0, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvasEl);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvasEl);

  const clock = new THREE.Clock();
  let firstFrame = true;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (!dragging) { vel *= 0.94; spin += vel + (reduce ? 0 : dt * 0.35); }
    stackPivot.rotation.y = spin;
    stackPivot.position.y = BASE_Y + (reduce ? 0 : Math.sin(t * 1.5) * 0.07);
    stack.rotation.z = reduce ? 0 : Math.sin(t * 0.9) * 0.015;

    glow += ((on ? 1 : 0) - glow) * Math.min(1, dt * 6);
    mats.forEach((m) => { m.emissiveIntensity = 0.04 + glow * 0.81; });
    inner.intensity = glow * 6;
    halo.material.opacity = glow;
    poolMat.opacity = 0.15 + glow * 0.85 + Math.sin(t * 1.5) * 0.05 * glow;
    btnMat.emissiveIntensity = 0.3 + glow * 1.2;

    root.rotation.y += ((mx * 0.25) - root.rotation.y) * 0.05;
    root.rotation.x += ((my * 0.06) - root.rotation.x) * 0.05;

    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; window.__lampReady = true; window.dispatchEvent(new Event('lamp:ready')); }
  }
  frame();

  return {
    toggle() { on = !on; return on; },
    isOn: () => on,
  };
}

// Montage automatique
const el = document.getElementById('lamp-canvas');
if (el) {
  document.fonts.ready.then(() => {
    try {
      window.Lamp = mountLamp(el);
    } catch (err) {
      console.error(err);
      document.documentElement.classList.add('no-webgl');
      window.dispatchEvent(new Event('lamp:ready'));
    }
  });
}
