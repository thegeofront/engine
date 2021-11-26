import { Cube, Matrix4, Mesh, ShaderMesh, Vector3 } from "../../lib";
import { Entity } from "./Entity";
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

    static new(mesh = Mesh.newIcosahedron(), material = Material.default()) {
        return new Model(mesh, material);
    }

    /**
     * Spawns an entity equiped with this model
     */
    spawn() {
        return Entity.new(Matrix4.newIdentity(), this);
    }
}