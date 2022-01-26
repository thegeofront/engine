import { Color } from "../../image/Color";
import { Entity, Matrix3, Matrix4, Mesh, meshFromObj, ShaderMesh, Vector3 } from "../../lib";
import { Material } from "../basics/Material";
import { Model } from "../basics/Model";
import { Scene } from "../basics/Scene";
import { DrawElementsType, DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";

export class ZebraShader extends ShaderProgram<Entity> {
    constructor(gl: WebGl, indexed = true) {
        const vertexShader = `
        precision mediump int;
        precision mediump float;

        attribute vec4 position;
        attribute vec2 uv;
        attribute vec3 normal;
        
        uniform mat3 normalMatrix;
        uniform mat4 worldMatrix;
        uniform mat4 worldInverse;
        uniform mat4 modelMatrix;
        uniform vec3 sunPosition;
        uniform vec3 cameraPosition;

        varying vec2 varUv;
        varying vec3 varNormal;
        varying vec3 varToSun;
        varying vec3 varToCamera;

        void main() {
            vec4 worldPosition = modelMatrix * position;
            gl_Position = worldMatrix * worldPosition;
            
            varUv = uv;
            varNormal = normalMatrix * normal;
            varToSun = sunPosition - worldPosition.xyz;
            varToCamera = cameraPosition - worldPosition.xyz;
        }
        `;

        const fragmentShader = `
        precision mediump int;
        precision mediump float;

        varying vec2 varUv;
        varying vec3 varNormal;
        varying vec3 varToSun;
        varying vec3 varToCamera;
    
        uniform float zebraStripeCount;

        // make from '/' curve a './' curve
        float flattenPeakClamp(float x, float alpha) {
            float beta = 0.5 - alpha;
            float leftover = 1.0 - 2.0 * beta;
            return clamp((x-beta) * (1.0 / leftover), 0.0, 1.0);
        }

        // make from '/' curve a '/\' curve
        float hillClamp(float x) {
            float clamped = clamp(x, 0.0, 0.5) - clamp(x - 0.5, 0.0, 0.5);
            return clamped * 2.0;
        }

        void main () {

            // normalize 
            vec3 toSun = normalize(varToSun);
            vec3 normal = normalize(varNormal);
            vec3 toCamera = normalize(varToCamera);

            // specular
            vec3 reflectedLight = reflect(-toSun, normal);
            float factor = dot(reflectedLight, toCamera);
            factor = hillClamp(fract(factor * zebraStripeCount));
            factor = flattenPeakClamp(factor, 0.05);

            vec4 specularColor = vec4(vec3(factor), 1.0); 

            gl_FragColor = specularColor;
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
        this.uniforms.add("worldInverse", 16);
        this.uniforms.add("modelMatrix", 16);
        this.uniforms.add("normalMatrix", 9);
        this.uniforms.add("sunPosition", 3);
        this.uniforms.add("cameraPosition", 3);

        this.uniforms.add("zebraStripeCount", 1, [7.0]);

        return DrawMode.Triangles;
    }

    protected onLoad(e: Entity, speed: DrawSpeed): number {
        this.loadPosition(e.position);
        this.loadMesh(e.model.mesh, speed);
        return e.model.mesh.maxSize;
    }

    public loadPosition(position: Matrix4) {
        this.useProgram();
        // let euler = position.toXform();
        // let rotation = Matrix3.newRotation(euler);
        this.uniforms.loadMatrix4("modelMatrix", position);
        this.uniforms.loadMatrix3("normalMatrix", Matrix3.newIdentity());
    }

    public loadMesh(mesh: Mesh, speed: DrawSpeed) {
        this.useProgram();
        this.attributes.loadIndex(mesh.links.data, speed);
        this.attributes.load("position", mesh.verts.matrix.data, speed);
        this.attributes.load("uv", mesh.uvs!.matrix.data, speed);
        this.attributes.load("normal", mesh.normals!.matrix.data, speed);
    }

    public loadZebraStripeCount(count: number) {
        this.uniforms.load("zebraStripeCount", count);
    }

    protected onDraw(s: Scene) {
        this.uniforms.loadMatrix4("worldMatrix", s.camera.totalMatrix);
        this.uniforms.load3("sunPosition", s.sun.pos);
        this.uniforms.load3("cameraPosition", s.camera.getActualPosition());
    }
}
