export class Vector3
{
    readonly x: number;
    readonly y: number;
    readonly z: number;
    constructor(x : number, y : number, z: number)
    {
        this.x = x;
        this.y = y;
        this.z = z;   
    }

    static fromArray(a: Array<number>) : Vector3 {
        return new Vector3(a[0], a[1], a[2]);
    }

    toString() : string
    {
        return `Vector2 (x: ${this.x} y: ${this.y} z: ${this.z})`;
    }
}