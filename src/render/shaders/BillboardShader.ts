// https://webgl.brown37.net/12_advanced_rendering/07_rendering_points.html

import {
    MultiVector3,
    MultiVector2,
    Bitmap,
    Vector3,
    ToFloatMatrix,
    Vector2,
    Scene,
} from "../../lib";
import { DrawMode } from "../webgl/Constants";
import { DrawSpeed } from "../webgl/HelpGl";
import { ShaderProgram } from "../webgl/ShaderProgram";
import { Uniform } from "../webgl/Uniform";

// name:    billboard-renderer.ts
// author:  Jos Feenstra
// purpose: Renderer textures as billboards.

// NOTE: make sure to include something like a center offset, to gain control of if the point is rendered centered, as topleft, etc. etc.

// mooi font om te gebruiken
// https://datagoblin.itch.io/monogram

export type billboardSettings = {
    color?: number[];
    radius?: number;
};

/**
 * This is all data we need to render
 */
export type BillboardPayload = {
    positions: MultiVector3; // position in the world to render this
    // positionUvs: MultiVector2; // the coordinate of the 'center point', from the perspective of a billboard
    uvs: MultiVector2; //
    uvSizes: MultiVector2;
    texture: Bitmap;
};

/**
 * A single billboard
 */
export class Billboard {
    constructor(public position: Vector3, public image: Bitmap) {}

    static new(position: Vector3, image: Bitmap) {
        return new Billboard(position, image);
    }

    toPayload(): BillboardPayload {
        return {
            positions: MultiVector3.fromList([this.position]),
            uvs: MultiVector2.fromData([0, 0]),
            uvSizes: MultiVector2.fromData([this.image.width, this.image.height]),
            texture: this.image,
        };
    }
}

/**
 * Used to render multiple billboards.
 * One Texture per billboard.
 */
export class BillboardShader extends ShaderProgram<BillboardPayload | Billboard> {
    // exposed Uniforms like this can be use to statically change certain properties
    color!: Uniform;
    radius!: Uniform;

    constructor(gl: WebGLRenderingContext, color = [1, 1, 1, 1], radius = 100) {
        let vertexSource: string = `
        // Vertex Shader
        precision mediump int;
        precision mediump float;
        
        uniform mat4  u_transform;
        uniform vec3  u_camera_position;
        uniform float u_size;
 
        attribute vec3 a_vertex;
        attribute vec2 a_uv;
        attribute vec2 a_uv_wh;
        
        varying vec2  uv;
        varying vec2  uv_size;
        varying float point_size;
        
        void main() {
        
            // edit size based on distance from camera
            float value = 15.0; // TODO how to derrive this???
            float dis = distance(a_vertex, u_camera_position);
            float size = u_size / (dis / value);
            gl_PointSize = size;
            point_size = size;

            // Pass the point's texture coordinate to the fragment shader
            uv = a_uv;
            uv_size = a_uv_wh;
            
            // Transform the location of the vertex.
            gl_Position = u_transform * vec4(a_vertex, 1.0);
        }

        `;
        let fragmentSource: string = `

        precision mediump int;
        precision mediump float;
    
        uniform sampler2D u_texture;
        uniform vec2      u_texture_size;  // delta_s, delta_t
        
        varying vec2  uv;
        varying vec2  uv_size;
        varying float point_size; // can this be replaced with u_size ??


        void main() {
            // NOTE this can be done way easier, we dont need uv sized, we just need to go to pixel space
            
            // make pixel-perfect, but round it so it has no artefacts.
            // coord ~= gp_PointCoord
            vec2 sprite_uv = gl_PointCoord * uv_size;
            vec2 alpha = vec2(0.03);
            vec2 x = fract(sprite_uv);
            vec2 x_ = clamp(0.5 / alpha * x, 0.0, 0.5) +
                      clamp(0.5 / alpha * (x - 1.0) + 0.5, 0.0, 0.5);
            vec2 coord = (floor(sprite_uv) + x_);

            // take the right part of the spritemap
            vec2 texture_fraction = 1.0 / u_texture_size;
            vec2 texture_topleft = uv * texture_fraction;
            vec2 realCoord = texture_topleft + coord / u_texture_size;

            gl_FragColor = texture2D(u_texture, realCoord);
        }
        `;

        // setup program
        super(gl, vertexSource, fragmentSource);
        this.uniforms.add("u_transform", 16);
        this.radius = this.uniforms.add("u_size", 1, [radius]);
        this.color = this.uniforms.add("u_color", 4, color);

        this.uniforms.add("u_camera_position", 3);
        this.uniforms.add("u_texture_size", 2, [16, 16]);
        this.uniforms.addTexture("u_texture");
    }

    protected onInit(): DrawMode {
        this.attributes.add("a_vertex", 3);
        this.attributes.add("a_uv", 2);
        this.attributes.add("a_uv_wh", 2);
        return DrawMode.Points;
    }

    protected onLoad(payload: BillboardPayload | Billboard, speed: DrawSpeed): number {
        if (payload instanceof Billboard) {
            payload = payload.toPayload();
        }

        this.attributes.load("a_vertex", ToFloatMatrix(payload.positions).data, speed);
        this.attributes.load("a_uv", ToFloatMatrix(payload.uvs).data, speed);
        this.attributes.load("a_uv_wh", ToFloatMatrix(payload.uvSizes).data, speed);
        this.uniforms.loadTexture("u_texture", payload.texture);
        this.uniforms.load2(
            "u_texture_size",
            Vector2.new(payload.texture.width, payload.texture.height),
        );
        return payload.positions.count;
    }

    protected onDraw(c: Scene): void {
        this.uniforms.load3("u_camera_position", c.camera.pos.scaled(-1));
        this.uniforms.loadMatrix4("u_transform", c.camera.totalMatrix);
    }
}
