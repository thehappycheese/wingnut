import * as THREE from 'three';

export function setup_scene(game_dom_element:HTMLElement){

    const camera = new THREE.PerspectiveCamera(
        75,
        game_dom_element.clientWidth / game_dom_element.clientHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(game_dom_element.clientWidth, game_dom_element.clientHeight);
    game_dom_element.appendChild(renderer.domElement);
    window.addEventListener('resize', _ => {
        renderer.setSize(game_dom_element.clientWidth, game_dom_element.clientHeight, true);
        camera.aspect = game_dom_element.clientWidth / game_dom_element.clientHeight;
        camera.updateProjectionMatrix();
    });

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x333333, 8, 100 );

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

    return {renderer, scene, camera};
}