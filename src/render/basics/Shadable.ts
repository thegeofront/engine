import { Mesh, MultiLine, ShaderMesh } from "../../lib";
import { LineShader } from "../shaders-old/line-shader";
import { MeshDebugShader } from "../shaders-old/mesh-debug-shader";
import { PhongShader } from "../shaders/PhongShader";
import { TexturedMeshShader } from "../shaders/TexturedMeshShader";
import { WebGl } from "../webgl/HelpGl";
import { Entity } from "./Entity";

export type Shadable = MultiLine | Mesh | ShaderMesh;


export type AnyShader = LineShader | MeshDebugShader;

// type AcceptableShader =
//     | DotShader
//     | ShadedMeshShader
//     | MeshDebugShader
//     | LineShader
//     | TextureMeshShader;

export function createNewShaderForShadable(s: Shadable, gl: WebGl): AnyShader | undefined {
    if (s instanceof MultiLine) {
        return new LineShader(gl);
    } else if (s instanceof MultiLine) {
        return new LineShader(gl);
    } else if (s instanceof Mesh) {
        return new MeshDebugShader(gl);
    } else {
        console.warn("No shader can be found for shadable: ", s);
        return undefined;
    }
}