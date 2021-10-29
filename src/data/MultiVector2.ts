import { Geometry } from "../geometry/Geometry";
import { Matrix4 } from "../math/Matrix4";
import { Vector2 } from "../math/Vector2";
import { FloatMatrix } from "./FloatMatrix";
import { MultiVector3 } from "./MultiVector3";

export class MultiVector2 extends Geometry {

    private constructor(private _matrix: FloatMatrix) {
        super();
    }

    get data() {
        return this._matrix.data;
    }

    static new(length: number): MultiVector2 {
        return new MultiVector2(new FloatMatrix(2, length));
    }

    static fromList(vecs: Vector2[]): MultiVector2 {
        let length = vecs.length;
        let multiVector = MultiVector2.new(length);
        for (let i = 0; i < vecs.length; i++) {
            multiVector._matrix.set(i, 0, vecs[i].x);
            multiVector._matrix.set(i, 1, vecs[i].y);
        }
        return multiVector;
    }

    static fromMatrix(data: FloatMatrix): MultiVector2 {
        if (data.width != 2) {
            throw new Error("incorrect.");
        }
        return new MultiVector2(data);
    }

    static fromData(data: number[] | Float32Array): MultiVector2 {
        let multi = MultiVector2.new(data.length / 2);
        multi._matrix.fillWith(data);
        return multi;
    }

    // pass through

    private get width(): number {
        return this._matrix.width;
    }

    private get height(): number {
        return this._matrix.height;
    }

    public get dimensions(): number {
        return this._matrix.width;
    }

    public get count(): number {
        return this._matrix.height;
    }

    get matrix(): FloatMatrix {
        return this._matrix;
    }

    forEach(callbackfn: (value: Vector2, index: number) => void): MultiVector2 {
        for (let i = 0; i < this.count; i++) {
            let vec = this.get(i);
            callbackfn(vec, i);
            this.set(i, vec);
        }
        return this;
    }

    map(callbackfn: (value: Vector2, index: number) => Vector2): MultiVector2 {
        let result = this.clone();

        for (let i = 0; i < this.count; i++) {
            let vec = this.get(i);
            result.set(i, callbackfn(vec, i));

        }
        return result;
    }

    take(indices: number[]): MultiVector2 {
        // create a new floatarray
        const count = indices.length;
        let array = MultiVector2.new(count);
        for (let i = 0; i < count; i++) {
            let getIndex = indices[i];
            array.set(i, this.get(getIndex));
        }
        return array;
    }

    remove(indices: number[]): MultiVector2 {
        // create a new floatarray
        const count = this.count - indices.length;
        let array = MultiVector2.new(count);
        for (let i = 0, j = 0; i < this.count; i++) {
            if (indices.includes(i)) {
                continue;
            }
            array.set(j, this.get(i));
            j++
        }
        return array;
    }

    set(i: number, vec: Vector2) {
        this._matrix.data[i * this._matrix.width + 0] = vec.x;
        this._matrix.data[i * this._matrix.width + 1] = vec.y;
    }

    setXY(i: number, x: number, y: number) {
        this._matrix.data[i * this._matrix.width + 0] = x;
        this._matrix.data[i * this._matrix.width + 1] = y;
    }

    get(i: number): Vector2 {
        return new Vector2(
            this._matrix.data[i * this.width + 0],
            this._matrix.data[i * this.width + 1],
        );
    }

    /**
     *  This is a Slice! Edit the matrix = edit the MultiVector!
     */
    toMatrixSlice() {
        return this._matrix;
    }

    toList(): Vector2[] {
        let vecs: Vector2[] = [];
        for (let i = 0; i < this.height; i++) {
            vecs.push(this.get(i));
        }
        return vecs;
    }

    to3D(): MultiVector3 {
        let vecs = MultiVector3.new(this.count);
        for (let i = 0; i < this.count; i++) {
            let row = this._matrix.getRow(i);
            vecs.setXYZ(i, row[0], row[1], 0);
        }
        return vecs;
    }

    clone(): MultiVector2 {
        let clone = MultiVector2.new(this.count);
        clone._matrix = this._matrix.clone();
        return clone;
    }

    transform(m: Matrix4): MultiVector2 {
        this._matrix.mul(m);
        return this;
    }

    transformed(m: Matrix4): MultiVector2 {
        let clone = MultiVector2.new(this.count);
        clone._matrix = this._matrix.mul(m);
        return clone;
    }
}
