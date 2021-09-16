// CanvasInputHandler.ts
// author : Jos Feenstra
// purpose : handle all input events.

import { Vector2 } from "../math/vector";

enum Key {
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z,
    Up,
    Down,
    Left,
    Right,
    Space,
    Control,
    Alt,
    Shift,
    Enter,
    Esc,
    N1,
    N2,
    N3,
    N4,
    N5,
    N6,
    N7,
    N8,
    N9,
    N0,
    Plus,
    Minus,
    Backspace,
}

function toMapping(key: Key): number {
    switch (key) {
        case Key.A:
            return 1;
        case Key.B:
            return 2;
        case Key.C:
            return 3;
        case Key.D:
            return 4;
        case Key.E:
            return 5;
        case Key.F:
            return 6;
        default:
            return 0;
    }
}

export interface IKeys {
    [key: string]: boolean;
}

export class InputState {
    canvas: HTMLCanvasElement;

    tick: number;
    oldTime: number;
    newTime: number;
    startTime: number;
    minimumTick: number;

    mousePos: Vector2 = Vector2.zero();
    private mousePosBuffered: Vector2 = Vector2.zero();

    private mousePosPrev: Vector2 = Vector2.zero();
    mouseDelta: Vector2 = Vector2.zero();

    mouseLeftDown = false;
    mouseLeftPressed = false;
    mouseLeftPrev = false;

    mouseRightDown = false;
    mouseRightPressed = false;
    mouseRightPrev = false;

    mouseMiddleDown = false;
    mouseMiddlePressed = false;
    private mouseMiddlePrev = false;

    public keysDown: IKeys = {};
    private keysPressed: string[] = [];

    scrollValue = 0;
    private scrollValuePrevious = 0;
    mouseScrollDelta = 0;
    private mouseScrollBuffered = 0;

    // TODO: build a full range of delegate functions
    
    onMouseWheelScroll?: Function;
    onMouseLeftUp?: Function;


    constructor(canvas: HTMLCanvasElement) {
        // link
        this.canvas = canvas;

        // time
        this.tick = 0;
        this.oldTime = Date.now();
        this.newTime = this.oldTime;
        this.startTime = Date.now();
        this.minimumTick = 1000 / 144;

        // pointer
        // if (window.PointerEvent) {
        //     console.log("pointer events")
        //     canvas.addEventListener("pointerdown", this.onPointerDown.bind(this));
        //     canvas.addEventListener("pointerup", this.onPointerUp.bind(this));
        //     canvas.addEventListener("pointermove", this.onPointerMove.bind(this));
        // } else {
        canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        canvas.addEventListener("wheel", this.setMouseScroll.bind(this));

        canvas.addEventListener("touchstart", this.onTouchDown.bind(this));
        canvas.addEventListener("touchend", this.onTouchUp.bind(this));
        canvas.addEventListener("touchmove", this.onTouchMove.bind(this));

        // }

        // for (let i = 0; i < 223; i++) this.keysDown[i] = false;

        // keyboard
        canvas.addEventListener("keydown", this.onKeyDown.bind(this));
        // canvas.addEventListener("keypressed", this.onKeyPressed.bind(this));
        canvas.addEventListener("keyup", this.onKeyUp.bind(this));

        // final
        canvas.focus();
    }

    static new(canvas: HTMLCanvasElement) {
        return new InputState(canvas)
    }

    public preUpdate(tick: number) {
        // this must be called every tick within whatever context this is used

        // update time
        this.newTime = Date.now();
        this.oldTime = this.newTime;
        this.tick = tick;
   
        // update mouse pos 
        if (!this.mousePosBuffered.equals(this.mousePos)) {
            // mouse has moved during previous frame
            this.mousePos = this.mousePosBuffered.clone();
            this.mouseDelta = this.mousePos.subbed(this.mousePosPrev);
            this.mousePosPrev = this.mousePos.clone();
        } else {
            this.mouseDelta =Vector2.zero();
        }

        // update mouse buttons
        this.mouseLeftPressed = this.mouseLeftPrev != this.mouseLeftDown && this.mouseLeftDown;
        this.mouseRightPressed = this.mouseRightPrev != this.mouseRightDown && this.mouseRightDown;
        this.mouseMiddlePressed =
            this.mouseMiddlePrev != this.mouseMiddleDown && this.mouseMiddleDown;

        // update scrolling
        
        // normalize all scrolling behaviour
        if (this.mouseScrollBuffered != 0) {
            // we are scrolling
            let value = 0.1;
            if (this.mouseScrollBuffered < 0) value = -0.1;
            this.scrollValue = Math.max(0, this.scrollValue + value);
            this.mouseScrollDelta = value;
            this.mouseScrollBuffered = 0;
        } else {
            // this.mouseScrollBuffered = 0;
            this.mouseScrollDelta = 0;
        }
    }

