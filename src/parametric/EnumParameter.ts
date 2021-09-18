import { Parameter } from "./Parameter";

// a parameter representing distinct states
export class EnumParameter {
    private constructor(public p: Parameter, public values: string[]) {}

    static new<T>(name: string, state: number, descriptions: string[]) {
        return new EnumParameter(
            new Parameter(name, state, 0, descriptions.length - 1, 1),
            descriptions,
        );
    }

    getName(): string {
        return this.values[this.get()];
    }

    // passthroughs

    get(): number {
        return this.p.get();
    }

    set(state: number) {
        return this.p.set(state);
    }

    getNPermutations() {
        return this.p.getNPermutations();
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
            this.slider!.valueAsNumber = this.get();
        if (this.text)
            this.text!.innerText = this.getName();
    }
}
