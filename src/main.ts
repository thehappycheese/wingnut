import * as THREE from 'three';
import { better_axis } from './better_axis';
import { Oscilloscope } from './oscilloscope';
import { Controls } from './controls';
import * as sim from './flight_simulation';
import { setup_scene } from './scene_setup';
import { build_player_model } from './build_player_model';

const oscilloscope = new Oscilloscope(document.querySelector("#oscilloscope")!);
const controls = new Controls();
let { renderer, scene, camera } = setup_scene(document.getElementById('game-view')!);

// ==============================
// LIGHTING
const sunlight = new THREE.DirectionalLight(0xffffff, 1.0);
sunlight.position.set(0, 1, 0);
scene.add(sunlight);
const ambient_light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient_light);

const {player_model, scarf} = build_player_model();
scene.add(player_model);

for (let i = 0; i < 250; i++) {
    const randomSize = THREE.MathUtils.randFloatSpread(2) + 3;
    const geometry = new THREE.BoxGeometry(randomSize, randomSize, randomSize);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const box = new THREE.Mesh(geometry, material);

    box.position.x = THREE.MathUtils.randFloatSpread(30);
    box.position.y = THREE.MathUtils.randFloatSpread(150);
    box.position.z = THREE.MathUtils.randFloatSpread(30);

    scene.add(box);
}

const orientation_indicator = better_axis(0xFF0000);
scene.add(orientation_indicator);

const yellow_arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xFFFF00);
yellow_arrow.position.z = 0;
scene.add(yellow_arrow);

const origin_axis_helper = new THREE.AxesHelper(3);
scene.add(origin_axis_helper);

const DRAG = 0.995;
const GRAVITY = new THREE.Vector3(0, -0.001, 0);
const ROTATION_SENSITIVITY = 0.05;
const ROLL_SENSITIVITY = 0.03;

// ==========================
// ANIMATED VARIABLES
let player_direction = new THREE.Quaternion(0, 0, 0, 1);
let player_velocity = new THREE.Vector3(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    controls.poll_controller();

    let left_axes = controls.get_left_axes();
    let roll_axis = controls.get_trigger_axis();

    let rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), left_axes.x * ROTATION_SENSITIVITY);
    player_direction.multiply(rotationQuaternion).normalize();

    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -left_axes.y * ROTATION_SENSITIVITY);
    player_direction.multiply(rotationQuaternion).normalize();

    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll_axis * ROLL_SENSITIVITY);
    player_direction.multiply(rotationQuaternion).normalize();

    let player_up = new THREE.Vector3(0, 1, 0).applyQuaternion(player_direction);
    let player_forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player_direction);

    let world_up = new THREE.Vector3(0, 1, 0);

    var lift = Math.max(-0.5, Math.min(0.5, -sim.lift(player_velocity, player_forward, player_up) * 10));

    player_velocity.add(player_up.clone().multiplyScalar(lift));
    player_velocity.add(GRAVITY);
    player_velocity.multiplyScalar(DRAG);

    player_model.position.add(player_velocity);
    player_model.setRotationFromQuaternion(player_direction);

    // Orient the scarf according to the wind
    const WIND_SENSITIVITY = 0.5;
    const relativeWind = player_velocity.clone().negate().applyQuaternion(player_model.quaternion.clone().invert());
    scarf.lookAt(scarf.position.clone().add(relativeWind.multiplyScalar(WIND_SENSITIVITY)));

     // Camera follows the player's orientation with influence from velocity
     const CAMERA_DISTANCE = 10;
     const CAMERA_LERP_FACTOR = 0.1;
     const VELOCITY_INFLUENCE = 0.2;
 
     const cameraOffset = new THREE.Vector3(0, 2, CAMERA_DISTANCE);
     const cameraTargetPosition = player_model.position.clone().add(cameraOffset.applyQuaternion(player_direction));
 
     const velocityOffset = player_velocity.clone().multiplyScalar(VELOCITY_INFLUENCE);
     cameraTargetPosition.add(velocityOffset);
 
     camera.position.lerp(cameraTargetPosition, CAMERA_LERP_FACTOR);
 
     const cameraLookAtPosition = player_model.position.clone();
     camera.lookAt(cameraLookAtPosition);

    orientation_indicator.setRotationFromQuaternion(player_direction);
    oscilloscope.update_probe("altitude", player_model.position.y, -80, 80);
    oscilloscope.update_probe("speed", player_velocity.length(), 0, 0.5);
    oscilloscope.update_probe("lift", lift * 1000, -2, 5);

    let forward_speed = player_velocity.dot(player_forward);
    let upward_speed = player_velocity.dot(player_up);
    let angle_of_attack = Math.atan2(-upward_speed, forward_speed);
    oscilloscope.update_probe("forward_speed", forward_speed, -0.1, 0.2);
    oscilloscope.update_probe("upward_speed", upward_speed, -0.1, 0.2);
    oscilloscope.update_probe("angle_of_attack", angle_of_attack, -Math.PI, Math.PI);

    oscilloscope.update_chart(0.5);
    renderer.render(scene, camera);
}

animate();