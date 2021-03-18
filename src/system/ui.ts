// name:    ui.js
// author:  Jos Feenstra
// purpose: lets create the UI using html & dom api, because why the hell not

import { GMath } from "../math/math";

export class UI {

    
    readonly globalContext: HTMLDivElement;
    currentContext!: HTMLDivElement;

    constructor(frame: HTMLDivElement) {
        this.globalContext = frame;
        this.currentContext = frame;
    }


    addContext(appName: string) {

        this.currentContext = this.globalContext;
        let appDiv = this.addDiv(appName);
        this.currentContext = appDiv;
    }


    setContext(appName: string) {
        this.globalContext.getElementsByClassName(appName);
    }


    removeContext(appName: string) {
        this.setContext(appName);
        let count = this.currentContext.childElementCount;
        for (let i = count - 1 ; i >=0 ; i-=1) {
            this.currentContext.removeChild(this.currentContext.children.item(i)!);
        }

        let temp = this.currentContext;
        this.currentContext = this.globalContext;
        this.currentContext.removeChild(temp);
    }


    addDiv(classname: string, items: HTMLElement[]=[]) : HTMLDivElement {
        let div = this.addElement("div", classname) as HTMLDivElement;
        items.forEach(item => {
            div.appendChild(item);
        });
        return div;
    }


    addBooleanSlider(param: SliderParameter, onInput: (v: number) => void = () => {}) {

        
        let checkbox = this.addElement("input", "checkbox-slider-control") as HTMLInputElement;    
        checkbox.type = "checkbox";
        checkbox.addEventListener('change', () => {

            let state = checkbox.checked;
            param.set(state? 1 : 0);

            onInput(checkbox.valueAsNumber);
            text1.innerText = param.name;
        });
        checkbox.checked = param.get() == 1;

        let text1 = this.addElement("p", "slider-text");
        text1.innerText = param.name;

        this.addDiv("slider", [
            text1,
            checkbox,
        ]);



        return checkbox;
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
        return slider;
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

    
    addEnum<T>(keys: string[], values: T[], onchange: (selection: T) => void) : HTMLSelectElement {
        // <select>
        //  <option>Cappuccino</option>
        //  <option>Mocha</option>
        // </select>

        if (keys.length != values.length) {
            console.error("need same amount of keys & values");
        }
        let count = keys.length;

        let e = this.addElement("select", "enum-selector") as HTMLSelectElement;
        for (let i = 0 ; i < count; i++) {
            let o = this.addElement("option", "enum-item");
            o.innerText = keys[i];
            e.appendChild(o);
        }
        console.log(e);

        e.addEventListener("change", (e: Event) => {
            let target = e.target as HTMLSelectElement;
            let i = keys.indexOf(target.value);
            onchange(values[i]);
        });
        return e;
    }


    private addElement(element: string, className: string = "") {
        
        let el = document.createElement(element)

        el.className = className;
        this.currentContext.appendChild(el);
        return el;
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