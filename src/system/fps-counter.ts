import { InputState } from "./input-state";

export class FpsCounter {
    fps = 0;
    updateEveryXTicks = 100;
    elapsed = 0;
    frames = 0;

    constructor() {}

    update(state: InputState) {
        this.frames += 1;
        this.elapsed += state.tick;
        if (this.elapsed > this.updateEveryXTicks) {
            this.setFps();
            this.elapsed = 0;
            this.frames = 0;
        }
    }

    setFps() {
        this.fps = Math.round((this.frames / this.elapsed) * 1000);
    }

    getFps() {
        return this.fps;
    }
}
