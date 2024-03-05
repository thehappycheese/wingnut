
import * as THREE from "three";





export function angle_of_attack(velocity:THREE.Vector3, forward_unit:THREE.Vector3, up_unit:THREE.Vector3){
    // project velocity onto forward and up to determine angle of attack
    let forward = velocity.dot(forward_unit);
    let up = velocity.dot(up_unit);
    return Math.atan2(up, forward);
}

export function lift(velocity:THREE.Vector3, forward_unit:THREE.Vector3, up_unit:THREE.Vector3){
    let forward = velocity.dot(forward_unit);
    let up      = velocity.dot(up_unit);
    let angle_of_attack = Math.atan2(up, forward);
    return forward * forward * Math.sin(angle_of_attack)
}