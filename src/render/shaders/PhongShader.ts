import { Color } from "../../image/Color";
import { Matrix3, Matrix4, Mesh, meshFromObj, ShaderMesh, Vector3 } from "../../lib";
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

        uniform vec4 ambient;
        uniform vec4 diffuse;
        uniform vec4 specular;
        uniform float opacity;
        uniform float specularDampner;

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

            // diffuse
            
            float diffuseFactor = max(0.0, dot(normal, toSun));
            vec4 diffuseColor = diffuse * diffuseFactor; 

            // specular
            vec3 reflectedLight = reflect(-toSun, normal);
            float specfac = max(0.0, dot(reflectedLight, toCamera));
            specfac = pow(specfac, specularDampner);
            // specfac = smooth(specfac);
            vec4 specularColor = vec4(specfac * specular.xyz, 1.0); 

            gl_FragColor = max(ambient, diffuseColor) + specularColor;
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

        this.uniforms.add("ambient", 4, Color.fromHSL(0, 0).data);
        this.uniforms.add("diffuse", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("specular", 4, [1.0, 1.0, 1.0, 1.0]);
        this.uniforms.add("opacity", 1, [1.0]);
        this.uniforms.add("specularDampner", 1, [0.5]);

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
        let euler = position.decompose()[1];
        // let rotation = Matrix3.newRotation(euler);
        this.uniforms.loadMatrix4("modelMatrix", position);
        this.uniforms.loadMatrix3("normalMatrix", Matrix3.newIdentity());
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

    public loadMaterial(material: Material) {
        this.useProgram();
        this.uniforms.loadColor("ambient", material.ambient);
        this.uniforms.loadColor("diffuse", material.diffuse);
        this.uniforms.loadColor("specular", material.specular);
        this.uniforms.load("opacity", material.opacity);
        this.uniforms.load("specularDampner", material.specularDampner);
    }

    protected onDraw(s: Scene) {
        this.uniforms.loadMatrix4("worldMatrix", s.camera.totalMatrix);
        this.uniforms.load3("sunPosition", s.sun.pos); 
        this.uniforms.load3("cameraPosition", s.camera.getActualPosition());
    }
}

