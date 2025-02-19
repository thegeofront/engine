// Author: Jos Feenstra
// Purpose: The Core app. This can hold multiple other apps with their own Update and Draw calls.
// Use this to switch between Apps, or run multiple Apps.

import { App } from "./App";
import { FpsCounter } from "../util/FpsCounter";
import { UI } from "../dom/UI";
import { HelpGl, InputHandler } from "../lib";

export class Core {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    input: InputHandler;
    ui: UI;
    fpsCounter: FpsCounter;

    fullscreen = true;
    fpsInTitle = true;

    private apps: Map<string, App>;

    constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, uiFrame?: HTMLDivElement) {
        this.canvas = canvas;
        this.gl = gl;
        this.input = InputHandler.fromCanvas(canvas);
        this.fpsCounter = new FpsCounter();
        this.ui = new UI(uiFrame);
        this.apps = new Map();
        this.gl.clearColor(0, 0, 0, 0);
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
        this.ui.addText(app.description);
        app.ui(this.ui);
        app.start();
    }

    update(time: number) {
        this.input.update();
        this.fpsCounter.update(this.input.time.tick);
        this.apps.forEach((app) => {
            app.update(this.input);
        });
        this.input.postUpdate();
    }

    draw(clear=true) {
        const canvas = this.canvas;
        const gl = this.gl;

        if (this.fullscreen) {
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
        } 

        if (clear) {
            HelpGl.clear(gl);
        }

        // render all apps
        // TODO : reverse order
        this.apps.forEach((app) => {
            app.draw();
        });
    }
}
