// name:    ui.js
// author:  Jos Feenstra
// purpose: lets create the UI using html & dom api, because why the hell not

import { valueAndGrad } from "@tensorflow/tfjs-core";
import { GMath } from "../math/math";

export class UI {

    context: HTMLDivElement;


    constructor(frame: HTMLDivElement) {
        this.context = frame;
    }

    clear() {

        let count = this.context.childElementCount;
        for (let i = count - 1 ; i >=0 ; i-=1) {
            this.context.removeChild(this.context.children.item(i)!);
        }
    }

    private addElement(element: string, className: string = "") {
        
        let el = document.createElement(element)

        el.className = className;
        this.context.appendChild(el);
        return el;
    }

    addDiv(classname: string, items: HTMLElement[]) {
        let div = this.addElement("div", classname);
        items.forEach(item => {
            div.appendChild(item);
        });
    }

    addSlider(param: SliderParameter, onInput: (v: number) => void = () => {}) {
        
        let slider = this.addRangeInput(param, onInput);
        let text1 = this.addElement("p", "slider-text");
        text1.innerText = param.name;

        let text2 = this.addElement("p", "slider-value");
        text2.innerText = slider.value;

        this.addDiv("slider", [
            text1,
            text2,
            slider,
        ]);

        slider.oninput = () => {
            param.set(slider.valueAsNumber);
            onInput(slider.valueAsNumber);
            text1.innerText = param.name;
            text2.innerText = slider.value;
        }
    }

    addRangeInput(param: SliderParameter, onInput: (v: number) => void = () => {}) {

        // a slider looks like this : <input type="range" min="1" max="100" step="1" value="50">
        let slider = this.addElement("input", "slider-control") as HTMLInputElement;    
        
        slider.type = "range";
        slider.min = param.min.toString();
        slider.max = param.max.toString();
        slider.valueAsNumber = param.state;
        slider.step = param.step.toString();
 
        return slider;
    }

    addText() {
        this.addElement("")
    }

    addButton(name = "", onInput: (v: number) => void = () => {}) {
        let button = this.addElement("input", "slider") as HTMLInputElement;    
        
        button.type = "button";
        button.value = name;
        button.onclick = () => {
            onInput(Number.parseFloat(button.value));
        }
        return button;
    }

}

// a slider parameter
export class SliderParameter {

    name: string;
    state: number;
    min: number;
    max: number;
    step: number

    constructor(name: string, state: number, min =- Infinity, max = Infinity, step=0.1) {
        this.name = name;
        this.state = state;

        this.min = min;
        this.max = max;
        this.step = step;
    }

    get(): number {
        return this.state;
    }

    set(state: number) {
        // TODO ROUND TO NEAREST STEP
        this.state = GMath.clamp(state, this.min, this.max);
    }
}