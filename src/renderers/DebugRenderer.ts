// purpose: something that is willing to create new Shaders on the fly, to render whatever it gets

import { MultiVector3 } from "../data/MultiVector3";
import { Curve } from "../geometry/curve/Curve";
import { Polyline } from "../geometry/curve/Polyline";
import { createRandomGUID } from "../math/Random";
import { Mesh } from "../mesh/Mesh";
import { MultiLine } from "../mesh/MultiLine";
import { ShaderMesh } from "../mesh/ShaderMesh";
import { DotShader } from "../shaders-old/dot-shader";
import { LineShader } from "../shaders-old/line-shader";
import { MeshDebugShader } from "../shaders-old/mesh-debug-shader";
import { ShadedMeshShader } from "../shaders-old/shaded-mesh-shader";
import { Context } from "../render/Context";
import { Shader } from "../webgl/Shader";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { Billboard, BillboardPayload, BillboardShader } from "../shaders/BillboardShader";
import { ImageMesh } from "../render/bufferables/ImageMesh";
import { Parameter } from "../parametric/Parameter";
import { UI } from "../dom/UI";
import { BiSurface, Plane, TextureMeshShader } from "../lib";

// NOTE: I think this type of polymorphism is better than regular polymorphism
export type RenderableUnit =
    | MultiVector3
    | ShaderMesh
    | Mesh
    | BiSurface
    | Curve
    | Polyline
    | Plane
    | MultiLine
    | ImageMesh;
type AcceptableShader =
    | DotShader
    | ShadedMeshShader
    | MeshDebugShader
    | LineShader
    | TextureMeshShader;

/**
 * Renderer which can instantly visualize a large number of geometries. Very useful for looking at intermediate data.
 */
export class DebugRenderer {
    private constructor(
        private gl: WebGl,
        private shaders: Map<string, AcceptableShader>,
        private activeShaders: Set<string>,
    ) {}

    static new(gl: WebGl): DebugRenderer {
        return new DebugRenderer(gl, new Map(), new Set());
    }

    /**
     * Creates a new shader, or updates existing shader
     */
    set(unit: RenderableUnit, key?: string) {
        if (!key) {
            key = createRandomGUID().slice(0, 8);
        }

        let shader = this.shaders.get(key);
        if (!shader) {
            return this.add(key, unit);
        }

        // If the type definitions above are set correctly
        // and if the 'add' procedure went correctly, this will work
        //@ts-ignore
        shader?.set(unit);
        return shader;
    }

    addUi(ui: UI) {
        ui.clear();
        for (let [key, _] of this.shaders) {
            let p = Parameter.newBoolean(key, true);
            ui.addBooleanParameter(p, () => {
                this.onChange(key, p.state !== 0);
            });
        }
    }

    onChange(key: string, state: boolean) {
        console.log(state);
        if (state) {
            this.activeShaders.add(key);
        } else {
            this.activeShaders.delete(key);
        }
    }

    render(c: Context) {
        for (let key of this.activeShaders) {
            this.shaders.get(key)!.render(c);
        }
    }

    private add(key: string, unit: RenderableUnit) {
        let shader;
        let gl = this.gl;

        // determine the RenderableUnit type
        // rely as much on the defaults as possilbe
        if (unit instanceof MultiVector3) {
            shader = new DotShader(gl);
            shader.set(unit);
        } else if (unit instanceof ShaderMesh) {
            shader = new ShadedMeshShader(gl);
            shader.set(unit);
        } else if (unit instanceof Mesh) {
            shader = new MeshDebugShader(gl);
            let smesh = unit.ToShaderMesh();
            shader.set(smesh);
        } else if (unit instanceof BiSurface) {
            shader = new MeshDebugShader(gl);
            let smesh = unit.buffer().ToShaderMesh();
            shader.set(smesh);
        } else if (unit instanceof Curve) {
            shader = new LineShader(gl);
            let multiLine = unit.buffer();
            shader.set(multiLine);
        } else if (unit instanceof Polyline) {
            shader = new LineShader(gl);
            let multiLine = MultiLine.fromPolyline(unit);
            shader.set(multiLine);
        } else if (unit instanceof Plane) {
            shader = new LineShader(gl);
            let multiLine = MultiLine.fromPlane(unit);
            shader.set(multiLine);
        } else if (unit instanceof MultiLine) {
            shader = new LineShader(gl);
            shader.set(unit);
        } else if (unit instanceof ImageMesh) {
            shader = new TextureMeshShader(gl);
            shader.set(unit.buffer(), DrawSpeed.StaticDraw);
        } else {
            console.error("MultiRenderer cannot render: ", unit);
            return undefined;
        }

        this.shaders.set(key, shader);
        this.activeShaders.add(key);
        return shader;
    }
}
