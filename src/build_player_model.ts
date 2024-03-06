import * as THREE from 'three';

// ===============================
// MODELS
export function build_player_model() {
    const player_model = new THREE.Group();

    const head_geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const head_material = new THREE.MeshPhongMaterial({ color: 16776960 });
    const head = new THREE.Mesh(head_geometry, head_material);
    head.position.z = -1;
    player_model.add(head);

    const torso_geometry = new THREE.BoxGeometry(1, 0.2, 1);
    const torso_material = new THREE.MeshPhongMaterial({ color: 16711680 });
    const torso = new THREE.Mesh(torso_geometry, torso_material);
    player_model.add(torso);

    const scarf_geometry = new THREE.BoxGeometry(0.1, 0.1, 1);
    scarf_geometry.translate(0, 0, 0.5);
    const scarf_material = new THREE.MeshPhongMaterial({ color: 65280 });
    const scarf = new THREE.Mesh(scarf_geometry, scarf_material);
    scarf.position.z = -0.5;
    player_model.add(scarf);

    return { player_model, scarf };
}
