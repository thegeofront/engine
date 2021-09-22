import { Matrix4, ShaderMesh } from "../../lib";
import { Scene } from "../Scene";
import { DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";

export class OneColorMeshShader extends ShaderProgram<ShaderMesh> {

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

    protected onInit(settings?: any): DrawMode {
        this.attributes.add("vertexPosition", 3);

        this.uniforms.add("ambientColor", 4, [0.5,0.5,0.5,1.0]);
        this.uniforms.add("worldMatrix", 16, Matrix4.newIdentity().data);
        
        return DrawMode.Triangles;
    }

    protected onLoad(data: ShaderMesh, speed: DrawSpeed): number {
        throw new Error("Method not implemented.");
    }

    loadColor(color: number[]) {
        this.uniforms.load4("u_color", color);
    }

    protected onRender(c: Scene): void {
        throw new Error("Method not implemented.");
    }
}
