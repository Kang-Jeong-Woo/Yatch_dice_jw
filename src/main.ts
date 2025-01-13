import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import {Dice} from "./components/Dice.ts";
import RapierDebugRenderer from "./debugger/RapierDebugRenderer.ts";
import {Cup2} from "./components/Cup2.ts";
import {RGBELoader} from "three/addons/loaders/RGBELoader.js";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";

await RAPIER.init()
const gravity = new RAPIER.Vector3(0.0, -10, 0.0)
const world = new RAPIER.World(gravity)

let gameFlag: boolean = false;
const pickables: THREE.Mesh[] = []
const canvas = document.querySelector('canvas#gameCanvas') as HTMLCanvasElement;
const scene = new THREE.Scene()

const texture = await new RGBELoader().loadAsync("img/venice_sunset_1k.hdr");
scene.environment = texture
scene.background = texture
scene.environmentIntensity = 1

const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
);
camera.position.set(12.5, 35.8, 1.5);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.addEventListener("change", () => cameraFolder.controllers.forEach((controller) => controller.updateDisplay()))

// const controls = new PointerLockControls(camera, renderer.domElement)
// controls.lock() // <= 이렇게 바로 lock 을 하면 안 됨.
// const menuPanel = document.getElementById('menuPanel') as HTMLDivElement
// const startButton = document.getElementById('startButton') as HTMLButtonElement
// startButton.addEventListener('click',() => {controls.lock()},false)
// controls.addEventListener('change', () => {console.log('pointerlock change')})

const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

// 게임 plane
const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(30, 1, 30), new THREE.MeshStandardMaterial({color: 0x597E19}));
floorMesh.receiveShadow = true
floorMesh.position.y = -1
scene.add(floorMesh)
const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0))
const floorShape = RAPIER.ColliderDesc.cuboid(15, 0.5, 15)
world.createCollider(floorShape, floorBody)

// 가드레일 생성함수
function createGuardRail(scene: THREE.Scene, world: RAPIER.World, width: number, height: number, depth: number, x: number, y: number, z: number) {
    // Mesh 생성
    const railMesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({
            // color: 0x00ffcc,
            color: 0xffffff,
            roughness: 0,
            transparent: true,
            opacity: 0,
            depthWrite: false}) // 테두리 색상
    );
    railMesh.receiveShadow = true;
    railMesh.position.set(x, y, z);
    scene.add(railMesh);

    // RigidBody 생성
    const railBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z)
    );
    const railShape = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2);
    world.createCollider(railShape, railBody);
}

// 테두리 크기 및 배치
const floorWidth = 30;  // 바닥 가로 길이
const floorHeight = 1;  // 바닥 높이
const railThickness = 1;  // 테두리 두께
const railHeight = 100;  // 테두리 높이

// 앞쪽 테두리
createGuardRail(scene, world, floorWidth, railHeight, railThickness, 0, railHeight / 2 - floorHeight, floorWidth / 2);
// 뒤쪽 테두리
createGuardRail(scene, world, floorWidth, railHeight, railThickness, 0, railHeight / 2 - floorHeight, -floorWidth / 2);
// 왼쪽 테두리
createGuardRail(scene, world, railThickness, railHeight, floorWidth, -floorWidth / 2, railHeight / 2 - floorHeight, 0);
// 오른쪽 테두리
createGuardRail(scene, world, railThickness, railHeight, floorWidth, floorWidth / 2, railHeight / 2 - floorHeight, 0);

// 마룻바닥
let woodTexture = await new THREE.TextureLoader().loadAsync('img/tree.jpg');
const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    polygonOffset: true, // Z-fighting 방지
    polygonOffsetFactor: -1, // 우선순위를 후순위
    polygonOffsetUnits: -4,
});
const background = new THREE.Mesh(new THREE.BoxGeometry(200, 1, 200), woodMaterial);
background.receiveShadow = true;
background.position.y = -2.01;
scene.add(background);
const backgroundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -2.01, 0))
const backgroundShape = RAPIER.ColliderDesc.cuboid(100, 0.5, 100);
world.createCollider(backgroundShape, backgroundBody);

const diceArray: Dice[] = [];

// 주사위 생성 및 초기화
const height = [10, 10, 0];
for (let i = 0; i < 5; i++) {
    const dice = new Dice();
    await dice.mkDice(i, scene, world, new THREE.Vector3(height[0], height[1] + i * 2, height[2]));
    diceArray.push(dice);
    pickables.push(dice.dynamicBodies[0]);
}

// 모든 주사위가 sleep 상태인지 확인하는 함수
function areAllDiceAsleep(diceArray: Dice[]): boolean {
    return diceArray.every(dice => !dice.isSelected && dice.isSleep);
}

const cup = new Cup2();
await cup.mkCup(scene, world, new THREE.Vector3(height[0], height[1]-1, height[2]));
// const cupCon = new CupController(cup, camera, scene);

