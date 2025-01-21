import {
    AmbientLight,
    EquirectangularReflectionMapping,
    Scene,
} from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

export default class Environment {
    scene: Scene
    light: AmbientLight

    constructor(scene: Scene) {
        this.scene = scene

        this.light = new AmbientLight(0xffffff, Math.PI)
        this.scene.add(this.light)
    }

    async init() {
        await new RGBELoader().loadAsync('img/venice_sunset_1k.hdr').then((texture) => {
            texture.mapping = EquirectangularReflectionMapping
            this.scene.environment = texture
            this.scene.background = texture
            this.scene.backgroundBlurriness = 0.4
            this.scene.environmentIntensity = 1
        })
    }
}