/**
 * Composition over inherritance :) 
 */

import { Context } from "./Context";
import { KeyboardHandler } from "./KeyboardHandler";
import { MouseHandler } from "./MouseHandler";
import { TimeHandler } from "./TimeHandler";

export class InputHandler {

    private constructor(
        public time: TimeHandler,
        public keys: KeyboardHandler,
        public mouse: MouseHandler,
    ) {}

    static fromCanvas() {

    }

    static new(context: Context, width: number, height: number) {
        return new InputHandler(
            TimeHandler.new(),
            KeyboardHandler.new(context),
            MouseHandler.new(context, width, height)
        );
    }

    update() {
        this.time.update();
        this.keys.update();
        this.mouse.update();
    }  


}