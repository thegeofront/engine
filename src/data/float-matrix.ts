import { outerProduct } from "@tensorflow/tfjs";

// generic all-pupose matrix of floats
export class FloatMatrix {

    data: Float32Array;
    _width: number;
    _height: number;

    constructor(height: number, width: number, data: number[] = []) {
        
        this._height = height;
        this._width = width;
        this.data = new Float32Array(this._width * this._height);
        if (data == [] || data.length == 0)
            this.fill(0);
        else
            this.setData(data);    
    }

    clone() : FloatMatrix {
        let clone = new FloatMatrix(this._height, this._width);
        for (let i = 0 ; i < this.data.length; i++) {
            clone.data[i] = this.data[i]
        }
        return clone;  
    }

    setData(data: number[]) {
        if (data.length != (this._height * this._width))
            throw "data.length does not match width * height " + data.length.toString();
        this.data.set(data);
    }

    count() {
        // number of entries / rows.
        // when derrived classes ask for 'how many of x?' they usually mean this.
        return this._height;
    }

    getDimensions() : [number, number] {
        return [this._height, this._width];
    }

    fill(value: number) {

        let size = this._height * this._width
        for (let i = 0; i < size; i++)
        {
            this.data[i] = value;
        }
    }

    fillWith(data: number[], valuesPerEntry: number=this._width) {

        // values per entry can be used to setData which is not of the same shape.
        let vpe = valuesPerEntry;
        if (vpe > this._width) throw "values per entry is larger than this._width. This will spill over.";
        for (let i = 0 ; i < this._height; i++)
        {   
            for(let j = 0 ; j < vpe; j++) {
                this.set(i, j, data[i*vpe + j]);
            }
        }  
    }

    get(i: number, j: number) : number {
        return this.data[i * this._width + j]
    }

    getRow(i: number) : Float32Array {
        // if (i < 0 || i > this.height) throw "column is out of bounds for FloatArray"
        let data = new Float32Array(this._width);
        for (let j = 0; j < this._width; j++) {
            data[j] = this.get(i, j);
        }
        return data;
    }

    getColumn(j: number) : Float32Array {
        // if (j < 0 || j > this.width) throw "column is out of bounds for FloatArray"
        let data = new Float32Array(this._height);
        for (let i = 0; i < this._height; i++) {
            let index = i * this._width + j;
            data[i] = this.data[index];       
        }
        return data;
    }

    set(i: number, j : number, value: number) {

        this.data[i * this._width + j] = value;
    }

    setRow(rowIndex: number, row: number[] | Float32Array) {
        // if (this.width != row.length) throw "dimention of floatarray is not " + row.length;
        for(let j = 0; j < this._width; j++) {
            this.set(rowIndex, j, row[j]);
        }
    }

    forEachValue(callbackfn: (value: number, index: number) => number) : FloatMatrix {
        
        for(let i = 0 ; i < this.data.length; i++) {
            this.data[i] = callbackfn(this.data[i], i);
        }
        return this;
    }

    takeRows(indices: number[]) : FloatMatrix {

        // create a new floatarray
        const count = indices.length
        let array = new FloatMatrix(count, this._width);
        for (let i = 0 ; i < count; i++) {
            let getIndex = indices[i];
            array.setRow(i, this.getRow(getIndex));
        }
        return array;
    }

    // generalized multiplication
    multiply(b: FloatMatrix) : FloatMatrix {

        let a = this;
        if (b._width !== a._height) {
            throw new Error('Columns in A should be the same as the number of rows in B');
        }
        var product = new FloatMatrix(a._height, b._width);

        for (var i = 0; i < product._height; i++) {
            for (var j = 0; j < b._width; j++) {
                for (var k = 0; k < a._width; k++) {
                    product.set(i, j, product.get(i, j) + a.get(i, k) * b.get(k, j));
                }
            }
        }
        return product;
    }

    static fromNative(native: number[][]) : FloatMatrix {
        // assume all subarrays have the same shape!!
        let height = native.length;
        let width = native[0].length;
        let matrix = new FloatMatrix(height, width);
        for (var i = 0; i < native.length; i++) {
            for (var j = 0; j < native[0].length; j++) {
                matrix.set(i, j, native[i][j]);
            }
        }
        return matrix; 
    }

    toNative() : number[][] {
        let native: number[][] = []
        for (var i = 0; i < this._height; i++) {
            native[i] = [];
            for (var j = 0; j < this._width; j++) {
                native[i][j] = this.get(i, j);
            }
        }
        return native;
    }
}

