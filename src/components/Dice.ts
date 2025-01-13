import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import {Object3D} from "three";

export class Dice {
    id: number = -1;
    dynamicBodies: [THREE.Mesh, RAPIER.RigidBody] = [];
    faceValues: any = {};
    // faceValues: { [key: string]: number } = {};
    isSelected: boolean = false;
    isSleep: boolean = false;

    constructor() {}

    async mkDice(id: number, scene: THREE.Scene, world: RAPIER.World, position: THREE.Vector3) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();
        const materials = await mtlLoader.loadAsync('img/Dice.mtl');
        materials.preload();
        objLoader.setMaterials(materials);
        const object = await objLoader.loadAsync('models/Dice.obj');
        scene.add(object);
        const diceMesh = object.getObjectByName("g_Dice_Roundcube.001") as THREE.Mesh;
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
            .setMass(1)
            .setRestitution(1.5)
            .setFriction(1);
        world.createCollider(diceShape, diceBody);
        this.dynamicBodies = [diceMesh, diceBody];
        this.id = id;

        this.faceValues[diceMesh.uuid] = {
            "+Y": 1,
            "-Y": 6,
            "+Z": 2,
            "-Z": 5,
            "+X": 3,
            "-X": 4
        };
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

    getDiceValueClone(id:number): number {
        const upDirections = {
            "+Y": new THREE.Vector3(0, 1, 0),
            "-Y": new THREE.Vector3(0, -1, 0),
            "+Z": new THREE.Vector3(0, 0, 1),
            "-Z": new THREE.Vector3(0, 0, -1),
            "+X": new THREE.Vector3(1, 0, 0),
            "-X": new THREE.Vector3(-1, 0, 0),
        };

        const currentQuaternion = this.dynamicBodies[0].quaternion.clone();
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

        return closestFace ? this.faceValues[this.dynamicBodies[0].uuid][closestFace] : 100;
    }

    update() {
        // for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
            const mesh = this.dynamicBodies[0];
            const body = this.dynamicBodies[1];

            mesh.position.copy(body.translation());
            mesh.quaternion.copy(body.rotation());

            if (body.isSleeping()) {
                this.isSleep = true;
                // 여기서 특정 함수 실행

                // const value = this.getDiceValue(mesh);
                // console.log(`Dice value: ${value}`);
            }
        // }
    }

    select() {
        this.isSelected = true;
    }

    disSelect() {
        this.isSelected = false;
        // sleep 이 해제됨.
        //
    }

    resetPhysics(world: RAPIER.World) {
        for (const [_, value] of this.dynamicBodies) {
            if (!this.isSelected) {
                value[1].wakeUp(); // isSelected가 아닌 주사위를 다시 활성화
                value[1].setTranslation({ x: 0, y: 5, z: 0 }, true); // 초기 위치로 설정
                value[1].setLinvel({ x: Math.random(), y: Math.random(), z: Math.random() }, true);
                value[1].setAngvel({ x: Math.random(), y: Math.random(), z: Math.random() }, true);
            }
        }
    }
}
