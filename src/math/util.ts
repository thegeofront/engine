export class Util {
    static range(n: number): number[] {
        let array: number[] = [];
        for (let i = 0; i < n; i++) {
            array.push(i);
        }
        return array;
    }
}
