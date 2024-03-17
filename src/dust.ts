import * as THREE from 'three';

const partical_material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
});

export class DustAtmosphere extends THREE.Group {
    
    cube_size:number
    cube_partical_count:number
    dust_cubes:THREE.Points[] = []
    
    constructor(cube_size=10, cube_partical_count=400){
        super();
        this.cube_size = cube_size;
        this.cube_partical_count = cube_partical_count;
        for (let i = 0; i<3**3; i++){
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(cube_partical_count * 3);
            for (let i = 0; i < cube_partical_count; i++) {
                const x = THREE.MathUtils.randFloatSpread(cube_size);
                const y = THREE.MathUtils.randFloatSpread(cube_size);
                const z = THREE.MathUtils.randFloatSpread(cube_size);
                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            let dust_cube = new THREE.Points(geometry, partical_material);
            this.dust_cubes.push(dust_cube);
            this.add(dust_cube);
        }
    }

    _array_index_to_cube_offset(index:number){
        const x = index % 3 - 1;
        const y = Math.floor(index / 3) % 3 - 1;
        const z = Math.floor(index / 9) - 1;
        return [x,y,z];
    }

    _cube_offset_to_array_index(x:number, y:number, z:number){
        return (x+1) + (y+1) * 3 + (z+1) * 9;
    }

    reposition_dust_around_point(point:THREE.Vector3){
        const px = Math.round(point.x / this.cube_size);
        const py = Math.round(point.y / this.cube_size);
        const pz = Math.round(point.z / this.cube_size);
        for(let gx=-1;gx<=1;gx++){
            for(let gy=-1;gy<=1;gy++){
                for(let gz=-1;gz<=1;gz++){
                    const cx = Math.abs((px+gx)%3) - 1;
                    const cy = Math.abs((py+gy)%3) - 1;
                    const cz = Math.abs((pz+gz)%3) - 1;
                    const cube = this.dust_cubes[this._cube_offset_to_array_index(cx,cy,cz)];
                    cube.position.set(
                        (px+gx) * this.cube_size, 
                        (py+gy) * this.cube_size, 
                        (pz+gz) * this.cube_size
                    );
                }
            }
        }
    }

}


