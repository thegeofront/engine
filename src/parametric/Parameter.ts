import { Domain, GeonMath } from "../lib";

// a slider parameter
export class Parameter {
    name: string;
    state: number;
    min: number;
    max: number;
    step: number;

    constructor(name: string, state: number, min = -Infinity, max = Infinity, step = 0.1) {
        this.name = name;
        this.min = min;
        this.max = max;
        this.step = step;

        this.state = state;
        this.set(this.state);
    }

    static new(name: string, state: number, min = -Infinity, max = Infinity, step = 0.1) {
        return new Parameter(name, state, min, max, step);
    }

    static newBoolean(name: string, state: boolean) {
        return new Parameter(name, state ? 1 : 0, 0, 1, 1);
    }

    get(): number {
        return this.state;
    }

    getDomain() : Domain {
        return Domain.new(this.min, this.max);
    }

    set(state: number, activateOnSet = true) {
        // something is still wrong here...
        let clamped = GeonMath.clamp(state, this.min, this.max);
        let rest = state - this.min;
        let times = Math.round(rest / this.step);
        let stepped = this.min + this.step * times;
        this.state = GeonMath.clamp(stepped, this.min, this.max);
        if (activateOnSet) this.onset();
    }

    getNPermutations() {
        return Math.min((this.max - this.min) / this.step + 1);
    }

    // TODO make this less tied together

    private slider?: HTMLInputElement;
    private text?: HTMLElement;

    setSlider(slider: HTMLInputElement) {
        this.slider = slider;
    }

    setSliderAndText(slider: HTMLInputElement, text?: HTMLElement) {
        this.slider = slider;
        this.text = text;
    }

    private onset() {
        if (this.slider)
            this.slider.valueAsNumber = this.state;
        if (this.text)
            this.text.innerText = this.state.toString();
    }
}

