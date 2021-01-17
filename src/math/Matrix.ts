// author: Jos Feenstra
// simple generic matrix for easy lookup

export class GeneralMatrix {

    data: Float32Array;
    width: number;
    height: number;

    constructor(width: number, height: number, data: number[] = []) {
        
        this.width = width;
        this.height = height;
        this.data = new Float32Array(this.width * this.height);
        if (data == [])
            this.fill(0);
        else
            this.setData(data);    
    }

    setData(data: number[]) {

        if (data.length != (this.height * this.width))
            throw "data.length does not match width * height ";

        for (let i = 0 ; i < data.length; i++)
        {
            this.data[i]
            this.data[i] = data[i];
        }
    }

    fill(value: number) {

        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                this.set(x, y, value);
            }
        }
    }

    get(x: number, y: number) : number {

        return this.data[y * this.width + x]
    }

    set(x: number, y: number, value: number) {

        this.data[y * this.width + x] = value;
    }

    // operators
    div(value: number) : GeneralMatrix {

        for (let i = 0 ; i < this.data.length; i++)
        {
            this.data[i] /= value;
        }
        return this;
    }

    scale(value: number) : GeneralMatrix {
        
        for (let i = 0 ; i < this.data.length; i++)
        {
            this.data[i] *= value;
        }
        return this;
    }

}