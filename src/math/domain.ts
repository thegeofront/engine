// domain.ts
// 
// author: Jos Feenstra
// purpose: general representation of a domain / range / bound of numbers
//          

import { Vector2, Vector3 } from "./Vector";

export class Domain {

    // note: including t0, including t1

    readonly t0: number;
    readonly t1: number;

    constructor(t0: number = 0.0, t1: number = 1.0) {
        if (t0 > t1) console.error("created a domain with negative size.");
        if (t0 == t1) console.warn("created a domain with size is 0.0. could cause problems");
        this.t0 = t0;
        this.t1 = t1;
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

    static new(x0: number, x1: number, y0: number, y1: number) : Domain2 {
        return new Domain2(new Domain(x0, x1), new Domain(y0, y1));
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

    static new(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) : Domain3 {
        return new Domain3(new Domain(x0, x1), new Domain(y0, y1), new Domain(z0, z1));
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
        return new Vector3(this.x.elevate(t.x), this.y.elevate(t.y), this.x.elevate(t.z));
    }

    remap(value: Vector3, other: Domain3 = new Domain3()) : Vector3 {
        // normalize a value, then elevate it to a new domain
        let norm = this.normalize(value);
        return other.elevate(norm);
    }
}