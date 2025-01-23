import {BoxGeometry, Mesh, MeshStandardMaterial, RepeatWrapping, Scene, SRGBColorSpace, TextureLoader} from "three";
import {ColliderDesc, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import IGeometry from "./interface/IGeometry.ts";
import IPosition from "./interface/IPosition.ts";

export default class Background {
    private geometry: IGeometry;
    private position: IPosition;
    constructor(
        geometry: IGeometry,
        position: IPosition
    ) {
        this.geometry = geometry;
        this.position = position;
    }

    async init(scene:Scene, world:World) {
        const textureLoader = new TextureLoader();

        const textureArm = await textureLoader.loadAsync("img/background/leafy_grass_arm_1k.jpg");
        const textureDiff = await textureLoader.loadAsync("img/background/leafy_grass_diff_1k.jpg")
        textureDiff.colorSpace = SRGBColorSpace;
        const textureDisp = await textureLoader.loadAsync("img/background/leafy_grass_disp_1k.jpg")
        const textureGl = await textureLoader.loadAsync("img/background/leafy_grass_nor_gl_1k.jpg")

        textureArm.repeat.set(8, 8);
        textureDiff.repeat.set(8, 8);
        textureDisp.repeat.set(8, 8);
        textureGl.repeat.set(8, 8);
        textureArm.wrapS = RepeatWrapping;
        textureDiff.wrapS = RepeatWrapping;
        textureDisp.wrapS = RepeatWrapping;
        textureGl.wrapS = RepeatWrapping;
        textureArm.wrapT = RepeatWrapping;
        textureDiff.wrapT = RepeatWrapping;
        textureDisp.wrapT = RepeatWrapping;
        textureGl.wrapT = RepeatWrapping;

        const woodMaterial = new MeshStandardMaterial({
            map: textureDiff,
            aoMap: textureArm,
            roughnessMap: textureArm,
            metalnessMap: textureArm,
            normalMap: textureGl,
            displacementMap: textureDisp,
            polygonOffset: true, // Z-fighting 방지
            polygonOffsetFactor: -1, // 우선순위를 후순위
            polygonOffsetUnits: -4,
        })
        const background = new Mesh(new BoxGeometry(this.geometry.width, this.geometry.height, this.geometry.depth, 100, 100, 100), woodMaterial);
        background.position.set(this.position.x, this.position.y, this.position.z);
        background.receiveShadow = true;
        scene.add(background);

        const backgroundBody = world.createRigidBody(RigidBodyDesc.fixed().setTranslation(this.position.x, this.position.y, this.position.z));
        const backgroundShape = ColliderDesc.cuboid(this.geometry.width / 2, this.geometry.height / 2, this.geometry.depth / 2);
        world.createCollider(backgroundShape, backgroundBody);
    }
}