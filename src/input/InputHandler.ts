/**
 * Composition over inherritance :) 
 * TODO generalize Mouse & Touch into PointerHandler on a later date. this will not be easy...
 * 
 * 
 * The problem with events and this game engine, is that events fire whenever they like, which is fine
 * BUT, certain behaviours are really hard to model as events, and are much easier modelled at a fixed update moment.
 * This is why these classes have been created. to catch event state, and turn it into regular state. 
 */

import { Util } from "../util/Util";
import { Context } from "./Context";
import { KeyboardHandler } from "./KeyboardHandler";
import { MouseHandler } from "./MouseHandler";
import { TimeHandler } from "./TimeHandler";
import { TouchHandler } from "./TouchHandler";

export enum Pointertype {
    Mouse,
    Touch
}


export class InputHandler {

    private constructor(
        public context: Context, // TODO maybe abstract Context, width , height away into 'WindowHandler', which can also handle the lose and regain of the focus
        public width: number,
        public height: number,
        public time: TimeHandler,
        public keys: KeyboardHandler | undefined,
        public mouse: MouseHandler | undefined,
        public touch: TouchHandler | undefined,
        public pointer: MouseHandler | TouchHandler,
        public pointerType: Pointertype,
    ) {}

    static fromCanvas(canvas: HTMLCanvasElement) {
        return InputHandler.new(canvas, canvas.clientWidth, canvas.clientHeight);
    }

    static new(context: Context, width: number, height: number) {
        let timeHandler = TimeHandler.new()
        let isMobile =  Util.isUserMobile();
      
        if (isMobile) {
            let touchHandler = TouchHandler.new(context, width, height);
            return new InputHandler(
                context,
                width,
                height,
                timeHandler,
                undefined,
                undefined,
                touchHandler,
                touchHandler,
                Pointertype.Touch,
            );
        } 

        let keyboardHandler = KeyboardHandler.new(context);
        let mouseHandler = MouseHandler.new(context, width, height);

        return new InputHandler(
            context,
            width,
            height,
            timeHandler,
            keyboardHandler,
            mouseHandler,
            undefined,
            mouseHandler,
            Pointertype.Mouse,
        );
    }

    update() {
        this.time.update();
        this.keys?.update();
        this.pointer.update(this.time.tick);
    }  

    postUpdate() {
        this.keys?.postUpdate();
        this.pointer.postUpdate();
    }
}