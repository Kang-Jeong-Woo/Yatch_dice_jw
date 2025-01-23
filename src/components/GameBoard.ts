import {Mesh, MeshStandardMaterial, Scene} from "three";
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
        model.scene.traverse((child)=>{
            if (child instanceof Mesh) {
                const oldMaterial = child.material as MeshStandardMaterial;
                child.material = new MeshStandardMaterial({
                    map: oldMaterial.map, // 색상 텍스처 유지
                    normalMap: oldMaterial.normalMap, // 노멀 맵 유지
                    roughnessMap: oldMaterial.roughnessMap, // 거칠기 맵 유지
                    metalnessMap: oldMaterial.metalnessMap, // 금속성 맵 유지
                    displacementMap: oldMaterial.displacementMap, // 디스플레이스 맵 유지
                    alphaMap: oldMaterial.alphaMap, // 알파 맵 유지
                    emissiveMap: oldMaterial.emissiveMap, // 발광 맵 유지
                    emissive: oldMaterial.emissive, // 발광 색상 유지
                    roughness: oldMaterial.roughness, // 거칠기 값 유지
                    metalness: oldMaterial.metalness, // 금속성 값 유지
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
        const boardMesh = model.scene.getObjectByName('Scene') as Mesh
        boardMesh.position.set(this.position.x, this.position.y, this.position.z);
        boardMesh.rotation.x = -Math.PI / 2;
        boardMesh.receiveShadow = true;
        this.scene.add(boardMesh);
    }

}