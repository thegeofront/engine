import { Color } from "../../image/Color";
import { Matrix3, Matrix4, Mesh, meshFromObj, ShaderMesh, Texture, Vector2 } from "../../lib";
import { Scene } from "../basics/Scene";
import { DrawElementsType, DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";
import { UniformType } from "../webgl/Uniform";

/**
 * quite literarly taken from https://webglfundamentals.org/webgl/lessons/webgl-skybox.html, saw no reason to change it
 */
export class SkyBoxShader extends ShaderProgram<Texture> {

    constructor(gl: WebGl) {
        const vertexShader = `
        precision mediump float;

        attribute vec4 a_position;
        varying vec4 v_position;

        void main() {
            v_position = vec4(a_position.x, a_position.y, a_position.z * -1.0, a_position.w);
            gl_Position = a_position;
            gl_Position.z = 1.0;
        }
        `;

        const fragmentShader = `
        #define PI 3.1415926538;
        #define TWO_PI 2.0 * PI;


        precision mediump float;
     
        uniform sampler2D u_skybox;
        uniform mat4 u_viewDirectionProjectionInverse;
         
        varying vec4 v_position;

        vec2 to_lat_long_normalized(vec3 normal) {
            float longitude = atan(normal.y, normal.x) / TWO_PI;
            float latitude = 0.0;
            return vec2(longitude, latitude);
        }

        vec2 to_polar(vec3 normal) {
            vec2 dir = normalize(normal.xy) * 0.5;
            float delta = acos(normal.z) / PI;
            return vec2(0.5, 0.5) + dir * 0.5; 
        }

        vec3 to_sphere(vec3 P) {
            float r = sqrt(P.x*P.x + P.y*P.y + P.z*P.z);
            float theta = atan(P.y, P.x);
            float phi = acos(P.z/r);
            return vec3(r, theta, phi);
        }
        
        vec3 to_cart(vec3 P) {
            float r = P.x;
            float theta = P.y;
            float phi = P.z;
            return r * vec3(cos(phi)*sin(theta),sin(phi)*sin(theta),cos(theta));
        }

        void main() {
            // vec4 t = u_viewDirectionProjectionInverse * v_position;
            // vec3 normal = normalize(t.xyz / t.w);

            // gl_FragColor = vec4(t.xyz, 1.0);
            // gl_FragColor = vec4(1.0, 0.0,0.0,1.0);
            // gl_FragColor = texture2D(u_skybox, (v_position.xy + 1.0) / 2.0);
            // gl_FragColor = textureCube(u_skybox, normal);

            // use polar projection 
            // float lat = atan2(-this.y, -this.x);

            // vec2 pole = to_polar(normal);
            // gl_FragColor = texture2D(u_skybox, pole);
            // gl_FragColor = vec4((t.xyz + 1.0) * 0.5, 1.0);
        }
        `;
        super(gl, vertexShader, fragmentShader);
    }

    protected onInit(): DrawMode {
        this.attributes.add("a_position", 2);
        this.attributes.addIndex(DrawElementsType.UnsignedByte);
        this.uniforms.add("u_viewDirectionProjectionInverse", 16, Matrix4.newIdentity().data);
        this.uniforms.addTexture("u_skybox");
        return DrawMode.Triangles;
    }

    protected onLoad(texture: Texture, speed: DrawSpeed): number {

        let cube = new Float32Array([
            -1.0,  1.0,  1.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
        ]);

        let cubeIndices = new Float32Array([
            0, 1, 2, 3,
            3, 2, 6, 7,
            7, 6, 5, 4,
            4, 5, 1, 0,
            0, 3, 7, 4,
            1, 2, 6, 5,
        ]);

        this.attributes.load("a_position", cube, speed);
        this.attributes.loadIndex(cubeIndices, speed);

        this.uniforms.loadTexture("u_skybox", texture);

        return 6;
    }

    protected onDraw(c: Scene) {
        // let our quad pass the depth test at 1.0
        // this.gl.depthFunc(this.gl.LEQUAL);
        this.uniforms.loadMatrix4("u_viewDirectionProjectionInverse", c.camera.inverseRotateMatrix);
    }
}
