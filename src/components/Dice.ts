import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat';
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

type FaceDirections = "+Y" | "-Y" | "+Z" | "-Z" | "+X" | "-X";
type FaceValues = Record<string, Record<FaceDirections, number>>;

interface UpDirections {
    [key: string]: THREE.Vector3;
}

export default class Dice {
    id: number = -1;
    mesh!: THREE.Mesh;
    rigidBody!: RAPIER.RigidBody;
    faceValues: FaceValues = {};
    isSelected: boolean = false;
    isSleep: boolean = false;
    originalPosition: THREE.Vector3 | null = null;

    constructor() {}

    async mkDice(id: number, scene: THREE.Scene, world: RAPIER.World, position: THREE.Vector3) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync('img/components/Dice.mtl');
        materials.preload();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync('models/Dice.obj');
        scene.add(object);

        const diceMesh = object.getObjectByName("g_Dice_Roundcube.001") as THREE.Mesh;
        diceMesh.castShadow = true;
        diceMesh.receiveShadow = true;

        const diceBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(position.x, position.y, position.z)
                .setCanSleep(true)
                .setLinearDamping(1.75)
                .setAngularDamping(1.75)
                .setGravityScale(1.0)
        );

        const points = new Float32Array(diceMesh.geometry.attributes.position.array);
        const diceShape = (RAPIER.ColliderDesc.convexHull(points) as RAPIER.ColliderDesc)
            .setMass(1)
            .setRestitution(1.8)
            .setFriction(0.8);

        world.createCollider(diceShape, diceBody);

        this.mesh = diceMesh
        this.rigidBody = diceBody
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

    getDiceValue(): number {
        const upDirections: UpDirections = {
            "+Y": new THREE.Vector3(0, 1, 0),
            "-Y": new THREE.Vector3(0, -1, 0),
            "+Z": new THREE.Vector3(0, 0, 1),
            "-Z": new THREE.Vector3(0, 0, -1),
            "+X": new THREE.Vector3(1, 0, 0),
            "-X": new THREE.Vector3(-1, 0, 0),
        };

        const currentQuaternion = this.mesh.quaternion.clone();
        let closestFace: FaceDirections | null = null;
        let maxDot = -Infinity;

        for (const [face, direction] of Object.entries(upDirections)) {
            const transformedDirection = direction.clone().applyQuaternion(currentQuaternion);
            const dot = transformedDirection.dot(new THREE.Vector3(0, 1, 0)); // Compare with world +Y
            if (dot > maxDot) {
                maxDot = dot;
                closestFace = face as FaceDirections;
            }
        }

        return closestFace ? this.faceValues[this.mesh.uuid][closestFace] : 100;
    }

    update() {
        this.mesh.position.copy(this.rigidBody.translation());
        this.mesh.quaternion.copy(this.rigidBody.rotation());

        if (this.rigidBody.isSleeping() && !this.isSleep) {
            this.isSleep = true;
        }
    }

    setOriginalPosition() {
        if (!this.originalPosition && this.isSleep) {
            const currentPos = this.rigidBody.translation();
            this.originalPosition = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
        }
    }
}
