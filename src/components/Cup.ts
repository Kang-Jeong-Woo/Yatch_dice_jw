import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export class Cup {
    dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = [];

    async mkCup(scene: THREE.Scene, world: RAPIER.World, position: THREE.Vector3) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();
        const materials = await mtlLoader.loadAsync('img/cup.mtl');
        materials.preload();
        objLoader.setMaterials(materials);
        const object = await objLoader.loadAsync('models/WoodenMug.obj');
        scene.add(object);
        console.log(object);
        const cupMesh = object.getObjectByName("WoodenMug") as THREE.Mesh;
        cupMesh.castShadow = true;

        const cupBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(position.x, position.y, position.z)
                .setCanSleep(true)
        );
        const points = new Float32Array(cupMesh.geometry.attributes.position.array);
        const cupShape = (RAPIER.ColliderDesc.convexHull(points) as RAPIER.ColliderDesc)
            // .setMass(1)
            // .setRestitution(0.5)
            // .setFriction(0.2);
        world.createCollider(cupShape, cupBody);
        this.dynamicBodies.push([cupMesh, cupBody]);
    }

    update() {
        for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
            const mesh = this.dynamicBodies[i][0];
            const body = this.dynamicBodies[i][1];

            mesh.position.copy(body.translation());
            mesh.quaternion.copy(body.rotation());
        }
    }
}
