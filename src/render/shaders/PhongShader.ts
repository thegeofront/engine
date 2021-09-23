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

        attribute vec4 position;
        attribute vec2 uv;
        attribute vec3 normal;
        
        uniform mat4 worldMatrix;
        uniform mat4 modelMatrix;
        
        uniform vec3 sunPosition;

        varying vec2 varUv;
        varying vec3 varNormal;
        varying vec3 varToSun;

        void main() {
            vec4 worldPosition = modelMatrix * position;
            gl_Position = worldMatrix * worldPosition;
            
            varUv = uv;
            varNormal = normalize((modelMatrix * vec4(normal, 1)).xyz);
            varToSun = normalize(sunPosition - worldPosition.xyz);
        }
        `;

        const fragmentShader = `
        precision mediump int;
        precision mediump float;

        uniform vec4 ambient;
        uniform vec4 diffuse;
        uniform vec4 specular;
        uniform float opacity;

        varying vec2 varUv;
        varying vec3 varNormal;
        varying vec3 varToSun;

        void main () {

            float brightness = max(0.0, dot(varNormal, varToSun));
            vec4 diffuseColor = diffuse * brightness; 

            gl_FragColor = max(ambient, diffuseColor);
        }
        `;
        super(gl, vertexShader, fragmentShader);
    }

    protected onInit(): DrawMode {

        this.attributes.add("position", 3);
        this.attributes.add("uv", 2);
        this.attributes.add("normal", 3);
        this.attributes.addIndex(DrawElementsType.UnsignedShort);

        this.uniforms.add("worldMatrix", 16);
        this.uniforms.add("modelMatrix", 16);
        this.uniforms.add("sunPosition", 3);

        this.uniforms.add("ambient", 4, Color.fromHSL(0, 0).data);
        this.uniforms.add("diffuse", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("specular", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("opacity", 1, [1.0, 1.0, 1.0, 1.0]);

        return DrawMode.Triangles;
    }

    protected onLoad(model: Model, speed: DrawSpeed): number {
        this.loadPosition(model.position);
        this.loadMesh(model.mesh, speed);
        this.loadMaterial(model.material);
        return model.mesh.links.data.length;
    }

    public loadPosition(position: Matrix4) {
        this.useProgram();
        this.uniforms.loadMatrix4("modelMatrix", position);
    }

    public loadMesh(mesh: Mesh, speed: DrawSpeed) {
        
        // make sure the mesh contains the correct type of uv and vertex normals. 
        mesh.ensureUVs();
        mesh.ensureVertexNormals();

        this.useProgram();
        this.attributes.load("position", mesh.verts.matrix.data, speed);
        this.attributes.load("uv", mesh.uvs!.matrix.data, speed);
        this.attributes.load("normal", mesh.normals!.matrix.data, speed);
        
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
    }
}
