// CanvasInputHandler.ts
// author : Jos Feenstra
// purpose : handle all input events.

import { Vector2 } from "../math/vector";

enum Key {
    A, B, C, D, E, F,  G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
    Up, Down, Left, Right, Space, Control, Alt, Shift, Enter, Esc,
    N1, N2, N3, N4,  N5,  N6, N7, N8,  N9, N0, Plus, Minus, Backspace
}

function toMapping(key: Key) : number {
    switch(key) {
        case(Key.A): return 1;
        case(Key.B): return 2;
        case(Key.C): return 3;
        case(Key.D): return 4;
        case(Key.E): return 5;
        case(Key.F): return 6;
        default: return 0;
    }
}

export interface IKeys 
{
    [key: string] : boolean
}

export class InputState {

    tick: number;
    oldTime: number;
    newTime: number;
    startTime: number;
    minimumTick: number;

    mousePos: Vector2 = Vector2.zero();
    mouseDelta: Vector2 = Vector2.zero();
    mouseLeftDown = false;
    mouseLeftPressed = false;
    private mouseLeftPrev = false;

    mouseRightDown = false;
    mouseRightPressed = false;
    private mouseRightPrev = false;

    mouseMiddleDown = false;
    mouseMiddlePressed = false;
    private mouseMiddlePrev = false;

    private keysDown: IKeys = {};
    private keysPressed: string[] = [];

    scrollValue = 0;

    // delegate functions
    onMouseWheelScroll?: Function;
    constructor(canvas: HTMLCanvasElement) {

        // time
        this.tick = 0;
        this.oldTime = Date.now();
        this.newTime = this.oldTime;
        this.startTime = Date.now();
        this.minimumTick = 1000 / 144;

        // mouse
        canvas.addEventListener("mousemove", this.setMousePos.bind(this));
        canvas.addEventListener("mousedown", this.setMouseDown.bind(this));
        canvas.addEventListener("mouseup", this.setMouseUp.bind(this));
        canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); e.stopPropagation(); });
        canvas.addEventListener("mousemove", this.setMousePos.bind(this));
        canvas.addEventListener("wheel", this.setMouseScroll.bind(this));
        canvas.addEventListener("touchmove", this.setTouch.bind(this));
        canvas.addEventListener("touchstart", this.setTouch.bind(this));
        canvas.addEventListener("touchend", this.setTouchUp.bind(this));
        for(let i = 0; i < 223 ;i++)
            this.keysDown[i] = false;
        
        // keyboard
        canvas.addEventListener("keydown", this.onKeyDown.bind(this));
        // canvas.addEventListener("keypressed", this.onKeyPressed.bind(this));
        canvas.addEventListener("keyup", this.onKeyUp.bind(this));

        // final   
        canvas.focus();
    }

    public preUpdate() {
        // this must be called every tick within whatever context this is used

        // update time
        this.newTime = Date.now();
        this.tick = (this.newTime - this.oldTime);
        this.oldTime = this.newTime;

        // update mouse
        this.mouseLeftPressed =  (this.mouseLeftPrev != this.mouseLeftDown) && this.mouseLeftDown;
        this.mouseRightPressed =  (this.mouseRightPrev != this.mouseRightDown) && this.mouseRightDown;
        this.mouseMiddlePressed =  (this.mouseMiddlePrev != this.mouseMiddleDown) && this.mouseMiddleDown;

        this.mouseLeftPrev = this.mouseLeftDown
        this.mouseRightPrev = this.mouseRightDown
        this.mouseMiddlePrev = this.mouseMiddleDown
    }

    public postUpdate() {

        // this also must be called for keyIsPressed to work

        // refresh keypresses
        this.keysPressed = [];
    }

    public IsKeyDown(key: string) : boolean
    {
        return this.keysDown[key];  
    }

    public IsKeyPressed(key: string) : boolean
    {
        return this.keysPressed.includes(key);
    }

    public onKeyDown(e: KeyboardEvent)
    { 
        if (this.keysDown[e.key] == true) return;
        console.log(e.key);
        this.keysDown[e.key.toLowerCase()] = true;
        this.keysPressed.push(e.key);
    }

    public onKeyUp(e: KeyboardEvent)
    {
        this.keysDown[e.key.toLowerCase()] = false;
    }

    public onKeyPressed(e: KeyboardEvent)
    {
        // NOTE: i made a different system to handle this, see onKeyDown
    }

    private setTouch(e: TouchEvent) {
        e.preventDefault();

        this.mousePos = new Vector2(e.touches[0].clientX, e.touches[0].clientY);
        this.mouseLeftDown = true;
    }

    private setTouchUp(e: TouchEvent) {
        e.preventDefault();
        this.mouseLeftDown = false;
    }

    private setMouseScroll(e: WheelEvent) {
        // console.log("we be scrollin' now...")
        this.scrollValue = e.deltaY;
    }

    private setMousePos(e: MouseEvent)
    {
        // this is a bit messy, BUT, multiply by camera parameters
        this.mousePos = new Vector2(e.clientX, e.clientY);;
    }

    private setMouseUp(e: MouseEvent)
    {
        let code = e.buttons;
        if (code < 4) 
        {
            this.mouseMiddleDown = false;
        }
        if (code < 2) 
        {
            this.mouseRightDown = false;
        }
        if (code < 1) 
        {
            this.mouseLeftDown = false;
        } 
    }

    private setMouseDown(e: MouseEvent)
    {
        e.preventDefault();
        e.stopPropagation();
        let code = e.buttons;
        if (code >= 4) 
        {
            code -= 4;
            this.mouseMiddleDown = true;
        }
        if (code >= 2) 
        {
            code -= 2;
            this.mouseRightDown = true;
        }
        if (code >= 1) 
        {
            code -= 1;
            this.mouseLeftDown = true;
        }  
        return false;     
    }




}