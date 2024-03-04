import * as THREE from 'three';

import { better_axis } from './better_axis';

import { Oscilloscope } from './oscilloscope';
import { Controls } from './controls';


const oscilloscope = new Oscilloscope(document.querySelector("#oscilloscope")!);
const controls = new Controls();

// Assuming 'game_dom_element' is the <div> where you want to place your scene
const game_dom_element = document.getElementById('game-view')!;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0x333333, 8, 100 );

// Adjusting camera aspect to match the element's aspect ratio
const aspectRatio = game_dom_element.clientWidth / game_dom_element.clientHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
camera.position.z = 10;
camera.position.y = 40;
// Setting up renderer to match the size of the element
const renderer = new THREE.WebGLRenderer();
renderer.setSize(game_dom_element.clientWidth, game_dom_element.clientHeight);
game_dom_element.appendChild(renderer.domElement);
//const controls = new ArcballControls(camera, renderer.domElement, scene);



// Create Skybox
// https://tools.wwwtyro.net/space-3d/index.html#animationSpeed=0.6559151245828791&fov=73.1318307411021&nebulae=true&pointStars=true&resolution=2048&seed=nbbdomweh28&stars=true&sun=false
const loader = new THREE.CubeTextureLoader();
const textureCube = loader.load(
    [
        'px',
		'nx',
		'py',
		'ny',
		'pz',
		'nz',
    ].map(item => new URL(`./texture/skybox_blender/${item}.png`, import.meta.url).href)
);
scene.background = textureCube;


// Create 50 boxes with random sizes
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


// // Create a red cube at the origin
const indicator = better_axis(0xFF0000);
scene.add(indicator);
const indicator2 = better_axis(0x00FF00);
scene.add(indicator2);
indicator2.position.x = 3;

// create arrowhelpwe
const yonk = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xFFFF00);
yonk.position.z = 0
scene.add(yonk);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);



// Add sunlight (directional light)
const sunlight = new THREE.DirectionalLight(0xffffff, 1.0); // White sunlight
sunlight.position.set(0, 1, 0); // Positioned above the scene, shining down
scene.add(sunlight);

const ambient_light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient_light);

const debug_ui_state:Record<string,{value:string, label:HTMLLabelElement, output:HTMLInputElement}> = {}

window.addEventListener('resize', _ => {
    renderer.setSize(game_dom_element.clientWidth, game_dom_element.clientHeight, true);
    camera.aspect = game_dom_element.clientWidth / game_dom_element.clientHeight;
    camera.updateProjectionMatrix();
});

// threejs scene setup already done above

// Object to track pressed keys
const keysPressed: Record<string, boolean> = {};
(window as any).keysPressed = keysPressed;
// Listen for keydown event
window.addEventListener('keydown', function (event) {
    keysPressed[event.key] = true;
    //console.log(keysPressed)
});

// Listen for keyup event
window.addEventListener('keyup', function (event) {
    delete keysPressed[event.key];
});

let camera_direction = new THREE.Quaternion(0, 0, 0, 1);
let camera_velocity = new THREE.Vector3(0, 0, 0);
const DRAG = 0.9;
const GRAVITY = new THREE.Vector3(0, -0.00001, 0);
const MOVE_SPEED = 0.03;
const ROTATION_SPEED = 0.05;
function animate() {
    requestAnimationFrame(animate);
    controls.poll_controller();

    let left_axes = controls.get_left_axes();
    let roll_axis = controls.get_trigger_axis();



    let rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), left_axes.x*ROTATION_SPEED);
    camera_direction.multiply(rotationQuaternion).normalize();

    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), left_axes.y*ROTATION_SPEED);
    camera_direction.multiply(rotationQuaternion).normalize();

    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll_axis*ROTATION_SPEED*0.5);
    camera_direction.multiply(rotationQuaternion).normalize();

    oscilloscope.update_probe("ax-h", left_axes.x, 1,-1);
    oscilloscope.update_probe("ax-v", left_axes.y, 1,-1);

    let camera_up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera_direction);
    let camera_backward = new THREE.Vector3(0, 0, 1).applyQuaternion(camera_direction);
    let camera_right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera_direction);

    if (keysPressed[" "]) {
        camera.position.add(camera_up.multiplyScalar(ROTATION_SPEED));
    }
    if (keysPressed["Shift"]) {
        camera.position.add(camera_up.multiplyScalar(-ROTATION_SPEED));
    }

    if (keysPressed["ArrowUp"]) {
        camera.position.add(camera_backward.multiplyScalar(-ROTATION_SPEED));
    }
    if (keysPressed["ArrowDown"]) {
        camera.position.add(camera_backward.multiplyScalar(ROTATION_SPEED));
    }
    if (keysPressed["ArrowLeft"]) {
        camera.position.add(camera_right.multiplyScalar(-ROTATION_SPEED));
    }
    if (keysPressed["ArrowRight"]) {
        camera.position.add(camera_right.multiplyScalar(ROTATION_SPEED));
    }

    let world_up = new THREE.Vector3(0, 1, 0);

    // reconstruct the camera assuming that camera up is in the same direction as world up
    // use the cross product
    // let camera_right_rectified   = world_up.clone().cross(camera_backward);
    // let camera_backward_rectified = camera_right.clone().cross(world_up);
    // let camera_up_rectified      = camera_right_rectified.clone().cross(camera_backward_rectified);
    // let target_quaternion = new THREE.Quaternion(0,0,0,1);
    // //target_quaternion.setFromRotationMatrix(camera_matrix)
    // target_quaternion.setFromUnitVectors(camera_up, camera_up_rectified);
    
    let correction_axis = camera_up.clone().cross(world_up);

    let angle_from_up = camera_up.angleTo(world_up);
    if (angle_from_up>Math.PI/2) {
        let correction_rotation = new THREE.Quaternion();
        correction_rotation.setFromAxisAngle(correction_axis, (angle_from_up-Math.PI/2) / 30);
        camera_direction.multiply(correction_rotation);
    }

    // move the camera forward in its forward direction,
    // in proportion to its angle relative to the horizon
    let angle_from_horizon = Math.PI-camera_backward.angleTo(world_up);
    let acceleration = Math.min(
        -(angle_from_horizon-Math.PI/2),
        0
    ) / 80;

    oscilloscope.update_probe("altitude"           , camera.position.y, -80, 80);
    //oscilloscope.update_probe("angle forward up"   , angle_from_horizon, 0, Math.PI);
    oscilloscope.update_probe("acceleration"       , -acceleration, -0.05, 0.05);
    oscilloscope.update_probe("speed"              , camera_velocity.length(),0, 0.5);
    oscilloscope.update_chart(0.5)
    //let forward_velocity_component = camera_velocity.clone().projectOnVector(camera_backward);

    camera_velocity.add(camera_backward.multiplyScalar(acceleration));
    camera_velocity.add(GRAVITY);
    camera_velocity.multiplyScalar(DRAG);

    
    camera.position.add(camera_velocity);

    // rotate camera to match plater directionww
    camera.setRotationFromQuaternion(camera_direction);
    indicator.setRotationFromQuaternion(camera_direction);
    //indicator2.setRotationFromQuaternion(camera_direction);
    renderer.render(scene, camera);
}

animate();
