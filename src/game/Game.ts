import {PerspectiveCamera, Scene, WebGLRenderer, Vector3} from 'three'
import RAPIER, {World, EventQueue} from '@dimforge/rapier3d-compat'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import Environment from "../UI/Environment.ts";
import Rule from "./Rule.ts";
import GameBoard from "../components/GameBoard.ts";
import Wall from "../UI/Wall.ts";
import Background from "../UI/Background.ts";
import UI from "../UI/UI.ts";
import RapierDebugRenderer from "../components/debugger/RapierDebugRenderer.ts";
import DiceHolder from "../components/DiceHolder.ts";

export default class Game {
    scene: Scene
    camera: PerspectiveCamera
    renderer: WebGLRenderer
    controls?: OrbitControls
    rule!: Rule
    ui: UI
    world?: World
    rapierDebugRenderer?: RapierDebugRenderer
    eventQueue?: EventQueue

    constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.ui = new UI(this.renderer, this.camera)
    }

    async init() {
        await RAPIER.init()
        const gravity = new Vector3(0.0, -15, 0.0)
        this.world = new World(gravity)

        this.ui.init();

        this.eventQueue = new EventQueue(true)

        this.rapierDebugRenderer = new RapierDebugRenderer(this.scene, this.world)
        this.rapierDebugRenderer.enabled = true

        // rule
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.rule = new Rule(this.scene, this.world, this.camera, this.renderer, this.ui)
        await this.rule.init();

        const environment = new Environment(this.scene)
        await environment.init()

        // 게임장 생성
        const background = new Background({
            width: 500, height: 1, depth: 500
        }, {
            x: 0, y: -2.01, z: 0
        });
        await background.init(this.scene, this.world);

        const board = new GameBoard(this.scene, this.world, {width: 30, height: 7, depth: 30}, {x: 0, y: -1, z: 0});
        await board.init();

        new DiceHolder(this.scene, this.world, [-10, 0.001, -20], 3);

        const floorWidth = 30;  // 바닥 가로 길이
        const floorHeight = 1;  // 바닥 높이
        const railThickness = 1;  // 테두리 두께
        const railHeight = 100;  // 테두리 높이
        new Wall(this.scene, this.world, {
            width: floorWidth, height: railHeight, depth: railThickness
        }, {
            x: 0, y: railHeight / 2 - floorHeight, z: floorWidth / 2
        });
        new Wall(this.scene, this.world, {
            width: floorWidth, height: railHeight, depth: railThickness
        }, {
            x: 0, y: railHeight / 2 - floorHeight, z: -floorWidth / 2
        });
        new Wall(this.scene, this.world, {
            width: railThickness, height: railHeight, depth: floorWidth
        }, {
            x: -floorWidth / 2, y: railHeight / 2 - floorHeight, z: 0,
        });
        new Wall(this.scene, this.world, {
            width: railThickness, height: railHeight, depth: floorWidth
        }, {
            x: floorWidth / 2, y: railHeight / 2 - floorHeight, z: 0
        });

        this.ui.instructShow();
        this.ui.roundText.addEventListener("click", () => {
            this.rule.turnStart();
        });
    }

    update(delta: number) {
        this.rule.update();
        (this.world as World).timestep = Math.min(delta, 0.1)
        this.world?.step(this.eventQueue)
        this.controls?.update()
        // this.rapierDebugRenderer?.update()
    }
}