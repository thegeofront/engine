import { Parameter } from "../system/ui";

// css classes
const DUO_WRAPPER = "duo-wrapper";
const DUO_HEADER = "duo-header";
const DUO_BODY = "duo-body";
const DUO_SLIDER_HOR = "duo-slider-hor";
const DUO_SLIDER_VER = "duo-slider-ver";
const DUO_CANVAS = "duo-canvas";

export class DuoParameter {
    constructor(public x: Parameter, public y: Parameter) {}

    static new(name: string, x: Parameter, y: Parameter) {
        return new DuoParameter(x, y);
    }

    toHtml(): HTMLDivElement {
        let div = new HTMLDivElement();
        div.className = DUO_WRAPPER;

        div.innerHTML = `
            <p class=${DUO_HEADER}></p>
            <div class = ${DUO_BODY}>
                <input type="range" class=${DUO_SLIDER_HOR}></input>
                <input type="range" class=${DUO_SLIDER_VER}></input>
                <canvas class=${DUO_CANVAS}></canvas>
            </div>
        `;

        return div;
    }
}
