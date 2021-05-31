import { MultiVector3 } from "../data/multi-vector-3";
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
        for (let col = size - 1; col > -1; col -= 1) {
            for (let row = 0; row <= col; row++) {
                let idx = Util.iterateTriangle(col, row);
            }
        }
     * ```
     */
    static iterateTriangle(column: number, row: number): number {
        return GeonMath.stack(column) + row;
    }

    static getTriangleBase(triangle: MultiVector3, size: number) {
        let base = MultiVector3.new(size);
        let basecolumn = size - 1;
        let i = 0;
        for (let row = 0; row <= basecolumn; row++) {
            let idx = Util.iterateTriangle(basecolumn, row);
            base.set(i, triangle.get(idx));
            i++;
        }
        return base;
    }

    static getTriangleLeft(triangle: MultiVector3, size: number) {
        // prepare
        let left = MultiVector3.new(size);

        // the two edges of the triangle opposite to the base are the vertices we are interested in
        let i = 0;
        for (let col = size - 1; col > -1; col -= 1) {
            left.set(i, triangle.get(Util.iterateTriangle(col, 0)));
            i++;
        }

        return left;
    }

    static getTriangleRight(triangle: MultiVector3, size: number) {
        // prepare
        let right = MultiVector3.new(size);

        // the two edges of the triangle opposite to the base are the vertices we are interested in
        let i = 0;
        for (let col = size - 1; col > -1; col -= 1) {
            right.set(i, triangle.get(Util.iterateTriangle(col, col)));
            i++;
        }

        return right;
    }
}
