import 'aframe';

const { THREE } = window.AFRAME;

// Each shard has a tilted waist and two tips along the marker's local Z axis.
window.AFRAME.registerComponent('guardian-field', {
  init() {
    const lines = [];
    const colors = [];
    const sparks = [];
    for (const [x, y, height, width] of [[0, 0, .62, .19], [-.29, .12, .32, .09], [.27, -.13, .38, .10]]) {
      const waist = [[x - width, y, .13], [x, y + width, .19],
        [x + width, y, .15], [x, y - width, .09]];
      for (let i = 0; i < waist.length; i++) {
        const edge = waist[i];
        const tip = [x + width * .6, y + width * .55, height];
        for (const end of [tip, [x, y, .015], waist[(i + 1) % 4]]) {
          lines.push(...edge, ...end);
          const color = i === 1 ? [1, .68, .24] : [.35, .96, 1];
          colors.push(...color, ...color);
        }
        for (let j = 0; j < 8; j++) {
          const t = j / 8;
          sparks.push(...edge.map((v, axis) => v + (tip[axis] - v) * t));
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const dust = new THREE.BufferGeometry();
    dust.setAttribute('position', new THREE.Float32BufferAttribute(sparks, 3));
    this.field = new THREE.Group();
    this.field.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ vertexColors: true })));
    this.field.add(new THREE.Points(dust, new THREE.PointsMaterial({ size: .014, color: 0xc7ffff })));
    this.age = 0;
    this.el.setObject3D('shards', this.field);
  },
  tick(_, delta) {
    this.age += delta || 0;
    const grow = Math.min(1, this.age / 180);
    this.field.scale.setScalar(.25 + .75 * grow);
    this.field.rotation.z = this.age * .0008;
    this.field.position.z = .03 + .04 * Math.sin(this.age * .003);
  },
  remove() {
    this.el.removeObject3D('shards');
    this.field.children.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
  },
});
