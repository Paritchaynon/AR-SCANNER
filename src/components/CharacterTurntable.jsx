import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Expand, X } from 'lucide-react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// The turntable owns the model group, so an FBX can replace the mock geometry.
export default function CharacterTurntable({ portrait }) {
  const { t } = useTranslation();
  const viewer = useRef(null);
  const expandButton = useRef(null);
  async function collapse() {
    const dialog = viewer.current;
    if (!dialog.matches(':modal') || dialog.classList.contains('is-collapsing')) return;
    dialog.classList.add('is-collapsing');
    await Promise.allSettled(dialog.getAnimations().map(animation => animation.finished));
    if (!dialog.isConnected) return;
    dialog.close();
    dialog.show();
    dialog.classList.remove('is-collapsing');
    expandButton.current.focus();
  }
  const mount = useRef(null);
  useEffect(() => {
    const host = mount.current;
    if (!viewer.current.open) viewer.current.show();
    const T = window.AFRAME.THREE;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(148, 132, false);
    host.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 148 / 132, .1, 20);
    camera.position.set(0, 1.55, 4.4);
    camera.lookAt(0, 1, 0);
    const model = new T.Group();
    scene.add(model);
    function part(geometry, color, x, y, z) {
      const mesh = new T.Mesh(geometry, new T.MeshStandardMaterial({ color, flatShading: true }));
      mesh.position.set(x, y, z);
      model.add(mesh);
      return mesh;
    }
    part(new T.CylinderGeometry(.64, .72, .1, 32), 0xa57840, 0, .04, 0);
    part(new T.ConeGeometry(.48, 1.04, 8), 0x8e3543, 0, .62, 0);
    part(new T.IcosahedronGeometry(.32, 1), 0xffd399, 0, 1.39, 0);
    part(new T.ConeGeometry(.34, .56, 8), 0xe2a843, 0, 1.86, 0);
    for (const side of [-1, 1]) {
      part(new T.OctahedronGeometry(.18), 0xe9b857, side * .32, .98, 0);
      part(new T.SphereGeometry(.035, 8, 6), 0x382322, side * .115, 1.43, .28);
    }
    scene.add(new T.HemisphereLight(0xfff4d6, 0xa25861, 2));
    const key = new T.DirectionalLight(0xffefd0, 2.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 1.6;
    controls.maxDistance = 7;
    controls.autoRotateSpeed = 2.8;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let resumeAt = 0;
    controls.addEventListener('start', () => { resumeAt = Infinity; });
    controls.addEventListener('end', () => { resumeAt = performance.now() + 2400; });
    const resize = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resize.observe(host);
    let last = performance.now();
    renderer.setAnimationLoop(() => {
      const now = performance.now();
      const ramp = Math.min(1, Math.max(0, (now - resumeAt) / 850));
      controls.autoRotate = !motion.matches && ramp > 0;
      controls.autoRotateSpeed = 2.8 * ramp * ramp * (3 - 2 * ramp);
      controls.update(Math.min(.05, (now - last) / 1000));
      last = now;
      renderer.render(scene, camera);
    });
    return () => {
      resize.disconnect();
      controls.dispose();
      renderer.setAnimationLoop(null);
      model.children.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);
  return <dialog className="turntable-viewer" ref={viewer} aria-label={t('viewModel')}
    onCancel={event => { event.preventDefault(); collapse(); }}>
    <div className="character-turntable" ref={mount}>
      {portrait && <img src={portrait} alt="" />}
    </div>
    <button className="turntable-expand" ref={expandButton} aria-label={t('viewModel')}
      onClick={() => { viewer.current.close(); viewer.current.showModal(); }}>
      <Expand size={17} />
    </button>
    <button className="turntable-close" aria-label={t('close')} onClick={collapse}><X /></button>
    <p className="turntable-hint">{t('modelGestureHint')}</p>
  </dialog>;
}
