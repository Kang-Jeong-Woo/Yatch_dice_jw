import '../styles/style.css';
import {Scene, PerspectiveCamera, WebGLRenderer, Clock, VSMShadowMap} from 'three'
import Game from "./game/Game.ts";

const scene = new Scene()
const canvas = document.querySelector('canvas#gameCanvas') as HTMLCanvasElement;

const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(12.5, 35.8, 1.5);

const renderer = new WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = VSMShadowMap;

window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

// const stats = new Stats()
// document.body.appendChild(stats.dom)

const game = new Game(scene, camera, renderer)
await game.init()

const clock = new Clock()
let delta = 0

function animate() {
    requestAnimationFrame(animate)

    delta = clock.getDelta()

    game.update(delta)

    renderer.render(scene, camera)

    // stats.update()
}

animate()