    public setScrollValue(value: number) {
        this.scrollValue = Math.max(0, value);
    }

    public postUpdate() {
        // this also must be called for keyIsPressed to work

        this.mouseLeftPrev = this.mouseLeftDown;
        this.mouseRightPrev = this.mouseRightDown;
        this.mouseMiddlePrev = this.mouseMiddleDown;
        
        // refresh keypresses
        this.keysPressed = [];
    }

    public IsKeyDown(key: string): boolean {
        return this.keysDown[key];
    }

    public IsKeyPressed(key: string): boolean {
        for (let k of this.keysPressed) {
            if (k === key) {
                return true;
            }
        }
        return false;
    }

    public onKeyDown(e: KeyboardEvent) {
        let key = e.key.toLowerCase();
        if (this.keysDown[key] == true) return;
        // console.log(key);
        this.keysDown[key] = true;
        this.keysPressed.push(key);
    }

    public onKeyUp(e: KeyboardEvent) {
        let key = e.key.toLowerCase();
        this.keysDown[key] = false;
    }

    public onKeyPressed(e: KeyboardEvent) {
        // NOTE: i made a different system to handle this, see onKeyDown
    }

    private setMouseScroll(e: WheelEvent) {
        this.mouseScrollBuffered = e.deltaY;
    }

    private setMousePos(x: number, y: number) {
        this.mousePosBuffered = new Vector2(x,y);
    }

    private onMouseUp(e: MouseEvent) {
        let code = e.buttons;
        if (code < 4) {
            this.mouseMiddleDown = false;
        }
        if (code < 2) {
            this.mouseRightDown = false;
        }
        if (code < 1) {
            this.mouseLeftDown = false;
            if (this.onMouseLeftUp) this.onMouseLeftUp();
        }
    }

    private onMouseMove(e: MouseEvent) {
        // this is a bit messy, BUT, multiply by camera parameters
        this.setMousePos(e.clientX, e.clientY);
    }

    private onMouseDown(e: MouseEvent) {
        e.preventDefault();
        // e.stopPropagation();
        this.canvas.focus();
        let code = e.buttons;
        if (code >= 4) {
            code -= 4;
            this.mouseMiddleDown = true;
        }
        if (code >= 2) {
            code -= 2;
            this.mouseRightDown = true;
        }
        if (code >= 1) {
            code -= 1;
            this.mouseLeftDown = true;
        }
        return false;
    }

    private onTouchDown(e: TouchEvent) {
        let buttons = 0;
        if (e.touches.length > 0) {
            buttons += 1;
        }
        if (e.touches.length >11) {
            buttons += 2;
        }
        let mouseEvent = new MouseEvent("mousedown", {buttons});
        this.canvas.dispatchEvent(mouseEvent)
        let clientX = e.touches[0].clientX;
        let clientY = e.touches[0].clientY;
        let mouseEvent2 = new MouseEvent("mousemove", {clientX, clientY});
        this.canvas.dispatchEvent(mouseEvent2)
        e.stopPropagation();
    }

    private onTouchMove(e: TouchEvent) {
        let clientX = e.touches[0].clientX;
        let clientY = e.touches[0].clientY;
        let mouseEvent = new MouseEvent("mousemove", {clientX, clientY});
        this.canvas.dispatchEvent(mouseEvent)
    }

    private onTouchUp(e: TouchEvent) {
        let mouseEvent = new MouseEvent("mouseup", {});
        this.canvas.dispatchEvent(mouseEvent)
    }

    // private onPointerDown(e: PointerEvent) {
    //     console.log("down", e.buttons);
    //     let buttons = e.buttons;

    //     if (e.pointerType == "touch") {
    //         e.stopPropagation();
    //         buttons += 1;
            
    //     }

    //     let mouseEvent = new MouseEvent("mousedown", {buttons});
    //     this.canvas.dispatchEvent(mouseEvent)
    // }

    // private onPointerMove(e: PointerEvent ) {
    //     console.log("move");
    //     let clientX = e.screenX;
    //     let clientY = e.screenY;
    //     let mouseEvent = new MouseEvent("mousemove", {clientX, clientY});
    //     this.canvas.dispatchEvent(mouseEvent)
    // }

    // private onPointerUp(e: PointerEvent ) {
    //     let mouseEvent = new MouseEvent("mouseup", {});
    //     this.canvas.dispatchEvent(mouseEvent)
    // }
}
