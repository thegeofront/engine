import { Color } from "../../image/Color";
import { Matrix4, Mesh, meshFromObj, ShaderMesh } from "../../lib";
import { Material } from "../basics/Material";
import { Model } from "../basics/Model";
import { Scene } from "../basics/Scene";
import { DrawElementsType, DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";

export class PhongShader extends ShaderProgram<Model> {

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

        uniform vec4 ambient;
        uniform vec4 diffuse;
        uniform vec4 specular;
        uniform float opacity;

        void main () {
            gl_FragColor = ambient;
        }
        `;
        super(gl, vertexShader, fragmentShader);
    }

    protected onInit(): DrawMode {

        this.attributes.add("vertexPosition", 3);
        this.attributes.addIndex(DrawElementsType.UnsignedShort);

        this.uniforms.add("worldMatrix", 16);
        this.uniforms.add("sunPosition", 3);
        this.uniforms.add("sunColor", 4);

        this.uniforms.add("ambient", 4, Color.fromHSL(0, 0).data);
        this.uniforms.add("diffuse", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("specular", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("opacity", 1, [1.0, 1.0, 1.0, 1.0]);

        return DrawMode.Triangles;
    }

    protected onLoad(model: Model, speed: DrawSpeed): number {
        this.loadMesh(model.mesh, speed);
        this.loadMaterial(model.material);
        return model.mesh.links.data.length;
    }

    public loadMesh(mesh: Mesh, speed: DrawSpeed) {
        this.attributes.load("vertexPosition", mesh.verts.slice().data, speed);
        this.attributes.loadIndex(mesh.links.data, speed);
    }

    public loadMaterial(mat: Material) {
        this.useProgram();
        this.uniforms.loadColor("ambient", mat.ambient);
        this.uniforms.loadColor("diffuse", mat.diffuse);
        this.uniforms.loadColor("specular", mat.specular);
        this.uniforms.load("opacity", mat.opacity);
    }

    protected onDraw(s: Scene) {
        this.uniforms.loadMatrix4("worldMatrix", s.camera.totalMatrix);
        this.uniforms.load3("sunPosition", s.sun.pos);
        this.uniforms.loadColor("sunColor", s.sun.color);
    }
}
