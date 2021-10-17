import { Color } from "../../image/Color";
import { Matrix4, Mesh, meshFromObj, ShaderMesh, Vector2 } from "../../lib";
import { Scene } from "../basics/Scene";
import { DrawElementsType, DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";

export class TexturedMeshShader extends ShaderProgram<Mesh> {

    constructor(gl: WebGl) {
        
        const vs = `
        // precision mediump int;
        // precision mediump float;

        attribute vec4 a_position;
        attribute vec2 a_uv;

        uniform mat4 u_transform;

        varying vec2 v_texcoord;

        void main() {
            gl_Position = u_transform * a_position;
            v_texcoord = a_uv;
        }
        `;

        let fs;
        let pixelPerfext = true;
        if (pixelPerfext) {
            fs = `
            precision mediump float;
    
            varying vec2 v_texcoord;

            uniform vec2 u_texture_size;
            uniform sampler2D u_texture;
    
            // make pixel-perfect, but round it so it has no artefacts.
            vec2 snapPixel(vec2 uv, vec2 size, vec2 alpha) {
                vec2 pixel_uv = uv * size;
                vec2 x = fract(pixel_uv);
                vec2 x_ = clamp(0.5 / alpha * x, 0.0, 0.5) +
                          clamp(0.5 / alpha * (x - 1.0) + 0.5, 0.0, 0.5);
                return clamp((floor(pixel_uv) + x_) / size, 0.0, 0.9999);
            } 

            void main() {
                vec2 coord = snapPixel(v_texcoord, u_texture_size, vec2(0.02));
                gl_FragColor = texture2D(u_texture, coord);
            }
            `;
        } else {
            fs = `
            precision mediump float;
    
            varying vec2 v_texcoord;
    
            uniform vec2 u_texture_size;
            uniform sampler2D u_texture;
    
            void main() {
                gl_FragColor = texture2D(u_texture, v_texcoord);
            }
            `;
        }

        super(gl, vs, fs);
    }

    protected onInit(): DrawMode {
        this.attributes.add("a_position", 3);
        this.attributes.add("a_uv", 2);
        this.attributes.addIndex(DrawElementsType.UnsignedShort);
        this.uniforms.addTexture("u_texture");
        this.uniforms.add("u_transform", 16);
        this.uniforms.add("u_texture_size", 2);
        return DrawMode.Triangles;
    }

    protected onLoad(mesh: Mesh, speed: DrawSpeed): number {
        this.attributes.load("a_position", mesh.verts.slice().data, speed);
        this.attributes.load("a_uv", mesh.uvs!.data, speed);
        this.attributes.loadIndex(mesh.links.data, speed);
        return mesh.links.data.length;
    }

    loadTexture(width: number, height: number, source: WebGLTexture | null) {
        this.useProgram();
        this.uniforms.loadTextureSource("u_texture", source);
        this.uniforms.load2("u_texture_size", Vector2.new(width, height));
    }

    protected onDraw(c: Scene) {
        this.uniforms.loadMatrix4("u_transform", c.camera.totalMatrix);
    }
}
