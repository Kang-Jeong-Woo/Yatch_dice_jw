import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";
import {CupObject} from "./CupController.ts";

export class Cup2 implements CupObject{
    dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = [];
    body: RAPIER.RigidBody;
    mesh: THREE.Object3D;
    private isPouring: boolean = false;

    async mkCup(scene: THREE.Scene, world: RAPIER.World, position: THREE.Vector3) {
        const objLoader = new OBJLoader();
        // const mtlLoader = new MTLLoader();
        // const materials = await mtlLoader.loadAsync('img/WoodenMug.mtl');
        // materials.preload();
        // objLoader.setMaterials(materials);
        const object = await objLoader.loadAsync('models/WoodenMug.obj');
        scene.add(object);

        const cupMesh = object.getObjectByName("WoodenMug") as THREE.Mesh;
        cupMesh.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            roughness: 0,
            depthWrite: false
        });
        cupMesh.castShadow = true;

        console.log(object);
        console.log(cupMesh);
        // console.log(materials);

        const geometry = cupMesh.geometry;

        let vertices: Float32Array;
        let indices: any;

        if (geometry.index) {
            vertices = new Float32Array(geometry.attributes.position.array);
            indices = new Uint32Array(geometry.index.array);
        } else {
            // 인덱스가 없다면 수동으로 강제로 생성 (assuming triangles)
            vertices = new Float32Array(geometry.attributes.position.array);

            // Generate indices for the faces (group of 3 vertices form a triangle)
            const numVertices = vertices.length / 3;
            indices = [];
            for (let i = 0; i < numVertices; i += 3) {
                indices.push(i, i + 1, i + 2);
            }
            indices = new Uint32Array(indices);
        }

        // RAPIER 의 ColliderDesc() 를 사용하여 trimesh 강제 생성
        const cupShape = RAPIER.ColliderDesc.trimesh(vertices, indices)
            .setMass(100)
            .setRestitution(0.0)
            .setFriction(0.9);

        const cupBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.fixed()
                .setTranslation(position.x, position.y, position.z)
                .setCanSleep(true)
        );
        world.createCollider(cupShape, cupBody);

        this.dynamicBodies.push([cupMesh, cupBody]);
        this.mesh = cupMesh;
        this.body = cupBody;
    }

    update() {
        for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
            this.mesh = this.dynamicBodies[i][0];
            this.body = this.dynamicBodies[i][1];
            this.mesh.position.copy(this.body.translation());
            this.mesh.quaternion.copy(this.body.rotation());
            // const mesh = this.dynamicBodies[i][0];
            // const body = this.dynamicBodies[i][1];
            // mesh.position.copy(body.translation());
            // mesh.quaternion.copy(body.rotation());
        }
    }

    public pour(duration: number, targetTiltAngle: number) {
        if (this.isPouring || !this.mesh || !this.body) return;

        this.isPouring = true;
        const startTime = Date.now();
        const liftHeight = 0.5;
        const initialPosition = this.body.translation();
        const initialRotation = this.body.rotation();

        // dynamicBodies 배열에서 현재 컵의 인덱스 찾기
        const cupIndex = this.dynamicBodies.findIndex(([mesh, _]) => mesh === this.mesh);
        if (cupIndex === -1) {
            console.error('Cup not found in dynamicBodies array');
            return;
        }

        const tiltAngleRad = (Math.min(targetTiltAngle, 60) * Math.PI) / 180;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress >= 1) {
                this.isPouring = false;
                return;
            }

            const easeProgress = -(Math.cos(Math.PI * progress) - 1) / 2;

            const currentLift = liftHeight * easeProgress * 50;
            const forwardMove = 0.3 * easeProgress;

            // 위치 업데이트
            const newPosition = {
                x: initialPosition.x + forwardMove,
                y: initialPosition.y + currentLift,
                z: initialPosition.z
            };
            this.body.setTranslation(newPosition, true);

            // 회전 업데이트
            const currentTilt = tiltAngleRad * easeProgress * 90;
            const tiltQuat = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, 0, 1),
                currentTilt
            );

            const newRot = new THREE.Quaternion(
                initialRotation.x,
                initialRotation.y,
                initialRotation.z,
                initialRotation.w
            ).multiply(tiltQuat);

            this.body.setRotation(
                { x: newRot.x, y: newRot.y, z: newRot.z, w: newRot.w },
                true
            );

            // Three.js 메시 업데이트
            this.mesh.position.copy(this.body.translation());
            this.mesh.quaternion.copy(this.body.rotation());

            // dynamicBodies 배열 업데이트
            this.dynamicBodies[cupIndex] = [this.mesh, this.body];

            requestAnimationFrame(animate);
        };

        animate();
    }
}