// https://webgl.brown37.net/12_advanced_rendering/07_rendering_points.html

// name:    billboard-renderer.ts
// author:  Jos Feenstra
// purpose: Renderer textures as billboards.

// NOTE: make sure to include something like a center offset, to gain control of if the point is rendered centered, as topleft, etc. etc.

import { GeonImage, MultiVector3, MultiVector2, Context } from "../lib";
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
    color?: number[],
    radius?: number,
}

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
 * Used to render multiple billboards.
 * One Texture per billboard.
 */
export class BillboardShader extends Program<BillboardPayload> {

    // exposed Uniforms like this can be use to statically change certain properties
    color!: Uniform;
    radius!: Uniform;

    constructor(gl: WebGLRenderingContext, 
        color = [1,1,1,1],
        radius= 100) {
        let vertexSource: string = `
        // Vertex Shader
        precision mediump int;
        precision mediump float;
        
        uniform mat4      u_transform;
        uniform vec3      u_camera_position;
        uniform float     u_size;
        
        

        attribute vec3 a_vertex;
        attribute vec2 a_uv;
        
        varying vec2  uv;
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
            
            // Transform the location of the vertex.
            gl_Position = u_transform * vec4(a_vertex, 1.0);
        }

        `;
        let fragmentSource: string = `
        // Fragment shader program
        precision mediump int;
        precision mediump float;
        
        // The texture unit to use for the color lookup
        uniform sampler2D u_texture;
        uniform vec2      u_texture_delta;  // delta_s, delta_t
        
        varying vec2  uv;
        varying float point_size; // can this be replaced with u_size ??
        
        vec2 center = vec2(0.5, 0.5);
        
        void main() {

            // gl_FragColor = texture2D(u_texture, gl_PointCoord);

            // How much does gl_PointCoord values change between pixels?
            float point_delta = 1.0 / (point_size - 1.0);
            
            // // Integer offset to adjacent pixels, based on gl_PointCoord.
            ivec2 offset = ivec2((gl_PointCoord - center) / point_delta);
            
            // // Offset the texture coordinates to an adjacent pixel.
            vec2 coords = uv + (vec2(offset) * u_texture_delta);
            
            // // Look up the color from the texture map.
            gl_FragColor = texture2D(u_texture, coords);
        }
        `;

        // setup program
        super(gl, vertexSource, fragmentSource);

        this.uniforms.add("u_transform", 16);
        this.radius = this.uniforms.add("u_size", 1, [radius]);
        this.color = this.uniforms.add("u_color", 4, color);
        
        this.uniforms.add("u_camera_position", 3);
        this.uniforms.add("u_texture_delta", 2, [16, 16]);
        this.uniforms.addTexture("u_texture");
    }

    protected onInit(): DrawMode {
        this.attributes.add("a_vertex", 3);
        this.attributes.add("a_uv", 2);
        return DrawMode.Points;
    }

    protected onSet(payload: BillboardPayload, speed: DrawSpeed): number {
        this.attributes.set("a_vertex", ToFloatMatrix(payload.positions).data, speed);
        this.attributes.set("a_uv", ToFloatMatrix(payload.uvs).data, speed);
        this.uniforms.setTexture("u_texture", payload.texture);
        return payload.positions.count;
    }

    protected onRender(c: Context): void {
        this.uniforms.set3("u_camera_position", c.camera.pos.scaled(-1));
        this.uniforms.setMatrix4("u_transform", c.camera.totalMatrix);
    }
}
