export class TimeHandler {
    
    newTime!: number;
    oldTime!: number;
    startTime!: number;
    
    tick!: number;

    constructor() {
        this.start();
    }

    static new() {
        return new TimeHandler()
    }

    start() {
        this.tick = 0;
        this.oldTime = Date.now();
        this.newTime = this.oldTime;
        this.startTime = this.oldTime;
        // this.minimumTick = 1000 / 144;
    }

    update() {
        this.newTime = Date.now();
        this.oldTime = this.newTime;
        this.tick = this.newTime - this.oldTime;
    }

}