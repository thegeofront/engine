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

// mooi font om te gebruiken
// https://datagoblin.itch.io/monogram

/**
 * This is all data we need to render
 */
export type BillboardPayload = {
    positions: MultiVector3; // position in the world to render this
    // positionUvs: MultiVector2; // the coordinate of the 'center point', from the perspective of a billboard
    uvs: MultiVector2; //
    uvSizes: MultiVector2;
};

/**
 * Used to render multiple billboards.
 * One Texture per billboard.
 */
export class BillboardShader extends Shader<BillboardPayload> {
    // exposed Uniforms like this can be use to statically change certain properties
    color: Uniform;
    radius: Uniform;

    constructor(gl: WebGLRenderingContext) {
        let vertexSource: string = `
        // Vertex Shader
        precision mediump int;
        precision mediump float;
        
        uniform mat4      u_transform;
        uniform float     u_size;
        
        attribute vec3 a_vertex;
        attribute vec2 a_uv;
        
        varying vec2  uv;
        varying float point_size;
        
        void main() {
        
          // Pass the point's texture coordinate to the fragment shader
          uv = a_uv;
        
          // Pass the point's size to the fragment shader
          point_size = u_size;
        
          // Set the size of a rendered point.
          gl_PointSize = u_size;
        
          // Transform the location of the vertex.
          gl_Position = u_transform * vec4(a_vertex, 1.0);
        }

        `;
        let fragmentSource: string = `
        // Fragment shader program
        precision mediump int;
        precision mediump float;
        
        // The texture unit to use for the color lookup
        uniform sampler2D u_Texture_unit;
        uniform vec2      u_Texture_delta;  // delta_s, delta_t
        
        varying vec2  uv;
        varying float point_size; // can this be replaced with u_size ??
        
        vec2 center = vec2(0.5, 0.5);
        
        void main() {
          // How much does gl_PointCoord values change between pixels?
          float point_delta = 1.0 / (point_size - 1.0);
        
          // Integer offset to adjacent pixels, based on gl_PointCoord.
          ivec2 offset = ivec2((gl_PointCoord - center) / point_delta);
        
          // Offset the texture coordinates to an adjacent pixel.
          vec2 coords = uv + (vec2(offset) * u_Texture_delta);
        
          // Look up the color from the texture map.
          gl_FragColor = texture2D(u_Texture_unit, coords);
        }
        `;

        // setup program
        super(gl, vertexSource, fragmentSource);
        this.uniforms.add("u_transform", 16);
        this.radius = this.uniforms.add("u_size", 1);
        this.color = this.uniforms.add("u_color", 4);

        this.attributes.add("a_vertex", 3);
        this.attributes.add("a_uv", 2);
        this.attributes.add("u_Texture_unit", 0); // TODO figure out how to add a texture...
        // this.attributes.add("a_uv_size", 2);
    }

    set(payload: BillboardPayload, speed: DrawSpeed = DrawSpeed.StaticDraw) {
        let gl = this.gl;
        gl.useProgram(this.program);

        // Bind the position buffer
        this.attributes.set("a_vertex", ToFloatMatrix(payload.positions).data, speed);
        this.attributes.set("a_uv", ToFloatMatrix(payload.uvs).data, speed);
        // this.attributes.set("a_uv", ToFloatMatrix(payload.uvSizes).data, speed);

        // set the count
        this.setDrawCount(payload.positions.count);
    }

    render(c: Context) {
        let gl = this.gl;
        let matrix = c.camera.totalMatrix;
        gl.useProgram(this.program);

        this.uniforms.setMatrix4("u_transform", matrix);
        this.uniforms.loadAll();
        this.attributes.loadAll();

        this.gl.drawArrays(gl.POINTS, 0, this.drawCount);
    }

    setAndRender(data: BillboardPayload, c: Context) {
        this.set(data, DrawSpeed.DynamicDraw);
        this.render(c);
    }
}
