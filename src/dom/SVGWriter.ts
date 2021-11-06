import { Matrix3, Vector2 } from "../lib";

export enum SVG {
    Circle = "circle",
    Rectangle = "rectangle",
    Polygon = "polygon",
    Path  = "path",
    Text = "text",
    Group = "g",
} 

/**
 * An interface to talk to when dealing with drawing, updating and deleting elements of an SVG drawing
 */
export class SVGWriter {

    public cursor: SVGElement;
    public readonly svgns = "http://www.w3.org/2000/svg";

    constructor(public root: SVGGElement) {
        this.cursor = root;
    }

    static new(root: SVGGElement) {
        return new SVGWriter(root);
    }

    ///////////////////////////////////////////////////////////////////////////

    placeCursor(el: SVGElement) {
        this.cursor = el;
    }

    write(type: SVG) {
        let el = document.createElementNS(this.svgns, type) as SVGElement;
        this.cursor.appendChild(el);
        this.cursor = el;
        return this;
    }

    return() {
        //@ts-ignore
        this.cursor = this.cursor.parentElement as SVGElement;
        return this;
    }

    ///////////////////////////////////////////////////////////////////////////

    set(attributes: any) {
        SVGWriter.setAttributes(this.cursor, attributes);
        return this;
    }

    append(type: SVG) {
        let el = document.createElementNS(this.svgns, type) as SVGElement;
        this.cursor.appendChild(el);
        return this;
    }

    clear() {

    }

    remove() {

    }

    pop() {

    }

    ///////////////////////////////////////////////////////////////////////////

    static setAttributes(element: Element, attributes: any) {
        for (let at in attributes) {
            element.setAttribute(at, attributes[at]);
        }
    }

    static getMatrix(s: SVGGElement) : SVGTransform {
        return s.transform.baseVal[0];
    } 
    
    /**
     * set it 
     */
    static setMatrix(s: SVGGElement, pos: Vector2, scale: number) {
        let tf = SVGWriter.getMatrix(s);
        
        // TODO figure out which method is faster 
        // tf.setMatrix({a: scale, d: scale, e: pos.x, f: pos.y})
        
        tf.matrix.a = scale;
        tf.matrix.d = scale;
        tf.matrix.e = pos.x;
        tf.matrix.f = pos.y;

    }
    
    /**
     * += 
     */
    static changeMatrixBy(s: SVGGElement, deltaPos: Vector2, deltaScale: number) {
        let tf = SVGWriter.getMatrix(s);
        tf.matrix.a += deltaScale;
        tf.matrix.d += deltaScale;
        tf.matrix.e += deltaPos.x;
        tf.matrix.f += deltaPos.y;
    }
}

