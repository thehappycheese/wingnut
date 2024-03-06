import * as THREE from 'three';

import { better_axis } from './better_axis';

import { Oscilloscope } from './oscilloscope';
import { Controls } from './controls';
import * as sim from './flight_simulation';
import { setup_scene } from './scene_setup';



const oscilloscope = new Oscilloscope(document.querySelector("#oscilloscope")!);
const controls = new Controls();
let {renderer, scene, camera} = setup_scene(
    document.getElementById('game-view')!
);
camera.position.z = 10;
camera.position.y = 40;

// ==============================
// LIGHTING
const sunlight = new THREE.DirectionalLight(0xffffff, 1.0); // White sunlight
sunlight.position.set(0, 1, 0); // Positioned above the scene, shining down
scene.add(sunlight);
const ambient_light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient_light);


// ===============================
// MODELS

const player_model = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
scene.add(player_model);

for (let i = 0; i < 250; i++) {
    const randomSize = THREE.MathUtils.randFloatSpread(2) + 3; // Random size between -1 and 1, adjust if needed
    const geometry = new THREE.BoxGeometry(randomSize,randomSize,randomSize);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff }); // Blue color
    const box = new THREE.Mesh(geometry, material);

    // Set random positions for the boxes
    box.position.x = THREE.MathUtils.randFloatSpread(30); // Random position in x, within a spread of 20
    box.position.y = THREE.MathUtils.randFloatSpread(150); // Random position in y
    box.position.z = THREE.MathUtils.randFloatSpread(30); // Random position in z

    scene.add(box);
}

const orientation_indicator = better_axis(0xFF0000);
scene.add(orientation_indicator);

const yellow_arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xFFFF00);
yellow_arrow.position.z = 0
scene.add(yellow_arrow);

const origin_axis_helper = new THREE.AxesHelper(3);
scene.add(origin_axis_helper);





const DRAG = 0.995;
const GRAVITY = new THREE.Vector3(0, -0.0015, 0);
const ROTATION_SPEED = 0.05;

// ==========================
// ANIMATED VARIABLES

let camera_direction = new THREE.Quaternion(0, 0, 0, 1);
let camera_velocity = new THREE.Vector3(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    controls.poll_controller();
    // oscilloscope.update_probe("ax-h", left_axes.x, 1,-1);
    // oscilloscope.update_probe("ax-v", left_axes.y, 1,-1);

    let left_axes = controls.get_left_axes();
    let roll_axis = controls.get_trigger_axis();

    let rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), left_axes.x*ROTATION_SPEED);
    camera_direction.multiply(rotationQuaternion).normalize();

    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), left_axes.y*ROTATION_SPEED);
    camera_direction.multiply(rotationQuaternion).normalize();

    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll_axis*ROTATION_SPEED*0.5);
    camera_direction.multiply(rotationQuaternion).normalize();

    let camera_up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera_direction);
    let camera_forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera_direction);

    let world_up = new THREE.Vector3(0, 1, 0);
    
    // let correction_axis = camera_up.clone().cross(world_up);

    // let angle_from_up = camera_up.angleTo(world_up);
    // if (angle_from_up>Math.PI/2) {
    //     let correction_rotation = new THREE.Quaternion();
    //     correction_rotation.setFromAxisAngle(correction_axis, (angle_from_up-Math.PI/2) / 30);
    //     camera_direction.multiply(correction_rotation);
    // }

    var lift = Math.max(-0.5,Math.min(0.5, -sim.lift(camera_velocity, camera_forward, camera_up)*10));
    
    // move the camera forward in its forward direction,
    // in proportion to its angle relative to the horizon
    let angle_from_horizon = camera_forward.angleTo(world_up);
    // let acceleration = Math.max(
    //     angle_from_horizon - Math.PI/2,
    //     0
    // ) * COEFFICIENT_OF_SLIPPYSLIDE;

    //camera_velocity.add(camera_forward.multiplyScalar(acceleration));
    camera_velocity.add(camera_up.clone().multiplyScalar(lift));
    camera_velocity.add(GRAVITY);
    camera_velocity.multiplyScalar(DRAG);

    camera.position.add(camera_velocity);

    // rotate camera to match plater directionww
    camera.setRotationFromQuaternion(camera_direction);


    orientation_indicator.setRotationFromQuaternion(camera_direction);
    oscilloscope.update_probe("altitude"           , camera.position.y, -80, 80);
    //oscilloscope.update_probe("angle forward up"   , angle_from_horizon, 0, Math.PI);
    //oscilloscope.update_probe("acceleration"       , -acceleration, -0.05, 0.05);
    oscilloscope.update_probe("speed"              , camera_velocity.length(),0, 0.5);
    //let forward_velocity_component = camera_velocity.clone().projectOnVector(camera_backward);
    oscilloscope.update_probe("lift", lift*1000, -2, 5);
    
    let forward_speed = camera_velocity.dot(camera_forward);
    let upward_speed = camera_velocity.dot(camera_up);
    let angle_of_attack =  Math.atan2(-upward_speed, forward_speed);
    oscilloscope.update_probe("forward_speed", forward_speed,-0.1,0.2)
    oscilloscope.update_probe("upward_speed", upward_speed,-0.1,0.2)
    oscilloscope.update_probe("angle_of_attack", angle_of_attack, -Math.PI, Math.PI)    
    
    //indicator2.setRotationFromQuaternion(camera_direction);
    oscilloscope.update_chart(0.5)
    renderer.render(scene, camera);
}

animate();