const rapierDebugRenderer = new RapierDebugRenderer(scene, world)

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
// 카메라 설정 값을 저장할 객체
const cameraSettings = {
    fov: 75,
    posX: camera.position.x,
    posY: camera.position.y,
    posZ: camera.position.z,
    lookAtX: 0,
    lookAtY: 0,
    lookAtZ: 0,
};
const cameraFolder = gui.addFolder("Camera Position");
cameraFolder.add(camera.position, "x", -50, 50).name("X").onChange((value) => {
    camera.position.x = value;
});
cameraFolder.add(camera.position, "y", -50, 50).name("Y").onChange((value) => {
    camera.position.y = value;
});
cameraFolder.add(camera.position, "z", -50, 50).name("Z").onChange((value) => {
    camera.position.z = value;
});
const targetFolder = gui.addFolder("Camera Target");
targetFolder.add(cameraSettings, "lookAtX", -50, 50).name("Target X").onChange(() => {
    camera.lookAt(
        cameraSettings.lookAtX,
        cameraSettings.lookAtY,
        cameraSettings.lookAtZ
    );
});
targetFolder.add(cameraSettings, "lookAtY", -50, 50).name("Target Y").onChange(() => {
    camera.lookAt(
        cameraSettings.lookAtX,
        cameraSettings.lookAtY,
        cameraSettings.lookAtZ
    );
});
targetFolder.add(cameraSettings, "lookAtZ", -50, 50).name("Target Z").onChange(() => {
    camera.lookAt(
        cameraSettings.lookAtX,
        cameraSettings.lookAtY,
        cameraSettings.lookAtZ
    );
});

const physicsFolder = gui.addFolder('Physics')
physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1)

// 라운드 시작
const roundStart = () => {
    gameFlag = false
    for (const dice of diceArray) {
        let i = 0;
        // diceAry 의 isSelected 를 제외한 나머지 값들을 cup 위치에 이동
        if(!dice.isSelected) {
            const rigidBody = dice.dynamicBodies[1];
            rigidBody.setTranslation(
                { x: height[0], y: height[1] + i * 2, z: height[2] },
                true
            );
            dice.originalPosition = null;
        }
    }
}

// HTML에서 라운드 시작 버튼 가져오기
const roundStartBtn = document.querySelector('#round-start') as HTMLButtonElement;
roundStartBtn.addEventListener('click', (e) => {roundStart()})

// 버튼 이벤트 리스너
// shakeButton.addEventListener('click', cup.pour(clock.getDelta(), 1000));

let round = 0;

// 게임 시작
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !gameFlag) {
        gameFlag = true;
        cup.pour(5000, Math.PI / 2);
        round++;
    }
});

// 다이스의 selected 를 raycaster 를 사용하여 바꿔주는 함수
const raycaster = new THREE.Raycaster()

const mouse = new THREE.Vector2()

// scene의 모든 주사위 메시를 가져옴
const diceObjects = diceArray.map(dice => dice.dynamicBodies[0])

const scoreMap: Map<number, number> = new Map<number, number>();
const originalPositionMap: Map<number, THREE.Vector3> = new Map<number, THREE.Vector3>();

// 선택된 주사위들을 위한 위치 계산 함수
const getSelectedDicePosition = (index: number): THREE.Vector3 => {
    // score map 의 size 를 사용해서 -15 부터 x 좌표를 주사위 개수에 따라 균등하게 분배
    // const x = -10 + (20 * (index / (diceArray.length - 1)));
    const x = -15 + (5 * scoreMap.size);
    return new THREE.Vector3(x, 0.001, -20);
}

renderer.domElement.addEventListener('dblclick', (e) => {
    console.log("더블 클릭 이벤트: ",gameFlag);
    if (gameFlag) {
        console.log("더블 클릭!")
        // canvas의 경계 정보를 가져옴
        const rect = renderer.domElement.getBoundingClientRect();

        // 마우스 좌표를 canvas 기준으로 변환
        mouse.set(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera)

        const intersects = raycaster.intersectObjects(diceObjects, true)
        if (intersects.length > 0) {
            const clickedMeshUuid = intersects[0].object.uuid

            // UUID에 해당하는 Dice 객체 찾기
            const clickedDice = diceArray.find(dice => dice.dynamicBodies[0].uuid === clickedMeshUuid)

            if (clickedDice) {
                if (clickedDice.isSelected) {
                    clickedDice.isSelected = false;
                    scoreMap.delete(clickedDice.id);

                    // 원래 위치
                    const rigidBody = clickedDice.dynamicBodies[1];
                    rigidBody.setTranslation(
                        { x: clickedDice.originalPosition!.x, y: clickedDice.originalPosition!.y, z: clickedDice.originalPosition!.z },
                        true
                    );
                    // 움직임 멈추기
                    rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
                } else {
                    // 새로 선택된 주사위
                    const value = clickedDice.getDiceValue();
                    scoreMap.set(clickedDice.id, value);
                    clickedDice.isSelected = true;

                    // 선택된 주사위의 현재 index
                    const selectedCount = Array.from(scoreMap.keys()).sort().indexOf(clickedDice.id);
                    const targetPosition = getSelectedDicePosition(selectedCount);

                    // 주사위 물리 바디 위치 업데이트
                    const rigidBody = clickedDice.dynamicBodies[1];
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

const clock = new THREE.Clock()
let delta

function animate() {
    requestAnimationFrame(animate)

    delta = clock.getDelta() * 2;
    world.timestep = Math.min(delta, 0.1)
    world.step()

    for (const dice of diceArray) {
        dice.update();
    }

    cup.update();

    // cupCon.update(delta);

    // rapierDebugRenderer.update()
    controls.update()
    renderer.render(scene, camera)
    stats.update()
}

animate()