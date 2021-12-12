import { Vector2 } from "../math/Vector2";

export class TouchFinger {

    public event?: PointerEvent; // this is the latest event called
    public pos = Vector2.zero();
    public delta = Vector2.zero();
    
    public down = false;

    // remember previous state
    private posBefore = Vector2.zero();
    private downBefore = false;
    private lastId = 0;

    // store the most current state based on events, update it to the regular state at update time
    private downNew = false;
    private posNew = Vector2.zero();

    constructor() {}

    static new() {
        return new TouchFinger();
    }

    get pressed() {
        return (this.down && !this.downBefore);
    }

    get released() {
        return (!this.down && this.downBefore);
    }

    update() {
        this.downBefore = this.down;
        this.down = this.downNew;
 
        this.posBefore.copy(this.pos);
        this.pos.copy(this.posNew);
    
        this.delta.copy(this.posBefore).sub(this.pos);
    }

    _updatePressed(event: PointerEvent) {
        this.event = event;
        this.downNew = true;
    }

    _updateReleased(event: PointerEvent) {
        this.event = undefined;
        this.downNew = false;
        this.lastId = event.pointerId;
    }

    _updatePos(event: PointerEvent) {
        let resetDelta = false;
        this.posNew.set(event.clientX, event.clientY);
        if (this.lastId != event.pointerId) {
            this.pos.set(event.clientX, event.clientY);
            resetDelta = true;
        }
        this.lastId = event.pointerId;
        return resetDelta;
    }
}