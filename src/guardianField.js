import 'aframe';

const { THREE } = window.AFRAME;

// The marker's local XY plane is the card. Positive Z rises off its surface.
window.AFRAME.registerComponent('guardian-field', {
  init() {
    const vertices = [];
    const colors = [];
    for (let i = 0; i < 360; i++) {
      const t = (i % 120) / 119;
      const strand = Math.floor(i / 120);
      const angle = t * Math.PI * 4 + strand * Math.PI * 2 / 3;
      const radius = .08 + .24 * Math.sin(Math.PI * t);
      vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, .06 + t * .54);
      colors.push(...(strand === 0 ? [1, .72, .32] : [.38, .96, 1]));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: .009, vertexColors: true, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.field = new THREE.Points(geometry, material);
    this.el.setObject3D('particles', this.field);
  },
  tick(time) {
    this.field.rotation.z = time * .00075;
    this.field.scale.z = 1 + .09 * Math.sin(time * .002);
  },
  remove() {
    this.el.removeObject3D('particles');
    this.field.geometry.dispose();
    this.field.material.dispose();
  },
});
