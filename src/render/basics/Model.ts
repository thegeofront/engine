import { Matrix4, Mesh, ShaderMesh, Vector3 } from "../../lib";
import { Material } from "./Material";

/**
 * model instance. 
 * 
 * Mind that
 * - Multiple models can share the same mesh 
 * - Multiple models can share the same material
 */
export class Model {

    constructor(
        public mesh: Mesh, 
        public material: Material) {}


    static new(mesh = Mesh.newIcosahedron(1), material = Material.default()) {
        return new Model(mesh, material);
    }
}