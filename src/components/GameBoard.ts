import {Mesh, Scene} from "three";
import {ColliderDesc, RigidBodyDesc, World} from "@dimforge/rapier3d-compat";
import IGeometry from "../UI/interface/IGeometry.ts";
import IPosition from "../UI/interface/IPosition.ts";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

export default class GameBoard {
    scene: Scene;
    world: World;
    position: IPosition;
    constructor(
        scene: Scene,
        world: World,
        geometry: IGeometry,
        position: IPosition
    ) {
        this.scene = scene;
        this.world = world;
        this.position = position;

        const boardBody = world.createRigidBody(
            RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z)
        );
        const boardShape = ColliderDesc.cuboid(geometry.width / 2, geometry.height / 2, geometry.depth / 2)

        world.createCollider(boardShape, boardBody);
    }

    async init(): Promise<void> {
        const gltfLoader = new GLTFLoader();
        const model = await gltfLoader.loadAsync('models/WoodenBoard.glb');
        const boardMesh = model.scene.getObjectByName('Scene') as Mesh
        boardMesh.position.set(this.position.x, this.position.y, this.position.z);
        boardMesh.rotation.x = -Math.PI / 2;
        boardMesh.receiveShadow = true;
        this.scene.add(boardMesh);
    }

}