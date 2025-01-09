import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {Cup2} from "./Cup2.ts";
import {Dice} from "./Dice.ts";

// 타입 정의
export interface CupObject {
    mesh: THREE.Mesh;
    body: RAPIER.RigidBody;
}
//
// export class CupController {
//     private cup: CupObject;
//     private diceAry: Array<Dice>;
//     private camera: THREE.Camera;
//     private scene: THREE.Scene;
//     private raycaster: THREE.Raycaster;
//     private plane: THREE.Plane;
//     private targetPosition: THREE.Vector3;
//     private isDragging: boolean = false;
//     private moveSpeed: number = 5.0;
//
//     constructor(cup: CupObject, camera: THREE.Camera, scene: THREE.Scene, dices: Array<Dice>) {
//         this.cup = cup;
//         this.diceAry = dices;
//         this.camera = camera;
//         this.scene = scene;
//         this.raycaster = new THREE.Raycaster();
//         this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
//         this.targetPosition = new THREE.Vector3();
//
//         // 마우스 이벤트 리스너 추가
//         window.addEventListener('mousedown', this.handleMouseDown.bind(this));
//         window.addEventListener('mousemove', this.handleMouseMove.bind(this));
//         window.addEventListener('mouseup', this.handleMouseUp.bind(this));
//     }
//
//     private handleMouseDown(event: MouseEvent) {
//         // 마우스 클릭 시작 시 드래그 상태 활성화
//         this.isDragging = true;
//         this.updateTargetPosition(event);
//     }
//
//     private handleMouseMove(event: MouseEvent) {
//         if (!this.isDragging) return;
//         this.updateTargetPosition(event);
//     }
//
//     private handleMouseUp() {
//         this.isDragging = false;
//     }
//
//     private updateTargetPosition(event: MouseEvent) {
//         // 마우스 좌표를 정규화된 장치 좌표로 변환
//         const mouse = new THREE.Vector2(
//             (event.clientX / window.innerWidth) * 2 - 1,
//             -(event.clientY / window.innerHeight) * 2 + 1
//         );
//
//         // 레이캐스터 업데이트
//         this.raycaster.setFromCamera(mouse, this.camera);
//
//         // 평면과의 교차점 계산
//         const intersect = new THREE.Vector3();
//         this.raycaster.ray.intersectPlane(this.plane, intersect);
//
//         // 현재 컵의 y 위치 유지
//         intersect.y = this.cup.mesh.position.y;
//         this.targetPosition.copy(intersect);
//     }
//
//     // 매 프레임마다 호출되는 업데이트 함수
//     public update(deltaTime: number) {
//         if (!this.isDragging) return;
//
//         const currentPos = this.cup.mesh.position;
//         const direction = this.targetPosition.clone().sub(currentPos);
//         const distance = direction.length();
//
//         // 일정 거리 이상일 때만 이동
//         if (distance < 0.1) return;
//
//         // 부드러운 이동을 위한 선형 보간
//         direction.normalize();
//         const moveAmount = Math.min(this.moveSpeed * deltaTime, distance);
//         const newPosition = currentPos.clone().add(direction.multiplyScalar(moveAmount));
//
//         // three.js 메시와 rapier 물리 객체 모두 업데이트
//         this.cup.mesh.position.copy(newPosition);
//         this.cup.body.setTranslation(
//             { x: newPosition.x, y: newPosition.y, z: newPosition.z },
//             true
//         );
//     }
//
//     // 리소스 정리
//     public dispose() {
//         window.removeEventListener('mousedown', this.handleMouseDown.bind(this));
//         window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
//         window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
//     }
// }

export class CupController {
    private cup: Cup2;
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private raycaster: THREE.Raycaster;
    private plane: THREE.Plane;
    private targetPosition: THREE.Vector3;
    private moving: boolean = false;
    private moveSpeed: number = 5.0;

    constructor(cup: Cup2, camera: THREE.Camera, scene: THREE.Scene) {
        this.cup = cup;
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XZ 평면
        this.targetPosition = new THREE.Vector3();

        // 마우스 클릭 이벤트 리스너 추가
        // window.addEventListener('click', this.handleClick.bind(this));
    }

    private handleClick(event: MouseEvent) {
        // 마우스 좌표를 정규화된 장치 좌표로 변환
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        // 레이캐스터 업데이트
        this.raycaster.setFromCamera(mouse, this.camera);

        // 평면과의 교차점 계산
        const intersect = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, intersect);

        // 현재 컵의 y 위치 유지
        intersect.y = this.cup.mesh.position.y;
        this.targetPosition.copy(intersect);
        this.moving = true;
    }

    // 매 프레임마다 호출되는 업데이트 함수
    public update(deltaTime: number) {
        if (!this.moving) return;

        const currentPos = this.cup.mesh.position;
        const direction = this.targetPosition.clone().sub(currentPos);
        const distance = direction.length();

        if (distance < 0.1) {
            this.moving = false;
            return;
        }

        // 부드러운 이동을 위한 선형 보간
        direction.normalize();
        const moveAmount = Math.min(this.moveSpeed * deltaTime, distance);
        const newPosition = currentPos.clone().add(direction.multiplyScalar(moveAmount));

        // three.js 메시와 rapier 물리 객체 모두 업데이트
        this.cup.mesh.position.copy(newPosition);
        this.cup.body.setTranslation(
            { x: newPosition.x, y: newPosition.y, z: newPosition.z },
            true
        );
    }

    // 리소스 정리
    public dispose() {
        window.removeEventListener('click', this.handleClick.bind(this));
    }
}