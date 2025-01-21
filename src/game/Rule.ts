import {PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer} from "three";
import {World} from "@dimforge/rapier3d-compat";
import Keyboard from "../UI/Keyboard.ts";
import Dice from "../components/Dice.ts";
import UI from "../UI/UI.ts";
import {calculateSum, countNumbers, getSelectedDicePosition} from "../Util/Util.ts";
import SlideCup from "../components/SlideCup.ts";

export default class Rule {
    scene: Scene
    camera: PerspectiveCamera
    renderer: WebGLRenderer
    world: World
    keyboard: Keyboard
    ui: UI
    gameFlag: boolean = false
    height: [number, number, number] = [0, 40, 0]
    diceArray: Array<Dice> = []
    cup: SlideCup = new SlideCup()
    turn: number = 0
    round: number = 0
    scoreMap: Map<number, number> = new Map<number, number>();
    rayCaster: Raycaster = new Raycaster();
    mouse: Vector2 = new Vector2();

    constructor(scene: Scene, world: World, camera: PerspectiveCamera, renderer: WebGLRenderer, ui: UI) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.world = world
        this.ui = ui
        this.keyboard = new Keyboard(renderer)
        // const cupCon = new CupController(cup, camera, scene);
    }

    async init() {
        for (let i = 0; i < 5; i++) {
            const dice = new Dice();
            await dice.mkDice(i, this.scene, this.world, new Vector3(this.height[0], this.height[1] + i * 2, this.height[2]));
            this.diceArray.push(dice);
        }
        await this.cup.mkCup(this.scene, this.world, new Vector3(this.height[0]+7, this.height[1]-20, this.height[2]));

        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && !this.gameFlag && this.round < 3 && this.turn < 12) {
                this.gameFlag = true;
                this.cup.pour(4000, Math.PI/2, () => this.gameFlag = true);
                this.round++;
                this.ui.setRoundText(this.round);
            }
        });

        this.renderer.domElement.addEventListener('dblclick', (e) => {
            if (this.gameFlag) {
                // canvas의 경계 정보를 가져옴
                const rect = this.renderer.domElement.getBoundingClientRect();

                // 마우스 좌표를 canvas 기준으로 변환
                this.mouse.set(
                    ((e.clientX - rect.left) / rect.width) * 2 - 1,
                    -((e.clientY - rect.top) / rect.height) * 2 + 1
                );

                this.rayCaster.setFromCamera(this.mouse, this.camera)

                const intersects = this.rayCaster.intersectObjects(this.diceArray.map(dice => dice.mesh), true)
                if (intersects.length > 0) {
                    const clickedMeshUuid = intersects[0].object.uuid

                    // UUID에 해당하는 Dice 객체 찾기
                    const clickedDice = this.diceArray.find(dice => dice.mesh.uuid === clickedMeshUuid)

                    if (clickedDice) {
                        if (clickedDice.isSelected) {
                            clickedDice.isSelected = false;
                            this.scoreMap.delete(clickedDice.id);

                            // 원래 위치
                            const rigidBody = clickedDice.rigidBody;
                            rigidBody.setTranslation(
                                { x: clickedDice.originalPosition!.x, y: clickedDice.originalPosition!.y, z: clickedDice.originalPosition!.z },
                                true
                            );
                            // 움직임 멈추기
                            rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                            rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);

                            // 남아있는 주사위들의 위치 재정렬
                            Array.from(this.scoreMap.keys()).forEach((id, index) => {
                                const dice = this.diceArray.find(d => d.id === id);
                                if (dice) {
                                    const newPosition = getSelectedDicePosition(index);
                                    const diceRigidBody = dice.rigidBody;
                                    diceRigidBody.setTranslation(
                                        { x: newPosition.x, y: newPosition.y, z: newPosition.z },
                                        true
                                    );
                                    diceRigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                                    diceRigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
                                }
                            });
                        } else {
                            // 새로 선택된 주사위
                            const value = clickedDice.getDiceValue();
                            this.scoreMap.set(clickedDice.id, value);
                            clickedDice.isSelected = true;

                            // 선택된 주사위의 현재 index
                            const targetPosition = getSelectedDicePosition(this.scoreMap.size);
                            clickedDice.setOriginalPosition();

                            // 주사위 물리 바디 위치 업데이트
                            const rigidBody = clickedDice.rigidBody;
                            rigidBody.setTranslation(
                                { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
                                true
                            );
                            // 움직임 멈추기
                            rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                            rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
                        }
                    }
                }
            }
        })

        const elementsByClassName = document.getElementsByClassName("score");
        const self = this; // Rule 인스턴스를 저장

        for (let i = 0; i < elementsByClassName.length; i++) {
            const element = elementsByClassName[i];
            element.addEventListener("dblclick", function(this: HTMLElement) {
                // 점수 기입
                this.classList.remove("available");
                this.classList.remove("possible-score");
                self.round = 0;

                self.ui.setRoundText(self.round);
                self.gameFlag = false;

                let bonusScore = 0;
                let totalScore = 0;
                // 'available' 하지 않은 score 는 점수를 초기화
                for (let j = 0; j < elementsByClassName.length; j++) {
                    const scoreElement = elementsByClassName[j] as HTMLElement;
                    if (scoreElement.classList.contains("available")) {
                        scoreElement.textContent = "0";
                        scoreElement.classList.remove("possible-score");
                    }
                    if (j < 6) {
                        bonusScore += +(scoreElement.textContent || "0");
                        if (bonusScore >= 63) {
                            const bonusElement = document.getElementById("bonus");
                            if (bonusElement) {
                                bonusElement.textContent = "35";
                            }
                        }
                    }
                    if (self.ui.scoreText && j <= 12) {
                        totalScore += +(scoreElement.textContent || "0");
                        self.ui.setScoreText(totalScore);
                    }
                }

                self.scoreMap.clear();

                // dice 위치 초기화
                self.diceArray.forEach((dice: Dice) => dice.isSelected = false);
                self.turnStart();
                self.nextTurn();

                if (self.turn >= 12) {
                    alert(`당신의 점수는 ${totalScore} 입니다.`);
                }
            });
        }
    }

    turnStart() {
        this.gameFlag = false
        for (const dice of this.diceArray) {
            let i = 0;
            // diceAry 의 isSelected 를 제외한 나머지 값들을 cup 위치에 이동
            if (!dice.isSelected) {
                const rigidBody = dice.rigidBody;
                rigidBody.setTranslation(
                    {x: this.height[0], y: this.height[1] + i * 2, z: this.height[2]},
                    true
                );
            }
        }
    }

    nextTurn() {
        this.turn++;
        this.ui.setTurnText(this.turn);
    }

    scoreUpdate() {
        // 모든 주사위가 sleep 상태인지 확인
        const allDicesSleep = this.diceArray.every(dice => dice.isSleep);

        if (!allDicesSleep || !this.gameFlag) return;

        // 현재 선택된 주사위들의 값을 배열로 변환
        const selectedValues = Array.from(this.scoreMap.values());

        // 가능한 점수 조합 계산
        const possibleScores = {
            ones: selectedValues.filter(v => v === 1).reduce((a, b) => a + b, 0),
            twos: selectedValues.filter(v => v === 2).reduce((a, b) => a + b, 0),
            threes: selectedValues.filter(v => v === 3).reduce((a, b) => a + b, 0),
            fours: selectedValues.filter(v => v === 4).reduce((a, b) => a + b, 0),
            fives: selectedValues.filter(v => v === 5).reduce((a, b) => a + b, 0),
            sixes: selectedValues.filter(v => v === 6).reduce((a, b) => a + b, 0),
            chance: calculateSum(selectedValues),
            fourOfAKind: Array.from({ length: 6 }, (_, i) => i + 1)
                .some(num => countNumbers(selectedValues, num) >= 4) ? calculateSum(selectedValues) : 0,
            fullHouse: (() => {
                const counts = new Map<number, number>();
                selectedValues.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
                const hasThree = Array.from(counts.values()).some(count => count === 3);
                const hasTwo = Array.from(counts.values()).some(count => count === 2);
                return (hasThree && hasTwo) ? 25 : 0;
            })(),
            smallStraight: (() => {
                const unique = [...new Set(selectedValues)].sort();
                for (let i = 0; i <= unique.length - 4; i++) {
                    if (unique[i + 3] - unique[i] === 3) return 30;
                }
                return 0;
            })(),
            largeStraight: (() => {
                const unique = [...new Set(selectedValues)].sort();
                return unique.length === 5 && unique[4] - unique[0] === 4 ? 40 : 0;
            })(),
            yacht: (selectedValues.length >= 5 && selectedValues.every(v => v === selectedValues[0])) ? 50 : 0,
        };

        // HTML 요소 업데이트 및 하이라이트 효과
        Object.entries(possibleScores).forEach(([scoreType, score]) => {
            const element = document.getElementById(`${scoreType}`);
            if (element && element.classList.contains("available")) {
                element.textContent = score.toString();
                if (score > 0) {
                    element.classList.add('possible-score');
                }
                if (score <= 0) {
                    element.classList.remove('possible-score');
                }
            }
        });
    }

    update() {
        for (const dice of this.diceArray) {
            dice.update();
        }
        this.cup.update();
        this.scoreUpdate();
    }
    // 여기서 특정 조건이 완성되면 alert 함수 대신 아래 코드 실행.
    // this.ui.showLevelCompleted()
}