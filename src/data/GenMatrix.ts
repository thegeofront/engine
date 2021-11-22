import { D8 } from "../math/Directions";

/**
 * Generic matrix
 */
export class GenMatrix<T> {
    private constructor(public readonly width: number, public readonly height: number, public data: T[]) {}

    static new<T>(width: number, height: number) {
        let data = new Array<T>(width * height);
        return new GenMatrix<T>(width, height, data);
    }

    get(x: number, y: number): T {
        return this.data[y * this.width + x];
    }

    set(x: number, y: number, item: T) {
        this.data[y * this.width + x] = item;
    }

    /**
     * protected by a range check
     */
    tryGet(x: number, y: number) {
        if (this.inRange(x, y)) {
            return this.get(x, y);
        } else {
            return undefined;
        }
    }

    /**
     * protected by a range check
     */
    trySet(x: number, y: number, cell: T) {
        if (this.inRange(x, y)) {
            return this.set(x, y, cell);
        } else {
            return undefined;
        }
    }

    inRange(x: number, y: number): boolean {
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
    }

    getNbCells(cell: number) {
        let nbs = new Array<number>();

        if (cell >= this.width * this.height) return nbs;

        // make sure we dont add out of bound indices
        if (cell % this.width != 0) nbs.push(cell - 1);
        if ((cell + 1) % this.width != 0) nbs.push(cell + 1);
        if (cell - this.width > 0) nbs.push(cell - this.width);
        if (cell + this.width < this.width * this.height) nbs.push(cell + this.width);

        return nbs;
    }

    getNbIndices8(cell: number) {
        return this.getNbIndices8Delta(cell).map((i) => cell + i);
    }

    getNbIndices8Delta(cell: number) {
        let deltas = new Array<number>();
        let size = this.width * this.height;
        if (cell >= size) return deltas;

        let hasRight = cell % this.width != 0;
        let hasLeft = (cell + 1) % this.width != 0;
        let hasTop = cell - this.width > 0;
        let hasBot = cell + this.width < size;

        if (hasLeft) deltas.push(1);
        if (hasTop && hasLeft) deltas.push(-this.width + 1);
        if (hasTop) deltas.push(-this.width);
        if (hasTop && hasRight) deltas.push(-this.width - 1);
        if (hasRight) deltas.push(-1);
        if (hasBot && hasRight) deltas.push(this.width - 1);
        if (hasBot) deltas.push(this.width);
        if (hasBot && hasLeft) deltas.push(this.width + 1);

        return deltas;
    }

    /**
     * NOTE this is not allowed on images smaller than 3x3,
     * and this does not work for non-neighbors. so DONT use this to blindly check if two cells are neighbors...
     */
    getDirectionFromDifference(delta: number): D8 | undefined {
        if (delta === 1) return D8.Right;
        if (delta === -this.width + 1) return D8.UpRight;
        if (delta === -this.width) return D8.Up;
        if (delta === -this.width - 1) return D8.UpLeft;
        if (delta === -1) return D8.Left;
        if (delta === this.width - 1) return D8.DownLeft;
        if (delta === this.width) return D8.Down;
        if (delta === this.width + 1) return D8.DownRight;

        return undefined;
    }
}