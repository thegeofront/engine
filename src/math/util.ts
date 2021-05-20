import { GeonMath } from "./math";

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

    /**
     * ```
     *         column
     *      4  3  2  1  0
     *   0 |>
     * r 1 |>     >
     * o 2 |>     >     >
     * w 3 |>     >
     *   4 |>
     *
        // iterate over this triangle, starting at the base
        let tri = Util.iterateTriangle;
        for (let col = size - 1; col > -1; col -= 1) {
            for (let row = 0; row <= col; row++) {
                let idx = tri(col, row);
                console.log(idx);
            }
        }
     * ```
     */
    static iterateTriangle(column: number, row: number): number {
        return GeonMath.stack(column) + row;
    }
}
