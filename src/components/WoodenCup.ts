import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";
import ICup from "./interface/ICup.ts";

export default class WoodenCup implements ICup {
    mesh!: THREE.Mesh;
    rigidBody!: RAPIER.RigidBody;
    private isPouring: boolean = false;

    async mkCup(scene: THREE.Scene, world: RAPIER.World, position: THREE.Vector3) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync('img/components/WoodenMug.mtl');
        materials.preload();
        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync('models/WoodenMug.obj');
        scene.add(object);

        const cupMesh = object.getObjectByName("WoodenMug") as THREE.Mesh;
        cupMesh.castShadow = true;

        const cupBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.fixed()
                .setTranslation(position.x, position.y, position.z)
                .setCanSleep(true)
        );

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
            .setMass(1)
            .setRestitution(0.1)
            .setFriction(1.5)
            .setSensor(false);

        world.createCollider(cupShape, cupBody);

        this.mesh = cupMesh;
        this.rigidBody = cupBody;
    }

    update() {
        this.mesh.position.copy(this.rigidBody.translation());
        this.mesh.quaternion.copy(this.rigidBody.rotation());
    }

    /**
     * 물체를 기울이고 원위치로 돌아오는 애니메이션
     *
     * @param {number} duration - 기울이는 데 걸리는 시간 (밀리초 단위).
     * @param {number} targetTiltAngle - 목표 기울기 각도 (도 단위).
     * @param {() => void} [onComplete] - 애니메이션이 완료된 후 호출될 선택적 콜백 함수.
     */
    public pour(duration: number, targetTiltAngle: number, onComplete?: () => void) {
        if (this.isPouring || !this.mesh || !this.rigidBody) return;

        // 상태 초기화
        this.isPouring = true;
        const startTime = Date.now();
        const liftHeight = 0.5;
        const initialPosition = this.rigidBody.translation();
        const initialRotation = this.rigidBody.rotation();

        const tiltAngleRad = (Math.min(targetTiltAngle, 60) * Math.PI) / 180;

        // 원래 위치로 돌아오는 애니메이션 함수
        const returnToInitial = () => {
            const returnStartTime = Date.now();
            const returnDuration = 1000;

            const returnAnimate = () => {
                const elapsed = Date.now() - returnStartTime;
                const progress = Math.min(elapsed / returnDuration, 1);

                if (progress >= 1) {
                    this.isPouring = false;
                    if (onComplete) onComplete();
                    return;
                }

                const easeProgress = -(Math.cos(Math.PI * progress) - 1) / 2;

                // 현재 위치에서 초기 위치로 보간
                const currentPos = this.rigidBody.translation();
                const newPosition = {
                    x: currentPos.x + (initialPosition.x - currentPos.x) * easeProgress,
                    y: currentPos.y + (initialPosition.y - currentPos.y) * easeProgress,
                    z: currentPos.z + (initialPosition.z - currentPos.z) * easeProgress
                };
                this.rigidBody.setTranslation(newPosition, true);

                // 현재 회전에서 초기 회전으로 보간
                const currentRot = this.rigidBody.rotation();
                const currentQuat = new THREE.Quaternion(currentRot.x, currentRot.y, currentRot.z, currentRot.w);
                const initialQuat = new THREE.Quaternion(initialRotation.x, initialRotation.y, initialRotation.z, initialRotation.w);
                currentQuat.slerp(initialQuat, easeProgress);

                this.rigidBody.setRotation(
                    {x: currentQuat.x, y: currentQuat.y, z: currentQuat.z, w: currentQuat.w},
                    true
                );

                // Three.js 메시 업데이트
                this.mesh.position.copy(this.rigidBody.translation());
                this.mesh.quaternion.copy(this.rigidBody.rotation());

                if (progress < 1) {
                    requestAnimationFrame(returnAnimate);
                }
            };

            returnAnimate();
        };

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress >= 1) {
                // 2초 후에 원래 위치로 돌아가기 시작
                setTimeout(returnToInitial, 2000);
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
            this.rigidBody.setTranslation(newPosition, true);

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

            this.rigidBody.setRotation(
                {x: newRot.x, y: newRot.y, z: newRot.z, w: newRot.w},
                true
            );

            // Three.js 메시 업데이트
            this.mesh.position.copy(this.rigidBody.translation());
            this.mesh.quaternion.copy(this.rigidBody.rotation());

            requestAnimationFrame(animate);
        };

        animate();
    }
}