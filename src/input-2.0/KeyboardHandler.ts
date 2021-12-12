import { Context } from "./Context";
import { Key } from "./Keys";

export type KeyAction = () => void;

export class KeyboardHandler {

    constructor(
        public context: Context,
    
        private keysDown: Set<Key> = new Set(), // only keeps track of keys down who have a KeyDown action attached
        private keysPressed: Set<Key> = new Set(), // only keeps track of keys down who have a KeyDown action attached
        private keysDownWithAction: Set<Key> = new Set(), // only keeps track of keys down who have a KeyDown action attached

        private keyPressedActions: Map<Key, KeyAction> = new Map(),
        private keyDownActions: Map<Key, KeyAction> = new Map(),
        private keyUpActions: Map<Key, KeyAction> = new Map(),
        
    ) {
        this.start();
    }

    static new(context: Context) {
        // NOTE: it seems that svg's do not handle button press events. For now, use global window.
        return new KeyboardHandler(window);
    }

    update() {
        for (let key of this.keysDownWithAction) {
            this.keyDownActions.get(key)!();
        }


    }    

    ///////////////////////////////////////////////////////////////////////////

    isDown(key: Key) {
        return this.keysDown.has(key);
    }
        
    isPressed(key: Key) {
        return this.keysPressed.has(key);
    }

    onDown(key: Key, action: KeyAction) {
        this.keyDownActions.set(key, action);
    }

    onPressed(key: Key, action: KeyAction) {
        this.keyPressedActions.set(key, action);
    }

    onUp(key: Key, action: KeyAction) {
        this.keyUpActions.set(key, action);
    }

    removeDown(key: Key) {
        this.keyDownActions.delete(key);
    }

    removePressed(key: Key) {
        this.keyPressedActions.delete(key);
    }

    removeUp(key: Key) {
        this.keyUpActions.delete(key);
    }

    ///////////////////////////////////////////////////////////////////////////

    private start() {
        let c = this.context;
        
        c.addEventListener("keydown", (res) => this.onDomEventKeyDown(res));
        c.addEventListener("keyup", (res) => this.onDomEventKeyUp(res));
        c.addEventListener("blur", (res) => this.onDomEventBlur());
        c.addEventListener("focus", (res) => this.onDomEventFocus());
    }


    private onDomEventKeyDown(res: any) {
        let code = res.keyCode;
        if (this.keysDownWithAction.has(code)) return; 
        
        // the key is freshly pressed
        let pressedAction = this.keyPressedActions.get(code); 
        if (pressedAction) {
            pressedAction();
        }

        // if we need to keep track of if this key is down, then keep track of it
        if (this.keyDownActions.has(code)) {
            this.keysDownWithAction.add(code);
        }
        this.keysDown.add(code);
    }

    private onDomEventKeyUp(res: any) {
        let code = res.keyCode;
        // console.log(code, "up");
        
        this.keysDownWithAction.delete(code);
        this.keysDown.delete(code);

        // try to do a key up action
        let upAction = this.keyUpActions.get(code); 
        if (upAction) {
            upAction();
        }
    }

    private onDomEventBlur() {
        // console.log("on blur");
        
        this.keysDownWithAction.clear();
        this.keysDown.clear();
    }

    private onDomEventFocus() {
        // console.log("on focus");
    }
}
