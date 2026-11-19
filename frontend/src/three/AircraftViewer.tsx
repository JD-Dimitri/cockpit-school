/**
 * Visionneuse 3D (Three.js) : silhouette schématique d'un appareil à l'échelle de ses dimensions
 * (longueur, envergure ou diamètre du rotor, lues dans data/aircraft.json).
 * La forme est [SIMULÉ] (volumes simples) ; les modèles détaillés glTF viendront avec le poste photoréaliste.
 * Glisser pour tourner, molette ou pincement pour zoomer.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Aircraft } from '../data';

function build(ac: Aircraft): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xe9eef2, roughness: 0.45, metalness: 0.15 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b3a47, roughness: 0.6 });
  const L = ac.ext.len;
  if (ac.kind === 'fw') {
    const span = ac.ext.span ?? L;
    const r = Math.max(0.6, L * 0.055);
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.55, L, 24), body);
    fus.rotation.z = Math.PI / 2;
    g.add(fus);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 12), body);
    nose.position.x = L / 2;
    nose.scale.set(1.4, 1, 1);
    g.add(nose);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(L * 0.16, r * 0.18, span), body);
    wing.position.set(L * 0.03, -r * 0.4, 0);
    g.add(wing);
    const tailH = new THREE.Mesh(new THREE.BoxGeometry(L * 0.08, r * 0.12, span * 0.34), body);
    tailH.position.set(-L * 0.44, r * 0.2, 0);
    g.add(tailH);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(L * 0.1, L * 0.14, r * 0.12), body);
    fin.position.set(-L * 0.43, r + L * 0.06, 0);
    g.add(fin);
    if (ac.twin !== false && span > 15) {
      for (const s of [-1, 1]) {
        const eng = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.4, L * 0.08, 16), dark);
        eng.rotation.z = Math.PI / 2;
        eng.position.set(L * 0.08, -r * 0.95, (s * span) / 4.2);
        g.add(eng);
      }
    }
  } else {
    const rotor = ac.ext.rotor ?? L * 0.8;
    const cab = new THREE.Mesh(new THREE.SphereGeometry(L * 0.13, 24, 16), body);
    cab.scale.set(1.5, 1, 1);
    cab.position.x = L * 0.18;
    g.add(cab);
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(L * 0.025, L * 0.04, L * 0.6, 12), body);
    boom.rotation.z = Math.PI / 2;
    boom.position.x = -L * 0.2;
    g.add(boom);
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(rotor / 2, rotor / 2, 0.05, 48),
      new THREE.MeshBasicMaterial({ color: 0x3fd0ff, transparent: true, opacity: 0.18 }),
    );
    disc.position.set(L * 0.15, L * 0.16, 0);
    g.add(disc);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(rotor * 0.09, rotor * 0.09, 0.04, 24), dark);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(-L * 0.5, L * 0.04, 0.3);
    g.add(tail);
  }
  return g;
}

export function AircraftViewer({ ac }: { ac: Aircraft }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      el.textContent = 'La 3D (WebGL) n’est pas disponible sur cet appareil.';
      return;
    }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xdfefff, 0x1a2430, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(30, 50, 20);
    scene.add(sun);
    const model = build(ac);
    scene.add(model);
    const size = Math.max(ac.ext.len, ac.ext.span ?? 0, ac.ext.rotor ?? 0);
    const grid = new THREE.GridHelper(size * 1.6, 16, 0x3fd0ff, 0x24384a);
    grid.position.y = -size * 0.12;
    scene.add(grid);
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, size * 20);
    let yaw = 0.9, pitch = 0.42, dist = size * 1.55;
    const place = () => {
      cam.position.set(dist * Math.cos(pitch) * Math.cos(yaw), dist * Math.sin(pitch), dist * Math.cos(pitch) * Math.sin(yaw));
      cam.lookAt(0, 0, 0);
    };
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      cam.aspect = w / Math.max(1, h);
      cam.updateProjectionMatrix();
    };
    let drag: { x: number; y: number } | null = null;
    const cv = renderer.domElement;
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY };
      cv.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      yaw += (e.clientX - drag.x) * 0.01;
      pitch = Math.max(-0.2, Math.min(1.4, pitch + (e.clientY - drag.y) * 0.01));
      drag = { x: e.clientX, y: e.clientY };
    };
    const up = () => (drag = null);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      dist = Math.max(size * 0.6, Math.min(size * 4, dist * (1 + Math.sign(e.deltaY) * 0.1)));
    };
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('wheel', wheel, { passive: false });
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let raf = 0;
    const loop = () => {
      if (!drag) yaw += 0.003;
      place();
      renderer.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | undefined;
        mat?.dispose?.();
      });
      renderer.dispose();
      cv.remove();
    };
  }, [ac]);
  return <div className="viewer" ref={host} role="img" aria-label={'Silhouette 3D schématique : ' + ac.name} />;
}
