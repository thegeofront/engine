import { Mesh, MultiLine, ShaderMesh } from "../../lib";
import { Entity } from "./Entity";

export type Renderable = MultiLine | Mesh | ShaderMesh | Entity;