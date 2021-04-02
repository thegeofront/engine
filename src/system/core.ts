// Author: Jos Feenstra
// Purpose: The Core app. This can hold multiple other apps with their own Update and Draw calls.
// Use this to switch between Apps, or run multiple Apps.

import { InputState } from "./input-state";
import { App } from "../app/app";
import { FpsCounter } from "./fpsCounter";
import { UI } from "./ui";

export class Core {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    state: InputState;
    ui: UI;
    fpsCounter: FpsCounter;

    private apps: Map<string, App>;

    STOP = false;

    constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, uiFrame: HTMLDivElement) {
        this.canvas = canvas;
        this.gl = gl;
        this.state = new InputState(canvas);
        this.fpsCounter = new FpsCounter();
        this.ui = new UI(uiFrame);
        this.apps = new Map();
    }

    // todo: cycle through apps
    addApp(app: App) {
        this.apps.set(app.name, app);
        this.activateApp(app);
    }

    removeApp(appName: string) {
        this.ui.removeContext(appName);
        this.apps.delete(appName);
    }

    activateApp(app: App) {
        this.ui.addContext(app.name);
        app.ui(this.ui);
        app.start();
    }

    update() {
        this.state.preUpdate();
        this.fpsCounter.update(this.state);
        if (this.state.IsKeyPressed("Esc")) this.STOP = true;
        this.apps.forEach((app) => {
            app.update(this.state);
        });
        this.state.postUpdate();
    }

    draw() {
        const canvas = this.canvas;
        const gl = this.gl;

        // put fps in the titel
        document.title = "fps: " + this.fpsCounter.getFps();

        // pre-gl business
        if (window.innerHeight != canvas.height || window.innerWidth != canvas.width) {
            canvas.height = window.innerHeight;
            // canvas.clientHeight = window.innerHeight;
            canvas.style.height = window.innerHeight.toString();

            canvas.width = window.innerWidth;
            // canvas.clientWidth = window.innerWidth;
            canvas.style.width = window.innerWidth.toString();

            gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        }

        // Renderer.resizeCanvas(this.gl);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // render all apps
        // TODO : reverse order
        this.apps.forEach((app) => {
            app.draw(this.gl);
        });
    }
}
