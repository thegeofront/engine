import { Matrix4, Mesh, ShaderMesh, Vector3 } from "../../lib";
import { Material } from "./Material";

/**
 * model instance. 
 * subject to change, if we want more complex entities, for example
 * represents something's entire 3D presence
 * 
 * NOTE: 
 * - Position is always unique. NEVER will two models share a matrix
 * - Multiple models can share the same mesh 
 * - Multiple models can share the same material
 */
export class Model {

    constructor(
        public position: Matrix4,
        public mesh: Mesh, 
        public material: Material) {}

    /**
     * Use this if you just want 'something' to show up
     */
    static default() {
        return new Model(
            Matrix4.newIdentity(),
            Mesh.newSphere(Vector3.zero(), 1, 6, 12),
            Material.default(),
        )
    }
}