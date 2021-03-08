// name:    ui.js
// author:  Jos Feenstra
// purpose: lets create the UI using html & dom api, because why the hell not

import { valueAndGrad } from "@tensorflow/tfjs-core";

export class UI {

    context: HTMLDivElement;


    constructor(frame: HTMLDivElement) {
        this.context = frame;

        // test
        console.log(this.context);
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

    addSlider(name = "", min = 0.0, max = 1.0, defaultValue = 0.5, step=0.1, onInput: (v: number) => void = () => {}) {

        // a slider looks like this : <input type="range" min="1" max="100" step="1" value="50">
        let slider = this.addElement("input", "slider") as HTMLInputElement;    
        
        slider.type = "range";
        slider.min = min.toString();
        slider.max = max.toString();

        console.log(defaultValue)
        slider.valueAsNumber = defaultValue;
        slider.step = step.toString();
        slider.oninput = () => {
            onInput(slider.valueAsNumber);
        }
        console.log(slider);
        return slider;
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

