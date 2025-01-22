import '../styles/style.css';
import {Scene, PerspectiveCamera, WebGLRenderer, Clock, VSMShadowMap} from 'three'
import Game from "./game/Game.ts";
// import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
// import Stats from "three/examples/jsm/libs/stats.module.js";

const scene = new Scene()
const canvas = document.querySelector('canvas#gameCanvas') as HTMLCanvasElement;

const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(0, 50, 30);

const renderer = new WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = VSMShadowMap;

// const stats = new Stats()
// document.body.appendChild(stats.dom)

// const gui = new GUI()
//
// const cameraFolder = gui.addFolder("Camera Position");
// cameraFolder.add(camera.position, "x", -50, 50).name("X").onChange((value:any) => {
//     camera.position.x = value;
// });
// cameraFolder.add(camera.position, "y", -50, 50).name("Y").onChange((value:any) => {
//     camera.position.y = value;
// });
// cameraFolder.add(camera.position, "z", -50, 50).name("Z").onChange((value:any) => {
//     camera.position.z = value;
// });

const game = new Game(scene, camera, renderer)
await game.init()

const clock = new Clock()
let delta = 0

function animate() {
    requestAnimationFrame(animate)

    delta = clock.getDelta() * 2

    game.update(delta)

    renderer.render(scene, camera)

    // stats.update()
}

animate()