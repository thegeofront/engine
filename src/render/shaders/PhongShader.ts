import { Color } from "../../image/Color";
import { Entity, Matrix3, Matrix4, Mesh, meshFromObj, ShaderMesh, Vector3 } from "../../lib";
import { Material } from "../basics/Material";
import { Model } from "../basics/Model";
import { Scene } from "../basics/Scene";
import { DrawElementsType, DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";

export class PhongShader extends ShaderProgram<Entity> {
    constructor(gl: WebGl) {
        const vertexShader = `
        precision mediump int;
        precision mediump float;

        attribute vec4 position;
        attribute vec2 uv;
        attribute vec3 normal;
        attribute float occlusion;
        
        uniform mat4 worldMatrix;
        uniform mat4 worldInverse;
        uniform mat4 modelMatrix;
        uniform vec3 sunPosition;
        uniform vec3 cameraPosition;

        varying vec2 varUv;
        varying vec3 varNormal;
        varying vec3 varToSun;
        varying vec3 varToCamera;
        varying float varVectorOcclusion;

        void main() {
            vec4 worldPosition = modelMatrix * position;
            gl_Position = worldMatrix * worldPosition;
            
            varUv = uv;
            varNormal = mat3(modelMatrix) * normal;
            varToSun = sunPosition - worldPosition.xyz;
            varToCamera = cameraPosition - worldPosition.xyz;
            varVectorOcclusion = occlusion;
        }
        `;

        const fragmentShader = `
        precision mediump int;
        precision mediump float;

        uniform vec4 ambient;
        uniform vec4 diffuse;
        uniform vec4 specular;
        uniform vec4 occluded;
        uniform float opacity;
        uniform float specularDampner;

        varying float varVectorOcclusion;
        varying vec2 varUv;
        varying vec3 varNormal;
        varying vec3 varToSun;
        varying vec3 varToCamera;

        // float smooth(float t) {
        //     // Fade function as defined by Ken Perlin.  This eases coordinate values
        //     // so that they will ease towards integral values.  This ends up smoothing
        //     // the final output.
        //     return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); // 6t^5 - 15t^4 + 10t^3
        // }
    
        void main () {

            // normalize 
            // vec3 toSun = varToSun;
            // vec3 normal = varNormal;
            // vec3 toCamera = varToCamera;

            vec3 toSun = normalize(varToSun);
            vec3 normal = normalize(varNormal);
            vec3 toCamera = normalize(varToCamera);
            
            // ambient
            vec4 ambientColor = ambient;

            // occluded (TODO: expand upon this using ambient occlusion)
            float sunDot = dot(normal, toSun);
            float occlusion = clamp(sunDot, -1.0, 0.0) * -1.0;
            occlusion = min(occlusion + varVectorOcclusion, 1.0);
            vec4 occludedColor = occluded * occlusion + ambientColor * (1.0 - occlusion);

            // diffuse 
            float diffusion = max(0.0, sunDot);
            vec4 diffuseColor = diffuse * diffusion; 

            // specular
            vec3 reflectedLight = reflect(-toSun, normal);
            float reflection = max(0.0, dot(reflectedLight, toCamera));
            reflection = pow(reflection, specularDampner);
            // reflection = smooth(reflection);
            vec4 specularColor = vec4(reflection * specular.xyz, 1.0); 

            gl_FragColor = max(occludedColor, diffuseColor) + specularColor;
            // gl_FragColor = vec4(normal, 1.0);
        }
        `;
        super(gl, vertexShader, fragmentShader);
    }

    static new(gl: WebGl) {
        return new PhongShader(gl);
    }

    protected onInit(): DrawMode {
        this.attributes.add("position", 3);
        this.attributes.add("uv", 2);
        this.attributes.add("normal", 3);
        this.attributes.add("occlusion", 1);

        this.attributes.addIndex(DrawElementsType.UnsignedInt);

        this.uniforms.add("worldMatrix", 16);
        this.uniforms.add("worldInverse", 16);
        this.uniforms.add("modelMatrix", 16);
        this.uniforms.add("sunPosition", 3);
        this.uniforms.add("cameraPosition", 3);

        this.uniforms.add("ambient", 4, Color.fromHSL(0, 0).data);
        this.uniforms.add("diffuse", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("specular", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("occluded", 4, [0.2, 0.2, 0.2, 1.0]);
        this.uniforms.add("opacity", 1, [1.0]);
        this.uniforms.add("specularDampner", 1, [0.5]);

        return DrawMode.Triangles;
    }

    protected onLoad(e: Entity, speed: DrawSpeed): number {
        this.loadPosition(e.position);
        this.loadMesh(e.model.mesh, speed);
        this.loadMaterial(e.model.material);
        return e.model.mesh.maxSize;
    }

    public loadOcclusion(data: BufferSource, speed: DrawSpeed) {
        this.useProgram();
        this.attributes.load("occlusion", data, speed);
    }

    public loadPosition(position: Matrix4) {
        this.useProgram();
        // let euler = position.decompose()[1];
        // let rotation = Matrix3.newRotation(euler);
        this.uniforms.loadMatrix4("modelMatrix", position);
    }

    public loadMesh(mesh: Mesh, speed: DrawSpeed) {
        this.useProgram();

        // handle index-less meshes 
        if (mesh.links) {
            this.attributes.loadIndex(mesh.links.data, speed);
        } else {
            this.setDrawCount(mesh.maxSize);
            this.attributes.unloadIndex();
            this.updateDrawMethod();
        }

        this.attributes.load("position", mesh.verts.matrix.data, speed);
        if (mesh.uvs) this.attributes.load("uv", mesh.uvs!.matrix.data, speed); else this.attributes.unload("uv");
        if (mesh.normals )this.attributes.load("normal", mesh.normals!.matrix.data, speed); else this.attributes.unload("normal");
        this.attributes.unload("occlusion");
    }

    public loadMaterial(material: Material) {
        this.useProgram();
        this.uniforms.loadColor("ambient", material.ambient);
        this.uniforms.loadColor("diffuse", material.diffuse);
        this.uniforms.loadColor("specular", material.specular);
        this.uniforms.loadColor("occluded", material.occluded);
        this.uniforms.load("opacity", material.opacity);
        this.uniforms.load("specularDampner", material.specularDampner);
    }

    protected onDraw(s: Scene) {
        this.uniforms.loadMatrix4("worldMatrix", s.camera.totalMatrix);
        this.uniforms.loadMatrix4("worldInverse", s.camera.inverseTransposeMatrix);
        this.uniforms.load3("sunPosition", s.sun.pos);
        this.uniforms.load3("cameraPosition", s.camera.getActualPosition());
    }
}
