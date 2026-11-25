import { useEffect, useRef } from 'react';

// The turntable owns the model group, so an FBX can replace the mock geometry.
export default function CharacterTurntable({ portrait }) {
  const mount = useRef(null);
  useEffect(() => {
    const host = mount.current;
    const T = window.AFRAME.THREE;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(148, 132);
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
    renderer.render(scene, camera);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const start = performance.now();
      renderer.setAnimationLoop(() => {
        model.rotation.y = (performance.now() - start) * .00055;
        renderer.render(scene, camera);
      });
    }
    return () => {
      renderer.setAnimationLoop(null);
      model.children.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);
  return <div className="character-turntable" ref={mount} aria-hidden="true">
    {portrait && <img src={portrait} alt="" />}
  </div>;
}
