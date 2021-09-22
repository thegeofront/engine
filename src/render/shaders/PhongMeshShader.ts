import { Matrix4, Mesh, meshFromObj, ShaderMesh } from "../../lib";
import { Scene } from "../basics/Scene";
import { DrawElementsType, DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";

export class AmbientMeshShader extends ShaderProgram<Mesh> {

    constructor(gl: WebGl) {
        const vertexShader = `
        precision mediump int;
        precision mediump float;

        attribute vec4 vertexPosition;
        uniform mat4 worldMatrix;

        void main() {
            gl_Position = worldMatrix * vertexPosition;
        }
        `;

        const fragmentShader = `
        precision mediump int;
        precision mediump float;

        uniform vec4 ambientColor;

        void main () {
            gl_FragColor = ambientColor;
        }
        `;
        super(gl, vertexShader, fragmentShader);
    }

    protected onInit(): DrawMode {
        this.attributes.add("vertexPosition", 3);
        this.attributes.addIndex(DrawElementsType.UnsignedShort);
        this.uniforms.add("ambientColor", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("worldMatrix", 16);
        return DrawMode.Triangles;
    }

    protected onLoad(mesh: Mesh, speed: DrawSpeed): number {
        this.attributes.load("vertexPosition", mesh.verts.slice().data, speed);
        this.attributes.loadIndex(mesh.links.data, speed);
        return mesh.links.data.length;
    }

    public loadColor(color: number[]) {
        this.useProgram();
        this.uniforms.load4("ambientColor", color);
    }

    protected onDraw(c: Scene) {
        this.uniforms.loadMatrix4("worldMatrix", c.camera.totalMatrix);
    }
}
