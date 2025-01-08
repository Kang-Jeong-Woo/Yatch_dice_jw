import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export class Dice {
    dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = [];
    faceValues: { [key: string]: number } = {};

    constructor() {}

    async mkDice(scene: THREE.Scene, world: RAPIER.World, position: THREE.Vector3) {
        const materials = await new MTLLoader().loadAsync('models/dice.mtl');
        materials.preload(); // MTL 파일을 사전 로드
        const objLoader = new OBJLoader();
        // 2. OBJLoader에 MTLLoader의 재질 설정 연결
        objLoader.setMaterials(materials);

        // await new OBJLoader().loadAsync('models/3.obj').then((object: THREE.Group) => {
        await objLoader.loadAsync('models/Dice6.obj').then((object: THREE.Group) => {
            console.log(object.children);

            scene.add(object);
            // const diceMesh = object.getObjectByName('Cube_Cube.001') as THREE.Mesh;
            const diceMesh = object.getObjectByName('g_Dice_Roundcube.001') as THREE.Mesh;
            console.log(diceMesh.uuid);

            diceMesh.material = new THREE.MeshNormalMaterial();
            diceMesh.castShadow = true;

            const diceBody = world.createRigidBody(
                RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(position.x, position.y, position.z)
                    .setCanSleep(true)
                    .setLinearDamping(0.9)  // Increased linear damping
                    .setAngularDamping(0.9) // Increased angular damping
            );
            const points = new Float32Array(diceMesh.geometry.attributes.position.array);
            const diceShape = (RAPIER.ColliderDesc.convexHull(points) as RAPIER.ColliderDesc)
                .setMass(10000)
                .setRestitution(0.1)
                .setFriction(1.0);
            world.createCollider(diceShape, diceBody);
            this.dynamicBodies.push([diceMesh, diceBody]);

            this.faceValues[diceMesh.uuid] = {
                "+Y": 1,
                "-Y": 6,
                "+Z": 2,
                "-Z": 5,
                "+X": 3,
                "-X": 4
            };
        });
    }

    getDiceValue(mesh: THREE.Object3D): number | null {
        const upDirections = {
            "+Y": new THREE.Vector3(0, 1, 0),
            "-Y": new THREE.Vector3(0, -1, 0),
            "+Z": new THREE.Vector3(0, 0, 1),
            "-Z": new THREE.Vector3(0, 0, -1),
            "+X": new THREE.Vector3(1, 0, 0),
            "-X": new THREE.Vector3(-1, 0, 0),
        };

        const currentQuaternion = mesh.quaternion.clone();
        let closestFace = null;
        let maxDot = -Infinity;

        for (const [face, direction] of Object.entries(upDirections)) {
            const transformedDirection = direction.clone().applyQuaternion(currentQuaternion);
            const dot = transformedDirection.dot(new THREE.Vector3(0, 1, 0)); // Compare with world +Y
            if (dot > maxDot) {
                maxDot = dot;
                closestFace = face;
            }
        }

        return closestFace ? this.faceValues[mesh.uuid][closestFace] : null;
    }

    update() {
        for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
            const mesh = this.dynamicBodies[i][0];
            const body = this.dynamicBodies[i][1];

            mesh.position.copy(body.translation());
            mesh.quaternion.copy(body.rotation());

            if (body.isSleeping()) {
                const value = this.getDiceValue(mesh);
                console.log(`Dice value: ${value}`);
            }
        }
    }
}
