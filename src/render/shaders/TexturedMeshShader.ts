import { Color } from "../../image/Color";
import { GeonImage, Matrix4, Mesh, meshFromObj, ShaderMesh, Vector2 } from "../../lib";
import { Scene } from "../basics/Scene";
import { DrawElementsType, DrawMode } from "../webgl/Constants";
import { DrawSpeed, WebGl } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";

export class TexturedMeshShader extends ShaderProgram<{mesh: ShaderMesh, texture: GeonImage}> {

    constructor(gl: WebGl, pixelPerfect=true) {
        const vertexShader = `
        precision mediump float;

        attribute vec4 position;
        attribute vec2 uv;

        uniform mat4 worldMatrix;

        varying vec2 v_uv;

        void main() {
            gl_Position = worldMatrix * position;
            v_uv = uv;
        }
        `;

        let fragmentShader;

        if (pixelPerfect) {
            fragmentShader = `
            precision mediump float;
    
            varying vec2 v_uv;

            uniform vec2 textureSize;
            uniform sampler2D texture;
    
            // make pixel-perfect, but round it so it has no artefacts.
            vec2 snapPixel(vec2 uv, vec2 size, vec2 alpha) {
                vec2 pixel_uv = uv * size;
                vec2 x = fract(pixel_uv);
                vec2 x_ = clamp(0.5 / alpha * x, 0.0, 0.5) +
                          clamp(0.5 / alpha * (x - 1.0) + 0.5, 0.0, 0.5);
                return clamp((floor(pixel_uv) + x_) / size, 0.0, 0.9999);
            } 

            void main() {
                vec2 coord = snapPixel(v_uv, textureSize, vec2(0.02));
                gl_FragColor = texture2D(texture, coord);
            }

            `;
        } else {
            fragmentShader = `
            precision mediump float;
    
            varying vec2 v_texcoord;
    
            uniform vec2 textureSize;
            uniform sampler2D texture;
    
            void main() {
                gl_FragColor = texture2D(texture, v_texcoord);
            }
            `;
        }
        super(gl, vertexShader, fragmentShader);
    }

    protected onInit(): DrawMode {
        this.attributes.add("position", 3);
        this.attributes.add("uv", 2);
        this.attributes.addIndex(DrawElementsType.UnsignedShort);

        this.uniforms.add("worldMatrix", 16);
        this.uniforms.add("textureSize", 2);
        this.uniforms.addTexture("texture");
        return DrawMode.Triangles;
    }

    protected onLoad(payload: {mesh: ShaderMesh, texture: GeonImage}, speed: DrawSpeed): number {
        
        let mesh = payload.mesh;
        let texture = payload.texture;

        this.loadMesh(mesh, speed);
        this.loadTexture(texture, speed);

        return mesh.mesh.links.data.length;
    }

    public loadMesh(mesh: ShaderMesh, speed: DrawSpeed) {
        let verts = mesh.mesh.verts;
        let uvs = mesh.uvs;
        let links = mesh.mesh.links;
        this.attributes.load("position", verts.slice().data, speed);
        this.attributes.load("uv", uvs.matrix.data, speed);

        this.attributes.loadIndex(links.data, speed);
        this.setDrawCount(links.data.length);
    }

    public loadTexture(texture: GeonImage, speed: DrawSpeed) {
        
        // set the dimentions
        let dim = texture.dimentions;
        this.uniforms.load2("textureSize", dim.xy)
        this.uniforms.loadTextureDirectly("texture", texture);
    }

    public render(scene: Scene) {
        this.draw(scene);
    }

    protected onDraw(c: Scene) {
        this.uniforms.loadMatrix4("worldMatrix", c.camera.totalMatrix);
    }
}


