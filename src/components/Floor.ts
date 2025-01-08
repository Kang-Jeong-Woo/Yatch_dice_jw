import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

export class Floor {
    private mesh: THREE.Mesh;
    private body: RAPIER.RigidBody;
    private shape: RAPIER.Collider;

    constructor(
        scene: THREE.Scene,
        world: RAPIER.World,
        color: string | number,
        width: number,
        height: number,
        depth: number,
        position: { x: number; y: number; z: number }
    ) {
        // Create the mesh
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshStandardMaterial({ color })
        );
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);

        // Create the rigid body
        this.body = world.createRigidBody(
            RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z)
        );
        this.shape = world.createCollider(
            RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2),
            this.body
        );
    }

    // Getter for the mesh (if needed later)
    getMesh() {
        return this.mesh;
    }

    // Getter for the rigid body (if needed later)
    getBody() {
        return this.body;
    }

    // Getter for the collider (if needed later)
    getShape() {
        return this.shape;
    }
}