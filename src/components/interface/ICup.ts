import {Mesh} from "three";
import {RigidBody} from "@dimforge/rapier3d-compat";

export default interface ICup {
    mesh: Mesh;
    rigidBody: RigidBody;
}