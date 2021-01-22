// Author: Jos Feenstra
// Purpose: The Core app. This can hold multiple other apps with their own Update and Draw calls. 
// Use this to switch between Apps, or run multiple Apps.

import { InputState } from "./system/input-state";
import { App } from "./app/app";

export class Core {

    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    state: InputState;
    private apps: App[];
    STOP = false;

    constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        this.canvas = canvas;
        this.gl = gl;
        this.state = new InputState(canvas);
        this.apps = [];
    }

    addApp(app: App) {
        this.apps.push(app);
        app.start();
    }

    update() {
        this.state.preUpdate();
        if (this.state.IsKeyPressed("Esc"))
            this.STOP = true;
        this.apps.forEach((app) => {
            app.update(this.state);
        });
        this.state.postUpdate();
    }

    draw() {
        
        const canvas = this.canvas;
        const gl = this.gl

        // pre-gl business
        if (window.innerHeight != canvas.height || 
            window.innerWidth  != canvas.width) 
        {
            canvas.height = window.innerHeight;
            // canvas.clientHeight = window.innerHeight;
            canvas.style.height = window.innerHeight.toString();

            canvas.width  = window.innerWidth;
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
        })
    }
}
