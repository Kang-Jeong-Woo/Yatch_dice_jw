import * as THREE from "three";
import RAPIER from '@dimforge/rapier3d-compat'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import {Dice} from "./components/Dice.ts";
import RapierDebugRenderer from "./debugger/RapierDebugRenderer.ts";

await RAPIER.init()
const gravity = new RAPIER.Vector3(0.0, -8, 0.0)
const world = new RAPIER.World(gravity)
const dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = []

const canvas = document.querySelector('canvas#gameCanvas') as HTMLCanvasElement;
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
);
camera.position.set(0, 23, 0);
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

const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

// 게임 볼
const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(30, 1, 30), new THREE.MeshStandardMaterial({color: 0x8c0000}));
floorMesh.receiveShadow = true
floorMesh.position.y = -1
scene.add(floorMesh)
const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0))
const floorShape = RAPIER.ColliderDesc.cuboid(15, 0.5, 15)
world.createCollider(floorShape, floorBody)

// 바닥 테두리 생성
const guardRail = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 1), new THREE.MeshStandardMaterial({color: 0x000000}));
guardRail.receiveShadow = true
guardRail.position.y = 5
scene.add(guardRail)
const guardRailBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, 5, 0))
const guardRailShape = RAPIER.ColliderDesc.cuboid(15, 5, 0.5)
world.createCollider(guardRailShape, guardRailBody)

// 마룻바닥
let woodTexture = await new THREE.TextureLoader().loadAsync('img/tree.jpg');
const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    polygonOffset: true, // Z-fighting 방지
    polygonOffsetFactor: -1, // 우선순위를 후순위
    polygonOffsetUnits: -4,
});
const background = new THREE.Mesh(new THREE.BoxGeometry(100, 1, 100), woodMaterial);
background.receiveShadow = true;
background.position.y = -2.01;
scene.add(background);
const backgroundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -2.01, 0))
const backgroundShape = RAPIER.ColliderDesc.cuboid(50, 0.5, 50);
world.createCollider(backgroundShape, backgroundBody);

const dice1 = new Dice();
const dice2 = new Dice();
const dice3 = new Dice();
const dice4 = new Dice();
const dice5 = new Dice();

dice1.mkDice(scene, world, new THREE.Vector3(-1, 5, 0));
dice2.mkDice(scene, world, new THREE.Vector3(-2, 5, 0));
dice3.mkDice(scene, world, new THREE.Vector3(0, 5, 0));
dice4.mkDice(scene, world, new THREE.Vector3(1, 5, 0));
dice5.mkDice(scene, world, new THREE.Vector3(2, 5, 0));

const rapierDebugRenderer = new RapierDebugRenderer(scene, world)

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
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

const physicsFolder = gui.addFolder('Physics')
physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1)



const clock = new THREE.Clock()
let delta

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

    // rapierDebugRenderer.update()
    controls.update()
    renderer.render(scene, camera)
    stats.update()
}

animate()



























