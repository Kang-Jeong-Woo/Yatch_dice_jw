import {Scene, BoxGeometry, Mesh, MeshStandardMaterial} from "three";
import {World, RigidBodyDesc, ColliderDesc} from "@dimforge/rapier3d-compat";
import {getSelectedDicePosition} from "../Util/Util.ts";

export default class DiceHolder {
    scene: Scene;
    world: World;
    position: [number, number, number];
    diceSize: number;
    spacing: number;

    constructor(
        scene: Scene,
        world: World,
        position: [number, number, number],
        diceSize: number = 2,
    ) {
        this.scene = scene;
        this.world = world;
        this.position = position;
        this.diceSize = diceSize;
        this.spacing = diceSize / 2;

        const numberOfDice = 5;

        // 전체 홀더의 크기 계산
        const totalWidth = (this.diceSize * numberOfDice) * 2;
        const totalHeight = this.diceSize * 1.5;
        const depth = this.diceSize * 2;

        // 박스
        const holderGeometry = new BoxGeometry(totalWidth, totalHeight, depth);
        const holderMaterial = new MeshStandardMaterial({color: 0x002f00});
        const holder = new Mesh(holderGeometry, holderMaterial);
        holder.position.set(0, 0.001, -20);
        this.scene.add(holder);

        // 주사위 위치 표시
        const baseGeometry = new BoxGeometry(this.diceSize, this.diceSize, this.diceSize);
        const baseMaterial = new MeshStandardMaterial({color: 0x868e96});
        for (let i = 0; i < numberOfDice; i++) {
            const base = new Mesh(baseGeometry, baseMaterial);
            base.rotation.x = Math.PI / 2;
            const vector3 = getSelectedDicePosition(i);
            base.position.set(vector3.x, 0.8, vector3.z);
            this.scene.add(base);
            // Rapier 물리 바디 생성
            this.createRigidBody(vector3.x, -1.1, vector3.z);
        }
    }

    createRigidBody(x: number, y: number, z: number) {
        const outerSize = 0.4;
        const wallThickness = 0.3;

        const diceHolderBody = this.world.createRigidBody(
            RigidBodyDesc.fixed()
                .setTranslation(
                    x, y, z
                )
        );

        // 바닥 콜라이더
        const bottomCollider = ColliderDesc.cuboid(
            this.diceSize / 2, wallThickness / 2, this.diceSize / 2
        );
        // 바닥은 홀더의 가장 아래에 위치
        bottomCollider.setTranslation(0, this.diceSize / 3, 0);
        this.world.createCollider(bottomCollider, diceHolderBody);

        // 벽 콜라이더들 - 높이의 중심을 0으로 설정
        // 앞벽
        const frontCollider = ColliderDesc.cuboid(
            this.diceSize / 2, this.diceSize / 2, wallThickness / 2
        );
        frontCollider.setTranslation(0, this.diceSize, this.diceSize / 2 + outerSize);
        this.world.createCollider(frontCollider, diceHolderBody);

        // 뒷벽
        const backCollider = ColliderDesc.cuboid(
            this.diceSize / 2, this.diceSize / 2, wallThickness / 2
        );
        backCollider.setTranslation(0, this.diceSize, -this.diceSize / 2 - outerSize);
        this.world.createCollider(backCollider, diceHolderBody);

        // 왼쪽 벽
        const leftCollider = ColliderDesc.cuboid(
            wallThickness / 2, this.diceSize / 2, this.diceSize / 2
        );
        leftCollider.setTranslation(-this.diceSize / 2 - outerSize, this.diceSize, 0);
        this.world.createCollider(leftCollider, diceHolderBody);

        // 오른쪽 벽
        const rightCollider = ColliderDesc.cuboid(
            wallThickness / 2, this.diceSize / 2, this.diceSize / 2
        );
        rightCollider.setTranslation(this.diceSize / 2 + outerSize, this.diceSize, 0);
        this.world.createCollider(rightCollider, diceHolderBody);
    }
}