import { Scene, DrawSpeed } from "../../lib";

export abstract class MultiShader<T> {
    abstract set(r: T, speed: DrawSpeed): void;

    abstract render(context: Scene): void;

    setAndRender(r: T, context: Scene) {
        this.set(r, DrawSpeed.DynamicDraw);
        this.render(context);
    }
}
