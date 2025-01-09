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

await RAPIER.init()
const gravity = new RAPIER.Vector3(0.0, -10, 0.0)
const world = new RAPIER.World(gravity)
const dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = []

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
// controls.lock()
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

const dice1 = new Dice();
const dice2 = new Dice();
const dice3 = new Dice();
const dice4 = new Dice();
const dice5 = new Dice();
const cup = new Cup2();

// const cupCon = new CupController(cup, camera, scene);

const height = [10, 10, 0]

dice1.mkDice(scene, world, new THREE.Vector3(height[0], height[1]+2, height[2]));
dice2.mkDice(scene, world, new THREE.Vector3(height[0], height[1]+4, height[2]));
dice3.mkDice(scene, world, new THREE.Vector3(height[0], height[1]+6, height[2]));
dice4.mkDice(scene, world, new THREE.Vector3(height[0], height[1]+8, height[2]));
dice5.mkDice(scene, world, new THREE.Vector3(height[0], height[1]+10, height[2]));
cup.mkCup(scene, world, new THREE.Vector3(height[0], height[1], height[2]));

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

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        // cup.pour(clock.getDelta(), 1, Math.PI / 2);
        cup.pour(5000, Math.PI / 2);
    }
});

function animate() {
    requestAnimationFrame(animate)

    delta = clock.getDelta()
    world.timestep = Math.min(delta, 0.1)
    world.step()

    for (let i = 0, n = dynamicBodies.length; i < n; i++) {
        dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
        dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
    }

    dice1.update();
    dice2.update();
    dice3.update();
    dice4.update();
    dice5.update();
    cup.update();

    // cupCon.update(delta);

    // rapierDebugRenderer.update()
    controls.update()
    renderer.render(scene, camera)
    stats.update()
}

animate()



























