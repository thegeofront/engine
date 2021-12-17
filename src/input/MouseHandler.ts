import { Debug, Vector2 } from "../lib";
import { Context } from "./Context";

export type MouseAction = (e?: MouseEvent) => void;

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

    private scrollNew: number = 0;
    scrollDelta: number = 0;

    middleDownBefore = false;
    rightDownBefore = false;
    leftDownBefore = false;

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

    private start() {
        let c = this.context;

        document.addEventListener("mousedown", (e) => this.onDomEventMouseDown(e));
        document.addEventListener("mouseup", (e) => this.onDomEventMouseUp(e));
        document.addEventListener("mousemove", (e) => this.onDomEventMouseMove(e));
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        document.addEventListener("wheel", (e) => this.onDomEventWheel(e));

        c.addEventListener("blur", () => this.onDomEventBlur());
        c.addEventListener("focus", () => this.onDomEventFocus());
    }

    /**
     * Call this before general game update calls
     */
    update() {

        // normalize all scrolling behaviour
        if (this.scrollNew != 0) {
            // we are scrolling
            let value = 0.1;
            if (this.scrollNew < 0) value = -0.1;
            this.scrollDelta = value;
            this.scrollNew = 0;
        } else {
            this.scrollDelta = 0;
        }
    }

    /**
     * Has to be called after game update
    //  */
    postUpdate() {
        this.leftDownBefore = this.leftDown;
        this.rightDownBefore = this.rightDown;
        this.middleDownBefore = this.middleDown;
    }

    ///////////////////////////////////////////////////////////////////////////

    get leftPressed() {
        return this.leftDown && !this.leftDownBefore
    }
    
    get rightPressed() {
        return this.rightDown && !this.rightDownBefore
    }

    get middlePressed() {
        return this.middleDown && !this.middleDownBefore
    }

    ///////////////////////////////////////////////////////////////////////////

    private onDomEventMouseDown(e: MouseEvent) {
        // e.preventDefault();
        // e.stopPropagation();

        // this.context.focus();
        let code = e.buttons;
        if (code >= 4) {
            code -= 4;
            if (!this.middleDown && this.onMiddlePressed) this.onMiddlePressed(e);
            this.middleDown = true;
        }
        if (code >= 2) {
            code -= 2;
            if (!this.rightDown && this.onRightPressed) this.onRightPressed(e);
            this.rightDown = true;
        }
        if (code >= 1) {
            code -= 1;
            if (!this.leftDown && this.onLeftPressed) this.onLeftPressed(e);
            this.leftDown = true;
        }
    }

    private onDomEventMouseUp(e: MouseEvent) {
        let code = e.buttons;
        if (code < 4) {
            this.middleDown = false;
            if (this.onMiddleUp) this.onMiddleUp(e);
        }
        if (code < 2) {
            this.rightDown = false;
            if (this.onRightUp) this.onRightUp(e);
        }
        if (code < 1) {
            this.leftDown = false;
            if (this.onLeftUp) this.onLeftUp(e);
        }
    }

    private onDomEventMouseMove(e: MouseEvent) {
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
    }

    private onDomEventWheel(e: WheelEvent) {
        this.scrollNew = e.deltaY;
    }

    private onDomEventBlur() {
        Debug.log("focus!");
    }

    private onDomEventFocus() {
        Debug.log("blur!");
    }
}
