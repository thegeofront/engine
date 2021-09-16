// https://webgl.brown37.net/12_advanced_rendering/07_rendering_points.html

// name:    billboard-renderer.ts
// author:  Jos Feenstra
// purpose: Renderer textures as billboards.

// NOTE: make sure to include something like a center offset, to gain control of if the point is rendered centered, as topleft, etc. etc.

import { GeonImage, MultiVector3, MultiVector2, Context, Vector2, Vector3 } from "../lib";
import { ToFloatMatrix } from "../data/multi-vector";
import { Attribute } from "../render-low/attribute";
import { Shader } from "../render-low/shader";
import { DrawSpeed } from "../render-low/webgl";
import { Uniform } from "../render-low/uniform";
import { Program } from "../render-low/program";
import { DrawMode } from "../render-low/constants";

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
    texture: GeonImage;
};

/**
 * A single billboard
 */
export class Billboard {
    constructor(
        public position: Vector3,
        public image: GeonImage,
    ) {}

    static new(position: Vector3, image: GeonImage) {
        return new Billboard(position, image);
    }

    toPayload() : BillboardPayload {
        return {
            positions: MultiVector3.fromList([this.position]),
            uvs: MultiVector2.fromData([0,0]),
            uvSizes: MultiVector2.fromData([this.image.width, this.image.height]),
            texture: this.image,
        }
    }
}

/**
 * Used to render multiple billboards.
 * One Texture per billboard.
 */
export class BillboardShader extends Program<BillboardPayload | Billboard> {
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
        
        vec2 center = vec2(0.5, 0.5);
        
        void main() {

            vec2 texture_fraction = 1.0 / u_texture_size;
            vec2 sprite_fraction = 1.0 / uv_size;
            vec2 tex_origin = uv * texture_fraction;

            vec2 coord = tex_origin + gl_PointCoord * sprite_fraction;
            gl_FragColor = texture2D(u_texture, coord);
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

    protected onSet(payload: BillboardPayload | Billboard, speed: DrawSpeed): number {

        if (payload instanceof Billboard) {
            payload = payload.toPayload();
        } 

        this.attributes.set("a_vertex", ToFloatMatrix(payload.positions).data, speed);
        this.attributes.set("a_uv", ToFloatMatrix(payload.uvs).data, speed);
        this.attributes.set("a_uv_wh", ToFloatMatrix(payload.uvSizes).data, speed);
        this.uniforms.setTexture("u_texture", payload.texture);
        this.uniforms.set2(
            "u_texture_size",
            Vector2.new(payload.texture.width, payload.texture.height),
        );
        return payload.positions.count;
    }

    protected onRender(c: Context): void {
        this.uniforms.set3("u_camera_position", c.camera.pos.scaled(-1));
        this.uniforms.setMatrix4("u_transform", c.camera.totalMatrix);
    }
}
