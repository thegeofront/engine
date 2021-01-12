export class Vector2
{
    readonly x: number;
    readonly y: number;
    constructor(x : number, y : number)
    {
        this.x = x;
        this.y = y;
        
    }

    static fromArray(a: Array<number>) : Vector2 {
        return new Vector2(a[0], a[1]);
    }

    toString() : string
    {
        return "Vector2 | x : ${x} y : ${y}";
    }
}