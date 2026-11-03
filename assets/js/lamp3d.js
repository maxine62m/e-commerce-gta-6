// LA LIASSE — scène 3D Miami : lampe à lévitation, palmiers, soleil, grille néon, pluie de billets.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const BAND_TEXT = 'LA LIASSE';
const isMobile = () => window.matchMedia('(max-width: 860px)').matches;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   Textures dessinées en canvas
   ========================================================= */
function cnv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
function rand(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

// Bandeau blanc à deux liserés gris (comme sur le vrai produit)
function band(ctx, cx, w, h, { stars = false, text = false } = {}) {
  ctx.fillStyle = '#fbf8f1';
  ctx.fillRect(cx - w / 2, 0, w, h);
  ctx.fillStyle = '#7d8c90';
  const s = w * 0.12;
  ctx.fillRect(cx - w / 2, 0, s, h);
  ctx.fillRect(cx + w / 2 - s, 0, s, h);
  if (stars) for (let i = 0; i < 3; i++) star(ctx, cx, h * (0.24 + i * 0.26), w * 0.2, '#808e93');
  if (text) {
    ctx.save();
    ctx.translate(cx, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#66757a';
    ctx.font = `600 ${w * 0.26}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(BAND_TEXT, 0, 0);
    ctx.restore();
  }
}

// Liseré clair sur les arêtes (effet résine translucide)
function rim(ctx, W, H) {
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, W, H);
}

// Point chaud de la LED intérieure
function hotspot(ctx, W, H, k = 1) {
  const g = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, W * 0.55);
  g.addColorStop(0, `rgba(255,255,240,${0.55 * k})`);
  g.addColorStop(1, 'rgba(255,255,240,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Face du dessus : billet de 100 stylisé (gravure sépia + "100" vert)
function billCanvas({ withBand = true, glow = true } = {}) {
  const W = 1024, H = 445;
  const [c, ctx] = cnv(W, H);
  const ink = '#5a4a36';
  ctx.fillStyle = '#f1ead6';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(90,74,54,.13)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 34; k++) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 5) {
      const y = 18 + k * 12 + Math.sin(x / 30 + k * 0.7) * 5;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5; ctx.strokeRect(16, 16, W - 32, H - 32);
  ctx.lineWidth = 1.5; ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillStyle = ink;
  for (let x = 44; x < W - 40; x += 92) { ctx.fillText('ONE HUNDRED', x, 26); ctx.fillText('ONE HUNDRED', x, H - 19); }

  // sceau
  ctx.save(); ctx.translate(110, 215);
  ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 36, Math.sin(a) * 36); ctx.lineTo(Math.cos(a) * 46, Math.sin(a) * 46); ctx.stroke();
  }
  star(ctx, 0, 0, 22, ink);
  ctx.restore();

  // médaillon portrait gravé
  ctx.save(); ctx.translate(330, 222);
  ctx.beginPath(); ctx.ellipse(0, 0, 112, 158, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(-130, -170, 260, 340);
  ctx.strokeStyle = 'rgba(90,74,54,.55)'; ctx.lineWidth = 1.3;
  for (let y = -170; y < 170; y += 5) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); }
  ctx.fillStyle = '#6b5640';
  ctx.beginPath(); ctx.moveTo(-130, 170); ctx.quadraticCurveTo(-110, 55, -30, 40); ctx.lineTo(40, 40); ctx.quadraticCurveTo(115, 55, 130, 170); ctx.fill();
  ctx.fillStyle = '#efe5cc';
  ctx.beginPath(); ctx.moveTo(-22, 40); ctx.lineTo(0, 110); ctx.lineTo(24, 40); ctx.fill();
  ctx.fillStyle = '#7a6448';
  ctx.beginPath(); ctx.ellipse(-30, -10, 34, 70, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(40, -5, 22, 55, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d9c9a6';
  ctx.beginPath(); ctx.ellipse(6, -22, 40, 58, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(90,74,54,.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-12, -40); ctx.lineTo(-2, -40); ctx.moveTo(14, -40); ctx.lineTo(24, -40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(2, -6); ctx.lineTo(9, -4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, 10); ctx.quadraticCurveTo(6, 16, 18, 10); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(330, 222, 112, 158, 0, 0, Math.PI * 2); ctx.stroke();

  // textes & chiffres
  ctx.fillStyle = ink; ctx.textAlign = 'center';
  ctx.font = 'bold 25px Georgia, serif';
  ctx.fillText('THE LIASSE RESERVE NOTE', 790, 76);
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillText('IN SUNSET WE TRUST', 790, 104);
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText('100', 82, 80);
  ctx.fillText('100', 82, H - 46);
  ctx.fillStyle = '#4f8a5c';
  ctx.font = 'bold 130px Georgia, serif';
  ctx.fillText('100', 800, 300);
  ctx.font = '22px "Courier New", monospace';
  ctx.fillText('LL 19112026 A', 790, 345);
  ctx.fillStyle = ink;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('100', 945, H - 46);
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('One Hundred Bucks', 790, 385);

  if (withBand) band(ctx, W / 2, 96, H, { text: true });
  if (glow) { hotspot(ctx, W, H, 0.7); rim(ctx, W, H); }
  return c;
}

// Tranches : feuilles empilées
function paperCanvas(W, H, withBand, seed) {
  const r = rand(seed);
  const [c, ctx] = cnv(W, H);
  ctx.fillStyle = '#f6efdf';
  ctx.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 2) {
    const l = 86 + r() * 12;
    ctx.fillStyle = `hsla(${38 + r() * 8}, 40%, ${l}%, ${0.3 + r() * 0.6})`;
    ctx.fillRect(0, y, W, 1 + (r() > 0.8 ? 1 : 0));
  }
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = 'rgba(150,125,85,.16)';
    ctx.fillRect(0, r() * H, W, 1);
  }
  hotspot(ctx, W, H, 1);
  if (withBand) band(ctx, W / 2, 96, H, { stars: true });
  rim(ctx, W, H);
  return c;
}

function palmCanvas(seed) {
  const r = rand(seed);
  const [c, ctx] = cnv(512, 1024);
  const col = '#0d0316';
  const lean = (r() - 0.5) * 140;
  ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    ctx.lineWidth = 34 - t * 16;
    ctx.beginPath();
    ctx.moveTo(256 + lean * t * t, 1024 - t * 760);
    ctx.lineTo(256 + lean * (t + 0.03) ** 2, 1024 - (t + 0.03) * 760);
    ctx.stroke();
  }
  const tx = 256 + lean, ty = 264;
  ctx.fillStyle = col;
  const fronds = 9;
  for (let f = 0; f < fronds; f++) {
    const a = -Math.PI + (f / (fronds - 1)) * Math.PI + (r() - 0.5) * 0.25;
    const len = 190 + r() * 60;
    const droop = 0.9 + r() * 0.4;
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.45 + len * 0.35 * droop * Math.abs(Math.cos(a));
    const mx = tx + Math.cos(a) * len * 0.5, my = ty + Math.sin(a) * len * 0.5 - 30;
    const nx = -Math.sin(a), ny = Math.cos(a);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(mx + nx * 26, my + ny * 26, ex, ey);
    ctx.quadraticCurveTo(mx - nx * 12, my - ny * 12 + 20, tx, ty);
    ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = col;
    for (let k = 2; k < 11; k++) {
      const t = k / 11;
      const px = tx + (ex - tx) * t, py = ty + (ey - ty) * t - Math.sin(t * Math.PI) * 26;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + nx * 34 * (1 - t) + 8, py + 30 * (1 - t) + 14); ctx.stroke();
    }
  }
  ctx.beginPath(); ctx.arc(tx, ty + 6, 18, 0, Math.PI * 2); ctx.fill();
  return c;
}

function skylineCanvas() {
  const r = rand(7);
  const W = 2048, H = 512;
  const [c, ctx] = cnv(W, H);
  let x = 0;
  while (x < W) {
    const w = 40 + r() * 90;
    const h = 60 + r() * (r() > 0.85 ? 330 : 190);
    ctx.fillStyle = '#1a0628';
    ctx.fillRect(x, H - h, w, h);
    for (let wy = H - h + 10; wy < H - 6; wy += 14) {
      for (let wx = x + 6; wx < x + w - 8; wx += 12) {
        if (r() > 0.72) {
          ctx.fillStyle = r() > 0.5 ? 'rgba(255,120,200,.85)' : r() > 0.5 ? 'rgba(80,230,255,.8)' : 'rgba(255,210,140,.8)';
          ctx.fillRect(wx, wy, 5, 7);
        }
      }
    }
    if (r() > 0.75) {
      ctx.fillStyle = r() > 0.5 ? '#ff2e88' : '#22e4ff';
      ctx.fillRect(x + 4, H - h - 4, w - 8, 4);
    }
    x += w + 2 + r() * 10;
  }
  return c;
}

function toTex(c, renderer) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (renderer) t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
function radialTex(stops, size = 256) {
  const [c, ctx] = cnv(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return toTex(c);
}

/* =========================================================
   Socle : hexagone facetté irrégulier (antiprisme)
   ========================================================= */
function baseGeometry() {
  const r = rand(42);
  const n = 6;
  const ring = (rad, y, off, jitter) => Array.from({ length: n }, (_, i) => {
    const a = off + (i / n) * Math.PI * 2;
    const rr = rad * (1 + (r() - 0.5) * jitter);
    return new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr);
  });
  const b = ring(1.5, 0, 0, 0.08);
  const m = ring(1.74, 0.17, Math.PI / n, 0.1);
  const t = ring(1.56, 0.4, 0.12, 0.08);
  const pos = [];
  const tri = (p, q, s) => pos.push(p.x, p.y, p.z, q.x, q.y, q.z, s.x, s.y, s.z);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    tri(b[i], m[i], b[j]); tri(m[i], m[j], b[j]);
    tri(m[i], t[i], m[j]); tri(t[i], t[j], m[j]);
  }
  const top = new THREE.Vector3(0, 0.4, 0), bot = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    tri(top, t[j], t[i]);
    tri(bot, b[i], b[j]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/* =========================================================
   Scène
   ========================================================= */
export function mountScene(canvasEl, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14061f);
  scene.fog = new THREE.Fog(0x2a0a3d, 18, 70);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

  const vtx = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }';

  /* --- Ciel --- */
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 120),
    new THREE.ShaderMaterial({
      fog: false, depthWrite: false, vertexShader: vtx,
      fragmentShader: `
        varying vec2 vUv;
        void main(){
          float y = vUv.y;
          vec3 c = mix(vec3(1.0,0.55,0.32), vec3(0.95,0.22,0.48), smoothstep(0.0,0.12,y));
          c = mix(c, vec3(0.42,0.08,0.52), smoothstep(0.12,0.3,y));
          c = mix(c, vec3(0.08,0.02,0.14), smoothstep(0.3,0.6,y));
          gl_FragColor = vec4(pow(c, vec3(2.2)), 1.);
        }`,
    })
  );
  sky.position.set(0, 58, -90);
  scene.add(sky);

  /* --- Soleil rayé --- */
  const sunMat = new THREE.ShaderMaterial({
    fog: false, transparent: true, depthWrite: false, vertexShader: vtx,
    uniforms: { uTime: { value: 0 } },
    fragmentShader: `
      uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 p = vUv*2.-1.;
        if (length(p) > 1.) discard;
        vec3 c = mix(vec3(1.0,0.18,0.55), vec3(1.0,0.86,0.35), smoothstep(-0.9,0.8,p.y));
        if (p.y < 0.15) {
          float s = fract((p.y - uTime*0.05) * 9.);
          float gap = mix(0.05, 0.6, smoothstep(0.15,-1.,p.y));
          if (s < gap) discard;
        }
        gl_FragColor = vec4(pow(c, vec3(2.2))*1.6, 1.);
      }`,
  });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), sunMat);
  sun.position.set(0, 12, -80);
  scene.add(sun);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTex([[0, 'rgba(255,90,150,.55)'], [0.4, 'rgba(255,60,130,.18)'], [1, 'rgba(0,0,0,0)']]),
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  sunGlow.scale.set(80, 80, 1);
  sunGlow.position.set(0, 12, -82);
  scene.add(sunGlow);

  /* --- Skyline --- */
  const skyline = new THREE.Mesh(
    new THREE.PlaneGeometry(170, 13),
    new THREE.MeshBasicMaterial({ map: toTex(skylineCanvas()), transparent: true, fog: false, depthWrite: false })
  );
  skyline.position.set(0, 6.4, -72);
  scene.add(skyline);

  /* --- Sol : grille néon qui défile --- */
  const gridMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader: `
      uniform float uTime; varying vec3 vW;
      float ln(float c){ float d = abs(fract(c-0.5)-0.5)/fwidth(c); return 1.-min(d/1.3,1.); }
      void main(){
        vec2 p = vW.xz/1.7; p.y -= uTime*0.8;
        float g = max(ln(p.x), ln(p.y));
        float far = smoothstep(65., 4., -vW.z + abs(vW.x)*0.3);
        float near = smoothstep(2.0, 4.5, length(vW.xz));
        vec3 base = vec3(0.05,0.008,0.09);
        vec3 col = mix(vec3(1.0,0.12,0.55), vec3(0.5,0.2,1.0), smoothstep(0.,40.,-vW.z));
        float refl = exp(-abs(vW.x)*0.18) * smoothstep(0., 60., -vW.z) * 0.35;
        vec3 c = base + col * g * far * (0.35 + 0.65*near) * 1.6 + vec3(1.0,0.35,0.45)*refl;
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 160), gridMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -50;
  scene.add(floor);

  /* --- Palmiers --- */
  const palmTex = [toTex(palmCanvas(3)), toTex(palmCanvas(11)), toTex(palmCanvas(23))];
  const palms = [];
  [
    [-6.5, -3, 6.5], [-10, -8, 8], [-5, -14, 7.5], [-15, -18, 10], [-24, -28, 12], [-34, -40, 13],
    [7, -4, 7], [11.5, -9, 8.5], [6, -16, 7.5], [17, -22, 10.5], [26, -30, 12], [36, -42, 13],
  ].forEach(([x, z, h], i) => {
    const mat = new THREE.MeshBasicMaterial({ map: palmTex[i % 3], transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(h / 2, h);
    geo.translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, 0, z);
    m.userData.phase = i * 1.7;
    m.userData.flip = x < 0 ? -1 : 1;
    scene.add(m);
    palms.push(m);
  });

  /* --- Lumières --- */
  scene.add(new THREE.HemisphereLight(0x9a7cff, 0x1a0b2e, 0.7));
  const pink = new THREE.DirectionalLight(0xff3d9a, 3.2); pink.position.set(-6, 3, 1); scene.add(pink);
  const cyan = new THREE.DirectionalLight(0x29e6ff, 2.4); cyan.position.set(6, 2.5, -2); scene.add(cyan);
  const key = new THREE.DirectionalLight(0xffe2c0, 0.6);
  key.position.set(2, 8, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
  scene.add(key);

  /* --- Lampe --- */
  const lamp = new THREE.Group();
  lamp.rotation.x = 0.12;
  scene.add(lamp);

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0b0a0d, roughness: 0.5, metalness: 0.25 });
  const base = new THREE.Mesh(baseGeometry(), baseMat);
  base.castShadow = true; base.receiveShadow = true;
  lamp.add(base);

  // bouton tactile (pictogramme power)
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x1a140c, emissive: 0xffb04a, emissiveIntensity: 2, metalness: 0.6, roughness: 0.3 });
  const btn = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.014, 10, 40, Math.PI * 1.6), btnMat);
  ring.rotation.z = Math.PI / 2 + Math.PI * 0.2;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.08, 0.01), btnMat);
  bar.position.y = 0.06;
  btn.add(ring, bar);
  btn.rotation.x = -Math.PI / 2;
  btn.position.set(0.75, 0.404, 0.85);
  lamp.add(btn);

  const poolMat = new THREE.MeshBasicMaterial({
    map: radialTex([[0, 'rgba(255,200,130,1)'], [0.4, 'rgba(255,150,70,.5)'], [1, 'rgba(255,120,40,0)']]),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), poolMat);
  pool.rotation.x = -Math.PI / 2; pool.position.y = 0.405;
  lamp.add(pool);

  const groundGlow = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({
    map: radialTex([[0, 'rgba(255,170,90,.55)'], [0.35, 'rgba(255,60,150,.22)'], [1, 'rgba(0,0,0,0)']]),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  groundGlow.rotation.x = -Math.PI / 2; groundGlow.position.y = 0.01;
  lamp.add(groundGlow);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.5 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.012; shadow.receiveShadow = true;
  lamp.add(shadow);

  // liasse
  const L = 2.3, Hh = 0.98, D = 0.98;
  const topTex = toTex(billCanvas(), renderer);
  const sideA = toTex(paperCanvas(1024, 436, true, 5), renderer);
  const sideB = toTex(paperCanvas(1024, 436, true, 9), renderer);
  const endTex = toTex(paperCanvas(512, 512, false, 13), renderer);
  const mk = (map) => new THREE.MeshStandardMaterial({
    map, color: 0x8a8a8a, emissiveMap: map, emissive: new THREE.Color(0xffc27a), emissiveIntensity: 1, roughness: 0.85,
  });
  const stackMats = [mk(endTex), mk(endTex), mk(topTex), mk(topTex), mk(sideA), mk(sideB)];
  const stack = new THREE.Mesh(new THREE.BoxGeometry(L, Hh, D), stackMats);
  stack.castShadow = true;
  const pivot = new THREE.Group();
  pivot.add(stack);
  lamp.add(pivot);
  const FLOAT_Y = 0.4 + 0.5 + Hh / 2;

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTex([[0, 'rgba(255,205,140,.7)'], [0.35, 'rgba(255,150,80,.25)'], [1, 'rgba(255,120,60,0)']]),
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  halo.scale.set(5.5, 3.6, 1);
  pivot.add(halo);
  const inner = new THREE.PointLight(0xffb066, 8, 7, 1.6);
  inner.position.y = -0.5;
  pivot.add(inner);

  /* --- Billets volants --- */
  const billTex = toTex(billCanvas({ withBand: false, glow: false }), renderer);
  const MAX_BILLS = 90;
  const bills = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.66, 0.29),
    new THREE.MeshBasicMaterial({ map: billTex, side: THREE.DoubleSide, color: 0xd8d2c6, fog: false }),
    MAX_BILLS
  );
  bills.frustumCulled = false;
  scene.add(bills);
  const dummy = new THREE.Object3D();
  const nAmbient = isMobile() ? 10 : 18;
  const B = Array.from({ length: MAX_BILLS }, (_, i) => ({ active: false, ambient: i < nAmbient }));
  function spawn(b, burst) {
    b.active = true;
    b.burst = burst;
    if (burst) {
      b.p = new THREE.Vector3((Math.random() - 0.5) * 0.6, FLOAT_Y + 0.4, (Math.random() - 0.5) * 0.4);
      const a = Math.random() * Math.PI * 2;
      const s = 3 + Math.random() * 4;
      b.v = new THREE.Vector3(Math.cos(a) * s * 0.6, 5 + Math.random() * 4, Math.sin(a) * s * 0.4 + 1.2);
    } else {
      b.p = new THREE.Vector3((Math.random() - 0.5) * 22, 8 + Math.random() * 8, -3 - Math.random() * 14);
      b.v = new THREE.Vector3(0, -(0.5 + Math.random() * 0.6), 0);
    }
    b.r = new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    b.w = new THREE.Vector3(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    b.phase = Math.random() * 10;
  }
  if (!reduce) B.forEach((b) => { if (b.ambient) { spawn(b, false); b.p.y = Math.random() * 14; } });
  function moneyBurst(n = 40) {
    if (reduce) return;
    let c = 0;
    for (const b of B) { if (!b.ambient && !b.active) { spawn(b, true); if (++c >= n) break; } }
  }

  /* --- Bloom néon --- */
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(4, 4, { samples: 4, type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.8, 0.5, 0.8);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* --- Interaction --- */
  let on = true, glow = 0, flicker = 0;
  let spin = -0.5, vel = 0, dragging = false, lastX = 0, mx = 0, my = 0;
  const dragEl = opts.dragTarget || canvasEl;
  dragEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a, input, .hero__copy')) return;
    dragging = true; lastX = e.clientX;
  });
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    vel = dx * 0.006; spin += vel;
  }, { passive: true });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointercancel', () => { dragging = false; });

  let scrollP = 0;
  const hero = canvasEl.closest('section');
  window.addEventListener('scroll', () => {
    const r = hero.getBoundingClientRect();
    scrollP = Math.min(1, Math.max(0, -r.top / r.height));
  }, { passive: true });

  /* --- Cadrage : lampe à gauche (desktop) ou centrée (mobile) --- */
  let frame = { tx: 0.5, ty: 0.5, f: 0.8, fh: 0.6 };
  function resize() {
    const w = canvasEl.clientWidth, h = canvasEl.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    frame = isMobile() ? { tx: 0.5, ty: 0.5, f: 0.82, fh: 0.6 } : { tx: 0.3, ty: 0.56, f: 0.34, fh: 0.48 };
    camera.setViewOffset(w, h, w * (0.5 - frame.tx), h * (0.5 - frame.ty), w, h);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvasEl);
  resize();

  function cameraDist() {
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return Math.max(2.1 / (t * camera.aspect * frame.f), 1.4 / (t * frame.fh));
  }

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvasEl);

  /* --- Boucle --- */
  const clock = new THREE.Clock();
  const INTRO = reduce ? 0 : 2.6;
  let ready = false;
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const back = (x) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

  function loop() {
    requestAnimationFrame(loop);
    if (!visible) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const intro = INTRO ? Math.min(1, t / INTRO) : 1;

    // caméra : travelling d'intro + parallax + scroll
    const d = cameraDist();
    const ci = ease(Math.min(1, intro * 1.15));
    camera.position.set(mx * 0.8 - (1 - ci) * 3, 1 + d * 0.2 + (1 - ci) * 3 + scrollP * 2.5 - my * 0.4, d * (1 + (1 - ci) * 1.6));
    camera.lookAt(0, 1.0 + scrollP * 0.5, 0);

    // la liasse tombe puis lévite
    const drop = Math.min(1, Math.max(0, (intro - 0.25) / 0.45));
    pivot.position.y = FLOAT_Y + (1 - back(drop)) * 4 + (reduce ? 0 : Math.sin(t * 1.5) * 0.06 * drop);
    if (!dragging) { vel *= 0.94; spin += vel + (reduce ? 0 : dt * 0.4); }
    pivot.rotation.y = spin + scrollP * Math.PI;
    stack.rotation.z = reduce ? 0 : Math.sin(t * 0.9) * 0.015;

    // allumage avec scintillement néon
    const want = on && intro > 0.62 ? 1 : 0;
    glow += (want - glow) * Math.min(1, dt * 5);
    if (flicker > 0) flicker -= dt;
    let g = glow;
    if (want && (intro < 0.8 || flicker > 0)) g *= Math.random() > 0.35 ? 1 : 0.15;
    stackMats.forEach((m) => { m.emissiveIntensity = 0.06 + g * 0.88; });
    inner.intensity = g * 8;
    halo.material.opacity = g * 0.9;
    poolMat.opacity = 0.08 + g * 0.5;
    btnMat.emissiveIntensity = 0.4 + g * 2;
    bloom.strength = 0.5 + g * 0.35;

    // décor animé
    sunMat.uniforms.uTime.value = t;
    gridMat.uniforms.uTime.value = reduce ? 0 : t;
    palms.forEach((p) => {
      p.lookAt(camera.position.x, p.position.y, camera.position.z);
      p.rotateZ(reduce ? 0 : Math.sin(t * 0.8 + p.userData.phase) * 0.025);
      p.scale.x = p.userData.flip;
    });

    // billets
    B.forEach((b, i) => {
      if (!b.active) { dummy.position.set(0, -50, 0); dummy.updateMatrix(); bills.setMatrixAt(i, dummy.matrix); return; }
      if (b.burst) { b.v.y = Math.max(-1.6, b.v.y - 9.8 * dt * 0.55); b.v.x *= 0.985; b.v.z *= 0.985; }
      b.p.addScaledVector(b.v, dt);
      b.p.x += Math.sin(t * 1.3 + b.phase) * dt * 0.5;
      b.r.x += b.w.x * dt; b.r.y += b.w.y * dt; b.r.z += b.w.z * dt;
      if (b.p.y < -0.5) { if (b.ambient) spawn(b, false); else b.active = false; }
      dummy.position.copy(b.p); dummy.rotation.copy(b.r); dummy.scale.setScalar(b.burst ? 1 : 1.4);
      dummy.updateMatrix();
      bills.setMatrixAt(i, dummy.matrix);
    });
    bills.instanceMatrix.needsUpdate = true;

    composer.render();
    if (!ready) { ready = true; window.__lampReady = true; window.dispatchEvent(new Event('lamp:ready')); }
  }
  loop();

  return {
    toggle() { on = !on; if (on) flicker = 0.45; return on; },
    burst: moneyBurst,
  };
}

/* Montage */
const el = document.getElementById('lamp-canvas');
if (el) {
  document.fonts.ready.then(() => {
    try {
      window.Lamp = mountScene(el, { dragTarget: el.closest('section') });
      document.documentElement.classList.add('has-3d');
    } catch (err) {
      console.error(err);
      document.documentElement.classList.add('no-webgl');
      window.__lampReady = true;
      window.dispatchEvent(new Event('lamp:ready'));
    }
  });
}
