import { Vector2 } from "../lib";
import { Context } from "./Context";

export type MouseAction = () => void;

export class MouseHandler {

    pos: Vector2 = Vector2.zero();
    delta: Vector2 = Vector2.zero();
    private posBefore: Vector2 = Vector2.zero();

    leftDown = false;
    middleDown = false;
    rightDown = false;
    
    // leftPressed = false;
    // middlePressed = false;
    // rightPressed = false;

    // private leftDownBefore = false;
    // private rightDownBefore = false;
    // private middleDownBefore = false;
    
    onLeftPressed?: MouseAction;
    onMiddlePressed?: MouseAction;
    onRightPressed?: MouseAction;
    
    onLeftUp?: MouseAction;
    onMiddleUp?: MouseAction;
    onRightUp?: MouseAction;

    private constructor(
        public context: Context,
        public width: number,
        public height: number,
    ) {
        this.start()
    }

    static new(context: Context, width: number, height: number) {
        return new MouseHandler(context, width, height);
    }

    start() {
        let c = this.context;

        document.addEventListener("mousedown", (e) => this.onDomEventMouseDown(e));
        document.addEventListener("mouseup", (e) => this.onDomEventMouseUp(e));
        document.addEventListener("mousemove", (e) => this.onDomEventMouseMove(e));
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        document.addEventListener("wheel", (e) => this.onDomEventWheel(e));

        document.addEventListener("touchmove", (e) => this.onDomEventTouchMove(e));
        document.addEventListener("touchstart", (e) => this.onDomEventTouchStart(e));
        document.addEventListener("touchend", (e) => this.onDomEventTouchEnd(e));

        c.addEventListener("blur", () => this.onDomEventBlur());
        c.addEventListener("focus", () => this.onDomEventFocus());
    }

    /**
     * Call this before general game update calls
     */
    update() {
        // // update mouse pos
        // if (!this.mousePosBuffered.equals(this.mousePos)) {
        //     // mouse has moved during previous frame
        //     this.mousePos = this.mousePosBuffered.clone();
        //     this.mouseDelta = this.mousePos.subbed(this.mousePosPrev);
        //     this.mousePosPrev = this.mousePos.clone();
        // } else {
        //     this.mouseDelta = Vector2.zero();
        // }

        // // normalize all scrolling behaviour
        // if (this.mouseScrollBuffered != 0) {
        //     // we are scrolling
        //     let value = 0.1;
        //     if (this.mouseScrollBuffered < 0) value = -0.1;
        //     this.scrollValue = Math.max(0, this.scrollValue + value);
        //     this.mouseScrollDelta = value;
        //     this.mouseScrollBuffered = 0;
        // } else {
        //     // this.mouseScrollBuffered = 0;
        //     this.mouseScrollDelta = 0;
        // }
    }

    /**
     * Has to be called after game update
    //  */
    // postUpdate() {
    
    //     this.leftDownBefore = this.leftDown;
    //     this.rightDownBefore = this.rightDown;
    //     this.middleDownBefore = this.MiddleDown;
    // }
    ///////////////////////////////////////////////////////////////////////////

    private onDomEventMouseDown(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.context.focus();
        let code = e.buttons;
        if (code >= 4) {
            code -= 4;
            if (!this.middleDown && this.onMiddlePressed) this.onMiddlePressed();
            this.middleDown = true;
        }
        if (code >= 2) {
            code -= 2;
            if (!this.rightDown && this.onRightPressed) this.onRightPressed();
            this.rightDown = true;
        }
        if (code >= 1) {
            code -= 1;
            if (!this.leftDown && this.onLeftPressed) this.onLeftPressed();
            this.leftDown = true;
        }
        return false;
    }

    private onDomEventMouseUp(e: MouseEvent) {
        let code = e.buttons;
        if (code < 4) {
            this.middleDown = false;
            if (this.onMiddleUp) this.onMiddleUp();
        }
        if (code < 2) {
            this.rightDown = false;
            if (this.onRightUp) this.onRightUp();
        }
        if (code < 1) {
            this.leftDown = false;
            if (this.onLeftUp) this.onLeftUp();
        }
    }

    private onDomEventMouseMove(e: MouseEvent) {
        // 
    }

    private onDomEventWheel(e: Event) {
        // 
    }

    private onDomEventTouchMove(e: TouchEvent) {
        e.preventDefault();
    }

    private onDomEventTouchStart(e: TouchEvent) {

    }

    private onDomEventTouchEnd(e: TouchEvent) {

    }

    private onDomEventBlur() {

    }

    private onDomEventFocus() {

    }
}
