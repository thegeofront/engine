// purpose: test request functionalities in combination with GEON

import { App, Parameter, UI } from "../../src/lib";

export class RequestApp extends App {
    index!: Parameter;
    interface!: UI;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    ui(ui: UI) {
        this.interface = ui;
        this.index = new Parameter("value", 0, 0, 6, 1);

        ui.addText("Hoi dit is een test om fetch requests te sturen");
        ui.addParameter(this.index);
        ui.addButton("a button", this.fetchData.bind(this));
    }

    async fetchData() {
        // ASYNC BLOCKS THE ENTIRE FUNCTION UNTILL THAT THING PASSES
        let path = "henk.txt";
        console.log("lets fetch something from the internet");
        let res = await fetch(path);
        let blob = await res.blob();
        this.interface.addText(await blob.text());
        // let image = this.interface.addElement("image") as HTMLImageElement;
        // image.src = URL.createObjectURL(blob);
    }


    start() {

    }


    update() {

    }


    draw() {

    }
}


