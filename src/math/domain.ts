// domain.ts
// 
// author: Jos Feenstra
// purpose: general representation of a domain / range / bound of numbers
//          

import { Vector2Array, Vector3Array } from "./array";
import { Matrix, Matrix4 } from "./matrix";
import { Vector2, Vector3 } from "./vector";

export class Domain {

    // note: including t0, including t1

    t0: number;
    t1: number;

    constructor(t0: number = 0.0, t1: number = 1.0) {
        if (t0 > t1) console.error("created a domain with negative size.");
        if (t0 == t1) console.warn("created a domain with size is 0.0. could cause problems");
        this.t0 = t0;
        this.t1 = t1;
    }    

    static fromRadius(r: number) : Domain {
        return new Domain(-r, r);
    }

    static fromInclude(data: Float32Array) : Domain{
        // create a new domain which bounds all parsed values
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;

        for (let i = 0 ; i < data.length; i++) {
            if (data[i] < min)
                min = data[i];
            if (data[i] > max)
                max = data[i];
        }
        return new Domain(min, max);
    }

    offset(t0Offset: number, t1Offset: number) {
        this.t0 += t0Offset;
        this.t1 += t1Offset;
        return this;
    }

    includes(value: number) : boolean {
        // note: including t0, including t1
        return value >= this.t0 && value <= this.t1;
    }

    size() : number {
        // the size or length of this domain
        return this.t1 - this.t0;
    }

    normalize(value: number) : number {
        // normalize a parameter
        return (value - this.t0) / this.size();
    }

    elevate(t: number) : number {
        // elevate a normalized parameter to the parameter space of this domain
        return t * this.size() + this.t0
    }

    remap(value: number, other: Domain = new Domain()) : number {
        // normalize a value, then elevate it to a new domain
        let norm = this.normalize(value);
        return other.elevate(norm);
    }

    *iter(count: number) : Generator<number> {
        // iterate over this Domain 'count' number of times 
        let step = this.size() / count; 
        for(let i = this.t0; i < this.t1; i += step) {
            yield i;
        }        
    }

    *iterStep(step: number) : Generator<number> {
        // iterate over this domain with a stepsize of 'step'
        for(let i = this.t0; i < this.t1; i += step) {
            yield i;
        }      
    }
}

export class Domain2 {

    // 2D domain. logic cascades down to the 1 dimentional Domain. 

    x: Domain;
    y: Domain;

    constructor(x: Domain = new Domain(), y: Domain = new Domain()) {
        this.x = x;
        this.y = y;
    }

    static fromRadius(r: number) : Domain2 {
        return new Domain2(Domain.fromRadius(r), Domain.fromRadius(r));
    }

    static fromBounds(x0: number, x1: number, y0: number, y1: number) : Domain2 {
        return new Domain2(new Domain(x0, x1), new Domain(y0, y1));
    }

    static fromInclude(data: Vector2Array | Matrix) : Domain2 {
        // note : could be quicker by going verbose, this now iterates over data 4 times
        return new Domain2(
            Domain.fromInclude(data.getColumn(0)),
            Domain.fromInclude(data.getColumn(1)),
        );
    }

    offset(xXyYoffset: number[]) {
        let off = xXyYoffset
        if (off.length != 4) throw "need 4 values";

        this.x.offset(off[0], off[1]);
        this.y.offset(off[2], off[3]);
        return this;
    }

    includes(value: Vector2) : boolean {
        // note: including t0, including t1
        return this.x.includes(value.x) && this.y.includes(value.y);
    }

    size() : Vector2 {
        // the size or length of this domain
        return new Vector2(this.x.size(), this.y.size());
    }

    normalize(value: Vector2) : Vector2 {
        // normalize a parameter
        return new Vector2(this.x.normalize(value.x), this.y.normalize(value.y));
    }

    elevate(t: Vector2) : Vector2 {
        // elevate a normalized parameter to the parameter space of this domain
        return new Vector2(this.x.elevate(t.x), this.y.elevate(t.y));
    }

    remap(value: Vector2, other: Domain2 = new Domain2()) : Vector2 {
        // normalize a value, then elevate it to a new domain
        let norm = this.normalize(value);
        return other.elevate(norm);
    }
    
