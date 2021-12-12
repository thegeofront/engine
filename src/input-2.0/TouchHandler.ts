import { Debug, GeonMath, Vector2 } from "../lib";
import { Context } from "./Context";
import { TouchFinger } from "./TouchFinger";


export class TouchHandler {
    
    // represent the first, second, third, etc... finger to touch the screen, in order of touch 
    fingers: [TouchFinger, TouchFinger, TouchFinger, TouchFinger, TouchFinger] = [
        TouchFinger.new(), TouchFinger.new(), TouchFinger.new(), TouchFinger.new(), TouchFinger.new()
    ];
   
    down = 0; // the number of fingers down
    downTime = 0; // how long these fingers are down, count starting at the first finger down 

    zoomScore = 0;
    private distance = 0;
    zoomDelta= 0;

    constructor(
        private context: Context,
        private width: number,
        private height: number) {
        this.start();
    }

    static new(context: Context, width: number, height: number) {
        return new TouchHandler(context, width, height);
    }

    start() {
        let el = this.context;
        
        if (el instanceof HTMLElement) {
            el.style.touchAction = 'none';
        }

        el.onpointerdown = this.onAddFinger.bind(this);
        el.onpointermove = this.onUpdateFinger.bind(this);
        el.onpointerup = this.onRemoveFinger.bind(this);
        el.onpointercancel = this.onRemoveFinger.bind(this);
        el.onpointerout = this.onRemoveFinger.bind(this);
        el.onpointerleave = this.onRemoveFinger.bind(this);
    }

    update(dt: number) {
        this.updateFingers();
        this.updateDown(dt);
        this.updateZoom();
    }

    /////////////////////////////////////////////////////////////////////////// Updates

    private updateFingers() {
        for (let finger of this.fingers) {
            finger.update();
        }
    }

    private updateDown(dt: number) {
        // update down
        this.down = 0;
        for (let finger of this.fingers) {
            if (finger.down) {
                this.down += 1;
            }
        }

        // update downtime
        if (this.down > 0) {
            this.downTime += dt;
        } else {
            this.downTime = 0;
        }
    }

    private disId1 = 0;
    private disId2 = 0;
    private updateZoom(resetDelta = false) {
        if (this.down < 2) return
        var newDistance = this.fingers[0].pos.disTo(this.fingers[1].pos);

        // if (resetDelta) {
        //     Debug.dispatch(`resetDelta: ${resetDelta} delta: ${this.zoomDelta} distance: ${this.distance}`)
        //     this.distance = newDistance;
        //     this.zoomDelta = 0;
        //     return;
        // }

        this.zoomDelta = this.distance - newDistance;
        this.distance = newDistance;


        this.zoomScore += this.zoomDelta;

    }

    /////////////////////////////////////////////////////////////////////////// Finger updates

    private onAddFinger(event: PointerEvent) {
        // add a binding between pointer-events and finger objects. 
        for (let finger of this.fingers) {
            if (!finger.event) {
                finger._updatePressed(event);
                return;
            }
        }
    }

    private onRemoveFinger(event: PointerEvent) {
        // remove the event - finger binding
        for (let finger of this.fingers) {
            if (finger.event?.pointerId == event.pointerId) {
                finger._updateReleased(event);
                return;
            }
        }
    }
        
    private onUpdateFinger(event: PointerEvent) {
        // update the binding
        let resetDelta = false;
        for (let finger of this.fingers) {
            if (finger.event?.pointerId == event.pointerId) {
                resetDelta = finger._updatePos(event);
                break;
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////

}