import { Mesh, ShaderMesh } from "../../lib";
import { Material } from "./Material";

export class Model {

    constructor(
        public mesh: Mesh, 
        public material: Material) {}
}