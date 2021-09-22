export class Color {

    private constructor(
        public data: Array<number>,
    ) {}

    static new(r=1, g=1, b=1, a=1) {
        return new Color([r,g,b,a]);
    }

    static fromList(list: number[]) {
        if (list.length != 3) {
            return undefined;
        }
        return new Color(list);
    }

    get r() { return this.data[0] }
    get g() { return this.data[1] }
    get b() { return this.data[2] }
    get a() { return this.data[3] }

    set r(value: number) { this.data[0] = value }
    set g(value: number) { this.data[1] = value }
    set b(value: number) { this.data[2] = value }
    set a(value: number) { this.data[3] = value }
}