    corners(matrix: Matrix4 = Matrix4.newIdentity()) : Vector2[] {
        // render the extends of this boundary / domain
        let dim = 2;
        let corners = 2**dim;
        let data = [];
        for(let x of [this.x.t0, this.x.t1])
        {
            for(let y of [this.y.t0, this.y.t1])
            {
                data.push(new Vector2(x,y));
            }
        }
        return data;
    }

    // *iter(countX: number, countY: number) : Generator<Vector2, void, unknown> {
    //     // iterate over this Domain 'count' number of times 
    //     for (const y in this.y.iter(countY)) {
    //         for (const x in this.x.iter(countX)) {
    //             // yield new Vector2(x, y);
    //         }
    //     }
    // }

    // *iterStep(sizeX: number, sizeY: number) : Generator<Vector2, void, unknown> {
    //     // iterate over this domain with a stepsize of 'step'
    //     for (let y in this.y.iterStep(sizeY)) {
    //         for (let x in this.x.iterStep(sizeX)) {
    //             // yield new Vector2(x, y);
    //         }
    //     }    
    // }
}

export class Domain3 {

    x: Domain;
    y: Domain;
    z: Domain;

    constructor(x: Domain = new Domain(), y: Domain = new Domain(), z: Domain = new Domain()) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromBounds(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) : Domain3 {
        return new Domain3(new Domain(x0, x1), new Domain(y0, y1), new Domain(z0, z1));
    }

    static fromRadius(r: number) : Domain3 {
        return new Domain3(Domain.fromRadius(r), Domain.fromRadius(r), Domain.fromRadius(r));
    }

    static fromRadii(rx: number, ry: number, rz: number) : Domain3 {
        return new Domain3(
            Domain.fromRadius(rx), 
            Domain.fromRadius(ry), 
            Domain.fromRadius(rz)
        );
    }

    static fromInclude(data: Vector3Array) : Domain3 {
        // note : could be quicker by going verbose, this now iterates over data 6 times
        return new Domain3(
            Domain.fromInclude(data.getColumn(0)),
            Domain.fromInclude(data.getColumn(1)),
            Domain.fromInclude(data.getColumn(2)),
        );
    }

    offset(xXyYoffset: number[]) {
        let off = xXyYoffset
        if (off.length != 6) throw "need 6 values";

        this.x.offset(off[0], off[1]);
        this.y.offset(off[2], off[3]);
        this.z.offset(off[4], off[5]);
        return this;
    }

    includes(value: Vector3) : boolean {
        // note: including t0, including t1
        return this.x.includes(value.x) && this.y.includes(value.y) && this.z.includes(value.z);
    }

    size() : Vector3 {
        // the size or length of this domain
        return new Vector3(this.x.size(), this.y.size(), this.z.size());
    }

    normalize(value: Vector3) : Vector3 {
        // normalize a parameter
        return new Vector3(this.x.normalize(value.x), this.y.normalize(value.y), this.z.normalize(value.z));
    }

    elevate(t: Vector3) : Vector3 {
        // elevate a normalized parameter to the parameter space of this domain
        return new Vector3(this.x.elevate(t.x), this.y.elevate(t.y), this.z.elevate(t.z));
    }

    remap(value: Vector3, other: Domain3 = new Domain3()) : Vector3 {
        // normalize a value, then elevate it to a new domain
        let norm = this.normalize(value);
        return other.elevate(norm);
    }

    remapAll(values: Vector3Array, other: Domain3 = new Domain3()) : Vector3Array {
        // normalize a value, then elevate it to a new domain
        let newValues = new Vector3Array(values.count());
        for(let i = 0 ; i < values.count(); i++) {
            let norm = this.normalize(values.getVector(i));
            newValues.setVector(i, other.elevate(norm));
        }
        return newValues;
    }

    corners(matrix: Matrix4) : Vector3[] {
        // render the extends of this boundary / domain
        let dim = 3;
        let corners = 2 ^ dim;
        let data = [];
        for(let x of [this.x.t0, this.x.t1])
        {
            for(let y of [this.y.t0, this.y.t1])
            {
                for(let z of [this.z.t0, this.z.t1])
                {
                    data.push(new Vector3(x,y,z));
                }
            }
        }
        return data;
    }
}