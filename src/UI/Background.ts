import {BoxGeometry, Mesh, MeshStandardMaterial, Scene, TextureLoader} from "three";
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
        const woodTexture = await textureLoader.loadAsync('img/tree.jpg');
        const woodMaterial = new MeshStandardMaterial({
            map: woodTexture,
            polygonOffset: true, // Z-fighting 방지
            polygonOffsetFactor: -1, // 우선순위를 후순위
            polygonOffsetUnits: -4,
        })
        const background = new Mesh(new BoxGeometry(this.geometry.width, this.geometry.height, this.geometry.depth), woodMaterial);
        background.position.set(this.position.x, this.position.y, this.position.z);
        background.receiveShadow = true;
        scene.add(background);

        const backgroundBody = world.createRigidBody(RigidBodyDesc.fixed().setTranslation(this.position.x, this.position.y, this.position.z));
        const backgroundShape = ColliderDesc.cuboid(this.geometry.width / 2, this.geometry.height / 2, this.geometry.depth / 2);
        world.createCollider(backgroundShape, backgroundBody);
    }
}