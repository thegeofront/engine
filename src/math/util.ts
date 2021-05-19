export class Util {
    static range(n: number): number[] {
        let array: number[] = [];
        for (let i = 0; i < n; i++) {
            array.push(i);
        }
        return array;
    }

    static collect<T>(gen: Generator<T>): Array<T> {
        let arr = new Array<T>();
        for (let item of gen) {
            arr.push(item);
        }
        return arr;
    }
}
