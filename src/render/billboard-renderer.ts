// name:    billboard-renderer.ts
// author:  Jos Feenstra
// purpose: Renderer images as billboards.

import { Vector2Array, Vector3Array } from "../data/vector-array";
import { GeonImage } from "../img/Image";
import { DrawSpeed, Renderer } from "./renderer";


// mooi font om te gebruiken 
// https://datagoblin.itch.io/monogram

export class BillBoardRenderer extends Renderer {
    // TODO

    // accepts a texture & dots

    constructor(gl: WebGLRenderingContext) {

        let vs = "";
        let fs = "";

        super(gl, vs, fs)
    }

    set(texture: GeonImage, dots: Vector3Array, textureDots: Vector2Array, speed: DrawSpeed) {
        // TODO
    }

    render() {
        // TODO
    }

    setAndRender(texture: GeonImage, dots: Vector3Array, textureDots: Vector2Array, speed: DrawSpeed) {
        this.set(texture, dots, textureDots, speed);
        this.render();
    }
}

export class TextRenderer {

    // TODO

    // use the billboard renderer to render series of ascii characters, 
    // by using standard positions of certain font images. 

    br: BillBoardRenderer

    // todo horizontal justification
    // todo vertical justification

    constructor(gl: WebGLRenderingContext) {
        this.br = new BillBoardRenderer(gl);
    }

    set(strings: string[], locations: Vector3Array) {

        if (strings.length != locations.count()) {
            console.warn("couldnt set TextRenderer: strings not equal to locations...");
        }
        let length = strings.length;

        // TODO: set a whole bunch of stuff 
    }

    render() {

    }
}