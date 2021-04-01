// name:    ui.js
// author:  Jos Feenstra
// purpose: lets create the UI using html & dom api, because why the hell not

import { GeonMath } from "../math/math";

export class UI {

    readonly globalContext: HTMLDivElement;
    currentContext!: HTMLDivElement;


    constructor(frame: HTMLDivElement) {
        this.globalContext = frame;
        this.currentContext = frame;
    }


    addContext(appName: string) {

        this.currentContext = this.globalContext;
        let appDiv = this.addDiv(appName + " app-interface");
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


    addBooleanParameter(param: Parameter, onInput: (v: number) => void = () => {}) {
        let checkbox = this.addElement("input", "checkbox-slider-control checkbox-example") as HTMLInputElement;    
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
        
        
        // TODO update beyond our control
        param.onset = () => {
            // console.log("TODO");
        }

        this.addDiv("slider", [
            text1,
            checkbox,
        ]);

        return checkbox;
    }


    addParameter(param: Parameter, onInput: (v: number) => void = () => {}) {
        
        let slider = this.addRangeInput(param, onInput);
        let text1 = this.addElement("p", "slider-text");
        text1.innerText = param.name;

        let text2 = this.addElement("p", "slider-value");
        text2.innerText = slider.value;

        this.addDiv("slider", [
            text1,
            slider,
            text2,
        ]);

        // on update beyond our control
        param.onset = () => {
            // console.log("TODO");
        }

        slider.oninput = () => {
            param.set(slider.valueAsNumber);
            onInput(slider.valueAsNumber);
            text1.innerText = param.name;
            text2.innerText = slider.value;
        }
        return slider;
    }


    addRangeInput(param: Parameter, onInput: (v: number) => void = () => {}) {

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

        let select = this.addElement("select", "enum-selector dropdown-select") as HTMLSelectElement;
        for (let i = 0 ; i < count; i++) {
            let o = this.addElement("option", "enum-item");
            o.innerText = keys[i];
            select.appendChild(o);
        }
        // console.log(e);

        select.addEventListener("change", (e: Event) => {
            let target = e.target as HTMLSelectElement;
            let i = keys.indexOf(target.value);
            onchange(values[i]);
        });

        this.addDiv("dropdown-dark", [
            select,
        ]);

        return select;
    }


    private addElement(element: string, className: string = "") {
        
        let el = document.createElement(element)

        el.className = className;
        this.currentContext.appendChild(el);
        return el;
    }
}

// a slider parameter
export class Parameter {

    name: string;
    state: number;
    min: number;
    max: number;
    step: number
    onset?: Function;


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
        let clamped = GeonMath.clamp(state, this.min, this.max);
        let rest = this.state - this.min;
        let times = Math.min(rest / this.step);
        let stepped = this.min + this.step * times;
        this.state = GeonMath.clamp(state, this.min, this.max);  
        if (this.onset) 
            this.onset(this.state);   
    }

    getNPermutations() {
        return Math.min((this.max - this.min) / this.step + 1);
    }
}