import {
    AmbientLight, DirectionalLight, EquirectangularReflectionMapping,
    Scene,
} from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

export default class Environment {
    scene: Scene
    light: AmbientLight
    directionalLight: DirectionalLight;

    constructor(scene: Scene) {
        this.scene = scene

        this.light = new AmbientLight(0xffffff, Math.PI * 0.7)
        this.scene.add(this.light)

        this.directionalLight = new DirectionalLight(0xffffff, Math.PI * 0.7);
        this.directionalLight.position.set(65.7, 80, 50.2);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);
    }

    async init() {
        await new RGBELoader().loadAsync('img/environment/pretoria_gardens_1k.hdr').then((texture) => {
            texture.mapping = EquirectangularReflectionMapping
            this.scene.environment = texture
            this.scene.background = texture
            this.scene.backgroundBlurriness = 0
            // this.scene.environmentIntensity = 1
        })
    }
}