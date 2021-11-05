import { Context } from "./Context";

export class MouseHandler {
    
    private constructor(
        public context: Context,
        public width: number,
        public height: number,
    ) {}

    static new(context: Context, width: number, height: number) {
        return new MouseHandler(context, width, height);
    }

    update() {

    }
}
