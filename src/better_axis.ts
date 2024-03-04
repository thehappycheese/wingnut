import * as THREE from 'three';

export function better_axis(color:number) {
    // Create a group to hold the cube and arrows
    const group = new THREE.Group();
  
    // Create a cube geometry and material with the specified color
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshPhongMaterial({color: color});
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  
    // Add the cube to the group
    group.add(cube);
  
    // Create arrow helpers for the X, Y, Z axes
    const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff0000); // Red for X
    const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0x00ff00); // Green for Y
    const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1, 0x0000ff); // Blue for Z
  
    // Add the arrows to the group
    group.add(arrowX);
    group.add(arrowY);
    group.add(arrowZ);
  
    // Return the group containing the cube and arrows
    return group;
  }