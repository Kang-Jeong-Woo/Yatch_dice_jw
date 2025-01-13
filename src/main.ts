import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import {Dice} from "./components/Dice.ts";
import RapierDebugRenderer from "./debugger/RapierDebugRenderer.ts";
import {Cup2} from "./components/Cup2.ts";
import {CupController} from "./components/CupController.ts";
import {RGBELoader} from "three/addons/loaders/RGBELoader.js";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";

await RAPIER.init()
const gravity = new RAPIER.Vector3(0.0, -10, 0.0)
const world = new RAPIER.World(gravity)
// const dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = []

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
    // return diceArray.every(dice => dice.dynamicBodies.every(([_, body]) => body.isSleeping()));
    return diceArray.every(dice => dice.id === true);
}

const cup = new Cup2();
// const cupCon = new CupController(cup, camera, scene);
await cup.mkCup(scene, world, new THREE.Vector3(height[0], height[1], height[2]));

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

const clock = new THREE.Clock()
let delta

// HTML에서 버튼 가져오기
const shakeButton = document.querySelector('#shake-button') as HTMLButtonElement;

// 버튼 이벤트 리스너
// shakeButton.addEventListener('click', cup.pour(clock.getDelta(), 1000));

document.addEventListener('keydown', async (event) => {
    if (event.code === 'Space' && !gameFlag) {
        gameFlag = true;

        // 컵 기울이기
        // cup.pour(clock.getDelta(), 1, Math.PI / 2);
        await cup.pour(5000, Math.PI / 2);

        // 모든 주사위가 sleep 상태인지 확인
        // if (areAllDiceAsleep(diceArray)) {
        if (false) {
            const scoreAry: Array<number> = [];
            for (const dice of diceArray) {
                scoreAry.push(dice.getDiceValueClone(dice.id));
            }
            console.log("All dice are asleep. Values: ", scoreAry);

            // 사용자 입력 대기 (주사위 클릭으로 선택) => raycaster 로 동작할 수 있도록 수정.
            // scene.addEventListener('click', (event) => {
            //     const selectedDice = getClickedDice(event, diceArray); // 클릭한 주사위를 반환하는 함수
            //     if (selectedDice) {
            //         selectedDice.select();
            //         console.log(`Selected dice value: ${selectedDice.getDiceValue(selectedDice.dynamicBodies[0][0])}`);
            //     }
            // });

            // 다시 컵 기울이기
            // await cup.pour(5000, Math.PI / 2);

            // 선택되지 않은 주사위만 다시 굴림
            // diceArray.forEach(dice => {
            //     if (!dice.isSelected) {
            //         dice.resetPhysics(world);
            //     }
            // });
        }

        // gameFlag = false;
    }
});

// 다이스의 selected 를 raycaster 를 사용하여 바꿔주는 함수
const raycaster = new THREE.Raycaster()

const mouse = new THREE.Vector2()

// 전체 scene의 객체들과 교차 검사
const allObjects = []
scene.traverse(object => {
    if (object instanceof THREE.Mesh) {
        allObjects.push(object)
    }
})

// scene의 모든 주사위 메시를 가져옴
const diceObjects = diceArray.map(dice => dice.dynamicBodies[0])

const arrowHelper = new THREE.ArrowHelper()
arrowHelper.setLength(0.5)

renderer.domElement.addEventListener('mousemove', (e) => {
    // 'mousemove' 이벤트에 맞춰서 캔버스에 마우스 위치 입력
    mouse.set((e.clientX / renderer.domElement.clientWidth) * 2 - 1, -(e.clientY / renderer.domElement.clientHeight) * 2 + 1)

    // 새로운 마우스 위치와 방향으로 Ray를 업데이트
    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(allObjects);
    // const intersects = raycaster.intersectObjects(diceObjects);

    if (intersects.length) {
        const n = new THREE.Vector3()
        n.copy((intersects[0].face as THREE.Face).normal)
        n.transformDirection(intersects[0].object.matrixWorld)

        arrowHelper.setDirection(n)
        arrowHelper.position.copy(intersects[0].point)
    }
})


