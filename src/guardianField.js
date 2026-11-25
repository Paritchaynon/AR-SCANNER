import 'aframe';

const { THREE } = window.AFRAME;

window.AFRAME.registerComponent('guardian-field', {
  init() {
    this.lantern = new THREE.Group();
    const bamboo = [];
    const paper = [];
    const fringe = [];
    const colors = [];
    const point = (i, radius, height) => {
      const angle = i * Math.PI / 4;
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
    };
    for (let i = 0; i < 8; i++) {
      const profile = [[.105, .27], [.21, .17], [.21, -.06], [.105, -.16]];
      for (let j = 0; j < profile.length - 1; j++) {
        const a = point(i, ...profile[j]), b = point(i + 1, ...profile[j]);
        const c = point(i, ...profile[j + 1]), d = point(i + 1, ...profile[j + 1]);
        paper.push(...a, ...b, ...d, ...a, ...d, ...c);
        bamboo.push(...a, ...b, ...a, ...c);
        const color = i % 2 ? [.96, .32, .11] : [1, .64, .21];
        for (let k = 0; k < 6; k++) colors.push(...color);
      }
      bamboo.push(...point(i,.105,-.16), ...point(i+1,.105,-.16));
      // Pendant paper strips taper to separate swallowtail points.
      const left = point(i,.104,-.16), right = point(i+.65,.104,-.16);
      const tip = point(i+.32,.115,-.38 - (i%2)*.045);
      fringe.push(...left, ...right, ...tip);
    }
    function geometry(vertices) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      return g;
    }
    const shade = geometry(paper);
    shade.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    this.lantern.add(
      new THREE.Mesh(shade, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: .86 })),
      new THREE.LineSegments(geometry(bamboo), new THREE.LineBasicMaterial({ color: 0xffe19a })),
      new THREE.Mesh(geometry(fringe), new THREE.MeshBasicMaterial({ color: 0xf2ad59, side: THREE.DoubleSide }))
    );
    this.age = 0;
    this.el.setObject3D('lantern', this.lantern);
  },
  tick(_, delta) {
    this.age += delta || 0;
    this.lantern.scale.setScalar(.4 + .6 * Math.min(1, this.age / 180));
    this.lantern.position.set(0, .045, .26 + .025 * Math.sin(this.age * .004));
    this.lantern.rotation.set(-.12, this.age * .0008, .07 * Math.sin(this.age * .004));
  },
  remove() {
    this.el.removeObject3D('lantern');
    this.lantern.children.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
  },
});