renderer.domElement.addEventListener('dblclick', (e) => {
    // canvas의 경계 정보를 가져옴
    const rect = renderer.domElement.getBoundingClientRect();

    // 마우스 좌표를 canvas 기준으로 변환
    mouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    // mouse.set((e.clientX / renderer.domElement.clientWidth) * 2 - 1, -(e.clientY / renderer.domElement.clientHeight) * 2 + 1)

    raycaster.setFromCamera(mouse, camera)

    console.log('Total meshes in scene:', allObjects)
    console.log('Total meshes in scene:', diceObjects)
    const intersects = raycaster.intersectObjects(diceObjects, true)
    console.log('Intersected objects:', intersects)

    if (intersects.length > 0) {
        const clickedMeshUuid = intersects[0].object.uuid

        // UUID에 해당하는 Dice 객체를 찾음
        const clickedDice = diceArray.find(dice => dice.dynamicBodies[0].uuid === clickedMeshUuid)

        if (clickedDice) {
            // getDiceValue 함수 호출
            const value = clickedDice.getDiceValueClone(clickedDice.id)
            console.log('Clicked dice value:', value)
        }
    }







    // // ray와 교차하는 객체들을 찾음
    // const intersects = raycaster.intersectObjects(diceObjects)
    //
    // if (intersects.length > 0) {
    //     // 첫 번째로 교차된 객체의 UUID를 가져옴
    //     const clickedMeshUuid = intersects[0].object.uuid
    //
    //     // UUID에 해당하는 Dice 객체를 찾음
    //     const clickedDice = diceArray.find(dice => dice.dynamicBodies[0].uuid === clickedMeshUuid)
    //
    //     if (clickedDice) {
    //         // getDiceValue 함수 호출
    //         const value = clickedDice.getDiceValueClone(clickedDice.id)
    //         console.log('Clicked dice value:', value)
    //     }
    // }










    // raycaster.intersectObject(diceArray, false);
    // const intersects = raycaster.intersectObjects(pickables, false)
    //
    // if (intersects.length) {
    //     console.log("클릭된 객체", intersects);
    // }

    // 주사위 배열에서 교차된 객체 검색
    // const intersects = raycaster.intersectObjects(diceArray.map(state => state.dynamicBodies[0]));

    // const intersects = raycaster.intersectObjects(pickables);
    //
    // console.log("the fuck...? : ",pickables)
    // console.log(intersects)
    //
    // if (intersects.length > 0) {
    //     const clickedMesh = intersects[0].object; // 가장 가까운 교차 객체
    //     const clickedDice = diceArray.find(state => state.dynamicBodies[0] === clickedMesh);
    //
    //     if (clickedDice) {
    //         console.log("Clicked dice:", clickedDice);
    //     }
    // }

    // const intersects = raycaster.intersectObjects(scene.children, true);
    //
    // if (intersects.length > 0) {
    //     const clickedObject = intersects[0].object;
    //     const clickedDice = diceArray.find(state => state.dynamicBodies[0] === clickedObject);
    //
    //     if (clickedDice) {
    //         console.log("Clicked dice:", clickedDice);
    //     }
    // }
})

function animate() {
    requestAnimationFrame(animate)

    delta = clock.getDelta()
    world.timestep = Math.min(delta, 0.1)
    world.step()

    // for (let i = 0, n = dynamicBodies.length; i < n; i++) {
    //     dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
    //     dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
    // }

    for (const dice of diceArray) {
        dice.update();
    }

    // dice1.update();
    // dice2.update();
    // dice3.update();
    // dice4.update();
    // dice5.update();
    cup.update();

    // cupCon.update(delta);

    // rapierDebugRenderer.update()
    controls.update()
    renderer.render(scene, camera)
    stats.update()

    // if (diceArray.every(state => state.isSleep) && gameFlag) {
    //     gameFlag = false;
    //     const scoreAry: Array<number> = [];
    //     for (const dice of diceArray) {
    //         scoreAry.push(dice.getDiceValueClone(dice.id));
    //     }
    // }

    // 사용자 입력 대기 (주사위 클릭으로 선택) => raycaster 로 동작할 수 있도록 수정.
    // scene.addEventListener('click', (event) => {
    //     const selectedDice = getClickedDice(event, diceArray); // 클릭한 주사위를 반환하는 함수
    //     if (selectedDice) {
    //         selectedDice.select();
    //         console.log(`Selected dice value: ${selectedDice.getDiceValue(selectedDice.dynamicBodies[0][0])}`);
    //     }
    // });

    // 선택되지 않은 주사위만 다시 굴림
    // diceArray.forEach(dice => {
    //     if (!dice.isSelected) {
    //         dice.resetPhysics(world);
    //     }
    // });
}

animate()



























